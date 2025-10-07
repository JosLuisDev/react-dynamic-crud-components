// src/components/DynamicSidebar.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { DynamicSidebarProps, Column } from '../../types';
import styles from './DynamicSidebar.module.scss';
import { ValidationProps } from '../../types';

interface ColumnOptionsState {
  [id: string]: { value: string; label: string }[];
}

const DynamicSidebar: React.FC<DynamicSidebarProps> = ({
  isOpen,
  onClose,
  title,
  columns,
  onSaveNew, // Agregado: para manejar el guardado de nuevos registros
  onSaveEdit, // Agregado: para manejar el guardado de ediciones
  initialData, // Agregado: para recibir la data inicial
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [columnOptions, setColumnOptions] = useState<ColumnOptionsState>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  // --- NUEVOS ESTADOS PARA VALIDACIÓN ---
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({}); // Validar si el usuario ha interactuado con el campo

  const validateField = useCallback((id: string, value: any, column: Column): string => {
    const rules: ValidationProps = column.htmlInputProps || {};
    
    if (rules.required && (value === null || value === undefined || value === '')) {
      return 'Este campo es requerido.';
    }

    if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
      return `Debe tener al menos ${rules.minLength} caracteres.`;
    }

    if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
      return `No puede tener más de ${rules.maxLength} caracteres.`;
    }

    if (rules.min !== undefined && typeof value === 'number' && value < Number(rules.min)) {
      return `El valor mínimo es ${rules.min}.`;
    }

    if (rules.max !== undefined && typeof value === 'number' && value > Number(rules.max)) {
      return `El valor máximo es ${rules.max}.`;
    }

    if (rules.pattern && typeof value === 'string' && !new RegExp(rules.pattern).test(value)) {
      return column.errorOptionMessage || 'El formato no es válido.';
    }

    return ''; // No hay errores
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Determina si estamos en modo "Editar" por la existencia de initialData
      const isEditMode = !!initialData;

      // Pre-llena el formulario si es modo Editar, o lo deja vacío si es modo Agregar
      setFormData(isEditMode ? initialData : {});

      // Resetea los estados de opciones y carga
      setColumnOptions({});
      setLoading({});
      // --- RESETEAR ESTADOS DE VALIDACIÓN AL ABRIR ---
      setErrors({});
      setTouched({});

      if (isEditMode) {
        // --- ESTAMOS EN MODO EDICIÓN ---
        columns.forEach((col) => {
          if (col.type === 'SELECT') {
            if (col.isEditable) {
              // 1. Si el select ES EDITABLE:
              // Hacemos fetch para cargar todas sus posibles opciones.
              // Construimos los valores de las dependencias a partir de initialData.
              const dependentValues: Record<string, any> = {};
              col.dependentColumns?.forEach((depId) => {
                dependentValues[depId] = initialData[depId];
              });

              // Verificamos que todas las dependencias tengan valor en initialData antes de hacer el fetch
              const allDependenciesMet = col.dependentColumns?.every(
                (depId) => !!initialData[depId]
              );

              if (!col.dependentColumns || col.dependentColumns.length === 0 || allDependenciesMet) {
                fetchData(col, dependentValues);
              }

            } else {
              // 2. Si el select NO ES EDITABLE:
              // No hacemos fetch. Creamos una opción "falsa" solo para mostrar el valor actual.
              const initialValue = initialData[col.id];
              if (initialValue !== undefined && initialValue !== null) {
                setColumnOptions((prev) => ({
                  ...prev,
                  [col.id]: [{ value: initialValue, label: String(initialValue) }],
                }));
              }
            }
          }
        });
      } else {
        // --- ESTAMOS EN MODO AGREGAR ---
        // Buscamos y cargamos solo los selects que no dependen de nadie para empezar.
        const independentSelects = columns.filter(
          (col) => col.type === 'SELECT' && (!col.dependentColumns || col.dependentColumns.length === 0)
        );

        independentSelects.forEach((col) => {
          if (col.requestUrl) {
            fetchData(col);
          }
        });
      }
    }
  }, [isOpen, initialData]);

  useEffect(() => {
  const isEditMode = !!initialData;
  const columnsToValidate = isEditMode ? columns : columns.filter(col => col.showToAddNew);

  // Condición 1: Revisa si hay algún mensaje de error activo.
  const hasActiveErrors = Object.values(errors).some(errorMessage => errorMessage !== '');

  if (hasActiveErrors) {
    setIsFormValid(false);
    return; // Si hay errores, el formulario es inválido. Fin.
  }

  // Condición 2: Si no hay errores, revisa que todos los campos requeridos estén llenos.
  const requiredFieldsAreFilled = columnsToValidate
    .filter(c => c.htmlInputProps?.required)
    .every(c => {
        const value = formData[c.id];
        return value !== null && value !== undefined && value !== '';
    });

  // El formulario es válido si y solo si no hay errores Y los campos requeridos están llenos.
  setIsFormValid(requiredFieldsAreFilled);

}, [formData, errors, columns, initialData]);

  const fetchData = async (column: Column, dependentValues?: Record<string, any>) => {
    if (!column.requestUrl) {
      console.error(`No requestUrl defined for column ${column.id}`);
      return;
    }

    setLoading((prev) => ({ ...prev, [column.id]: true }));

    let requestUrl = column.requestUrl;
    if (dependentValues) {
      const values = Object.values(dependentValues).join('/');
      requestUrl = `${requestUrl}/${values}`;
    }

    try {
      const response = await fetch(requestUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      const options = data.map((item: any) => ({
        value: item.id || '',
        label: item.value || '',
      }));

      setColumnOptions((prev) => ({
        ...prev,
        [column.id]: options,
      }));
    } catch (error) {
      console.error(`Error fetching data for ${column.label}:`, error);
      setColumnOptions((prev) => ({
        ...prev,
        [column.id]: [],
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [column.id]: false }));
    }
  };

  const handleInputChange = (id: string, value: any) => {
    const column = columns.find((col) => col.id === id);
    if (!column) return;
    
    // Actualiza el valor del formulario
    setFormData((prev) => ({ ...prev, [id]: value }));

    // --- VALIDACIÓN EN TIEMPO REAL ---
    const error = validateField(id, value, column);
    setErrors(prev => ({ ...prev, [id]: error }));

    if (column.type === 'SELECT') {
      const dependentColumnsToClear = columns.filter((col) => col.dependentColumns?.includes(id));
      dependentColumnsToClear.forEach((depCol) => {
        setFormData((prev) => ({ ...prev, [depCol.id]: '' }));
        setColumnOptions((prev) => ({ ...prev, [depCol.id]: [] }));
      });
      // Recargamos las opciones de las columnas dependientes si se ha seleccionado un valor
      if (value) {
        // Recorremos las columnas que dependen de esta
        dependentColumnsToClear.forEach((depCol) => {
          // Construimos los valores actuales de las dependencias
          const dependentValues: Record<string, any> = {};
          depCol.dependentColumns?.forEach((depId) => {
            dependentValues[depId] = id === depId ? value : formData[depId];
          });
          // Verificamos que todas las dependencias tengan valor antes de hacer el fetch
          const allDependenciesMet = depCol.dependentColumns?.every(
            (depId) => !!(id === depId ? value : formData[depId])
          );
          // Si todas las dependencias se cumplen, hacemos el fetch
          if (allDependenciesMet) {
            fetchData(depCol, dependentValues);
          }
        });
      }
    }
  };

  const handleBlur = (id: string) => {
    setTouched(prev => ({ ...prev, [id]: true }));
    const column = columns.find((col) => col.id === id);
    if (column) {
      const error = validateField(id, formData[id], column);
      setErrors(prev => ({ ...prev, [id]: error }));
    }
  };

  const handleSave = () => {

    if (!isFormValid) {
      return;
    }

    // Determina si estamos en modo "Editar" por la existencia de initialData
    if (initialData) {
      // Modo Edición
      onSaveEdit(formData);
    } else {
      // Modo Agregar
      onSaveNew(formData);
    }
    onClose();
  };

  const renderInput = (column: Column) => {
    const { id, label, type, errorOptionMessage, htmlInputProps, dependentColumns, isEditable } = column;
    const currentOptions = columnOptions[id] || [];
    const isSelect = type === 'SELECT';
    const isFetching = !!loading[id];
    const showProgress = isSelect && isFetching;

    // Determina si estamos en modo "Editar" por la existencia de initialData
    const isEditMode = !!initialData;

    let dependenciesMet = true;
    if (isSelect && dependentColumns && dependentColumns.length > 0) {
      dependenciesMet = dependentColumns.every(depId => !!formData[depId]);
    }

    // 1. (Estamos en modo Edición Y la columna NO es editable)
    // 2. O si está cargando datos.
    // 3. O si sus dependencias no se han cumplido.
    const isDisabled = (isEditMode && !isEditable) || isFetching || !dependenciesMet;

    // Nueva lógica para el label flotante
    const isFilled = !!formData[id] || isFetching;
    const hasError = touched[id] && !!errors[id];

    const formatDateTimeForInput = (dateTimeString: string): string => {
      if (!dateTimeString) return '';
      try {
        // El formato requerido es YYYY-MM-DDTHH:mm
        // El método .slice(0, 16) corta el string ISO ("2025-09-10T12:46:41.873Z")
        // para obtener justo lo que necesitamos ("2025-09-10T12:46")
        const date = new Date(dateTimeString);
        // Ajustamos por la zona horaria local para evitar corrimientos de fecha/hora
        const timezoneOffset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - timezoneOffset);
        return localDate.toISOString().slice(0, 16);
      } catch (error) {
        console.error('Invalid datetime format:', dateTimeString);
        return '';
      }
    };

    switch (type) {
        case 'TEXT':
        case 'NUMBER':
        case 'DATE':
            return (
                <div key={id} className={`${styles.formGroup} ${isFilled ? styles.fieldFilled : ''}`}>
                    {/* --- INICIA NUEVO CONTENEDOR --- */}
                    <div className={styles.inputWrapper}>
                        <input
                            type={type}
                            id={id}
                            className={`${styles.inputField} ${isDisabled ? styles.inputFieldDisabled : ''} ${hasError ? styles.inputError : ''}`}
                            value={formData[id] || ''}
                            onChange={(e) => handleInputChange(id, e.target.value)}
                            onBlur={() => handleBlur(id)}
                            disabled={isDisabled}
                            placeholder=" "
                            {...htmlInputProps}
                        />
                        <label htmlFor={id} className={styles.label}>{label}</label>
                    </div>
                    {/* --- TERMINA NUEVO CONTENEDOR --- */}
                    {hasError && <span className={styles.errorMessage}>{errors[id]}</span>}
                </div>
            );
        case 'DATETIME-LOCAL':
            return (
                <div key={id} className={`${styles.formGroup} ${isFilled ? styles.fieldFilled : ''}`}>
                    {/* --- INICIA NUEVO CONTENEDOR --- */}
                    <div className={styles.inputWrapper}>
                        <input
                            type={type}
                            id={id}
                            className={`${styles.inputField} ${isDisabled ? styles.inputFieldDisabled : ''} ${hasError ? styles.inputError : ''}`}
                            value={formatDateTimeForInput(formData[id] || '')}
                            onChange={(e) => handleInputChange(id, e.target.value)}
                            onBlur={() => handleBlur(id)}
                            disabled={isDisabled}
                            placeholder=" "
                            {...htmlInputProps}
                        />
                        <label htmlFor={id} className={styles.label}>{label}</label>
                    </div>
                    {/* --- TERMINA NUEVO CONTENEDOR --- */}
                    {hasError && <span className={styles.errorMessage}>{errors[id]}</span>}
                </div>
            );
        case 'SELECT':
            return (
                <div key={id} className={`${styles.formGroup} ${styles.selectGroup} ${isFilled ? styles.fieldFilled : ''}`}>
                    {/* --- EN ESTE CASO, USAMOS EL .selectWrapper COMO NUESTRO CONTENEDOR --- */}
                    <div className={`${styles.selectWrapper} ${styles.inputWrapper}`}>
                        <select
                            id={id}
                            className={`${styles.selectField} ${styles.option} ${isDisabled ? styles.selectFieldDisabled : ''} ${hasError ? styles.inputError : ''}`}
                            value={formData[id] || ''}
                            onChange={(e) => handleInputChange(id, e.target.value)}
                            onBlur={() => handleBlur(id)}
                            disabled={isDisabled}
                            {...htmlInputProps}
                        >
                            <option value=""></option>
                            {currentOptions?.length > 0 &&
                                currentOptions.map((option) => (
                                    <option key={option.value} value={option.value} className={styles.option}>
                                        {option.label}
                                    </option>
                                ))}
                            {!isFetching && currentOptions.length === 0 && (
                                <option value="" disabled className={styles.option}>
                                    {errorOptionMessage}
                                </option>
                            )}
                        </select>
                        <label htmlFor={id} className={styles.label}>{label}</label>
                        {showProgress && <div className={styles.loaderBar}></div>}
                    </div>
                    {hasError && <span className={styles.errorMessage}>{errors[id]}</span>}
                </div>
            );
        default:
            return null;
    }
};

  const isEditMode = !!initialData;
  // Si NO es modo edición (es modo agregar), filtramos las columnas.
  // Si es modo edición, usamos todas las columnas como vienen.
  const columnsToRender = !isEditMode
    ? columns.filter(col => col.showToAddNew)
    : columns;

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.sidebar}>
      <header className={styles.header}>
        <h2 className={styles.headerTitle}>{title}</h2>
      </header>
      <hr className={styles.divider} />
      <main className={styles.formContainer}>
        <form className={styles.inputsContainer}>
          {columnsToRender.map(renderInput)}
        </form>
      </main>
      <footer className={styles.footer}>
        <button type="button" className={`${styles.button} ${styles.cancelButton}`} onClick={onClose}>
          Cancelar
        </button>
        <button
          type="submit"
          className={`${styles.button} ${isFormValid ? styles.saveButton : styles.saveButtonDisabled}`}
          disabled={!isFormValid}
          onClick={handleSave}>
          Guardar
        </button>
      </footer>
    </div>
  );
};

export default DynamicSidebar;