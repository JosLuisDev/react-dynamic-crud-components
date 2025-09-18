// src/components/DynamicSidebar.tsx

import React, { useState, useEffect } from 'react';
import { DynamicSidebarProps, Column } from '../../types';
import styles from './DynamicSidebar.module.scss';
// Asegúrate de que los íconos estén disponibles como componentes SVG en tu proyecto
// import { ReactComponent as CloseIcon } from './close.svg';
// import { ReactComponent as CheckIcon } from './check.svg';

interface ColumnOptionsState {
  [id: string]: { value: string; label: string }[];
}

const DynamicSidebar: React.FC<DynamicSidebarProps> = ({
  isOpen,
  onClose,
  title,
  columns,
  onSave,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [columnOptions, setColumnOptions] = useState<ColumnOptionsState>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [fetchSuccess, setFetchSuccess] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({});
      setColumnOptions({});
      setFetchSuccess({});

      const independentSelects = columns.filter(
        (col) => col.type === 'select' && (!col.dependentColumns || col.dependentColumns.length === 0)
      );

      independentSelects.forEach((col) => {
        if (col.requestURl) {
          fetchData(col);
        }
      });
    }
  }, [isOpen]);

  const fetchData = async (column: Column, dependentValues?: Record<string, any>) => {
    if (!column.requestURl) {
      console.error(`No requestURl defined for column ${column.id}`);
      return;
    }

    setLoading((prev) => ({ ...prev, [column.id]: true }));
    setFetchSuccess((prev) => ({ ...prev, [column.id]: false }));

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
      setFetchSuccess((prev) => ({ ...prev, [column.id]: true }));
    } catch (error) {
      console.error(`Error fetching data for ${column.label}:`, error);
      setColumnOptions((prev) => ({
        ...prev,
        [column.id]: [],
      }));
      setFetchSuccess((prev) => ({ ...prev, [column.id]: false }));
    } finally {
      setLoading((prev) => ({ ...prev, [column.id]: false }));
    }
  };

  const handleInputChange = (id: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    const currentColumn = columns.find((col) => col.id === id);
    if (currentColumn && currentColumn.type === 'select') {
      const dependentColumnsToClear = columns.filter((col) =>
        col.dependentColumns?.includes(id)
      );
      dependentColumnsToClear.forEach((depCol) => {
        setFormData((prev) => ({ ...prev, [depCol.id]: '' }));
        setColumnOptions((prev) => ({ ...prev, [depCol.id]: [] }));
        setFetchSuccess((prev) => ({ ...prev, [depCol.id]: false }));
      });

      if (value) {
        dependentColumnsToClear.forEach((depCol) => {
          const dependentValues: Record<string, any> = {};
          depCol.dependentColumns?.forEach((depId) => {
            dependentValues[depId] = id === depId ? value : formData[depId];
          });
          
          const allDependenciesMet = depCol.dependentColumns?.every(
            (depId) => !!(id === depId ? value : formData[depId])
          );

          if (allDependenciesMet) {
            fetchData(depCol, dependentValues);
          }
        });
      }
    }
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const renderInput = (column: Column) => {
    const { id, label, type, errorOptionMessage, htmlInputProps } = column;
    const currentOptions = columnOptions[id] || [];
    const isSelect = type === 'select';
    const isFetching = !!loading[id];
    const isSuccessful = !!fetchSuccess[id];
    const showProgress = isSelect && isFetching;

    let isDisabled = false;
    if (isSelect) {
      if (isFetching) {
        isDisabled = true;
      } else if (column.dependentColumns && column.dependentColumns.length > 0) {
        const allDependenciesMet = column.dependentColumns?.every((depId: string) => !!formData[depId]);
        if (!allDependenciesMet) {
          isDisabled = true;
        }
      }
    }

    // Nueva lógica para el label flotante
    const isFilled = !!formData[id] || isFetching;

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
                {!isFetching && isSuccessful && currentOptions.length === 0 && (
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
          {columns.map(renderInput)}
        </form>
      </main>
      <footer className={styles.footer}>
        <button type="button" className={`${styles.button} ${styles.cancelButton}`} onClick={onClose}>
          Cancelar
        </button>
        <button type="submit" className={`${styles.button} ${styles.saveButton}`} onClick={handleSave}>
          Guardar
        </button>
      </footer>
    </div>
  );
};

export default DynamicSidebar;