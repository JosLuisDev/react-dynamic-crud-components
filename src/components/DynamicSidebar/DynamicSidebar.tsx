// src/components/DynamicSidebar.tsx

import React, { useState, useEffect } from 'react';
import { DynamicSidebarProps, Column } from '../../types';
import styles from './DynamicSidebar.module.scss';

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

  useEffect(() => {
    if (isOpen) {
      // Determina si estamos en modo "Editar" por la existencia de initialData
      const isEditMode = !!initialData;

      // Pre-llena el formulario si es modo Editar, o lo deja vacío si es modo Agregar
      setFormData(isEditMode ? initialData : {});

      // Resetea los estados de opciones y carga
      setColumnOptions({});
      setLoading({});

      if (isEditMode) {
        // --- ESTAMOS EN MODO EDICIÓN ---
        columns.forEach((col) => {
          if (col.type === 'select') {
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
          (col) => col.type === 'select' && (!col.dependentColumns || col.dependentColumns.length === 0)
        );

        independentSelects.forEach((col) => {
          if (col.requestURl) {
            fetchData(col);
          }
        });
      }
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    const isEditMode = !!initialData;

    // En modo de edición, el botón de guardar siempre está habilitado.
    if (isEditMode) {
      setIsFormValid(true);
      return;
    }

    // 1. Filtramos para obtener solo las columnas que se muestran en "Agregar".
    const columnsForAddMode = columns.filter(col => col.showToAddNew);

    // 2. De esas columnas, obtenemos las que son obligatorias.
    const requiredColumns = columnsForAddMode.filter(
      col => col.htmlInputProps?.required
    );

    // 3. Verificamos que cada columna requerida tenga un valor en el formulario.
    const isValid = requiredColumns.every(col => {
      const value = formData[col.id];
      // Un valor es válido si no es nulo, indefinido o una cadena vacía.
      return value !== null && value !== undefined && value !== '';
    });

    setIsFormValid(isValid);
  }, [formData, columns, initialData]);

  const fetchData = async (column: Column, dependentValues?: Record<string, any>) => {
    if (!column.requestURl) {
      console.error(`No requestURl defined for column ${column.id}`);
      return;
    }

    setLoading((prev) => ({ ...prev, [column.id]: true }));

    let requestUrl = column.requestURl;
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
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    // Manejo de dependencias
    const currentColumn = columns.find((col) => col.id === id);
    // Si la columna actual es un select, limpiamos y recargamos las dependientes
    if (currentColumn && currentColumn.type === 'select') {
      // Limpiamos las columnas que dependen de esta
      const dependentColumnsToClear = columns.filter((col) =>
        col.dependentColumns?.includes(id)
      );
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

  const handleSave = () => {
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
    const isSelect = type === 'select';
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
      case 'text':
      case 'number':
      case 'date':
        return (
          <div key={id} className={`${styles.formGroup} ${isFilled ? styles.fieldFilled : ''}`}>
            <input
              type={type}
              id={id}
              className={`${styles.inputField} ${isDisabled ? styles.inputFieldDisabled : ''}`}
              value={formData[id] || ''}
              onChange={(e) => handleInputChange(id, e.target.value)}
              disabled={isDisabled}
              placeholder=""
              {...htmlInputProps}
            />
            <label htmlFor={id} className={styles.label}>{label}</label>
          </div>
        );
      case 'datetime-local':
        return (
          <div key={id} className={`${styles.formGroup} ${isFilled ? styles.fieldFilled : ''}`}>
            <input
              type={type}
              id={id}
              className={`${styles.inputField} ${isDisabled ? styles.inputFieldDisabled : ''}`}
              value={formatDateTimeForInput(formData[id] || '')}
              onChange={(e) => handleInputChange(id, e.target.value)}
              disabled={isDisabled}
              placeholder=""
              {...htmlInputProps}
            />
            <label htmlFor={id} className={styles.label}>{label}</label>
          </div>
        );
      case 'select':
        return (
          <div key={id} className={`${styles.formGroup} ${styles.selectGroup} ${isFilled ? styles.fieldFilled : ''}`}>
            <div className={styles.selectWrapper}>
              <select
                id={id}
                className={`${styles.selectField} ${styles.option} ${isDisabled ? styles.selectFieldDisabled : ''}`}
                value={formData[id] || ''}
                onChange={(e) => handleInputChange(id, e.target.value)}
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