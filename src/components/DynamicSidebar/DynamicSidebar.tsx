// src/components/DynamicSidebar.tsx

import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Divider,
  Button,
  TextField,
  MenuItem,
} from '@mui/material';
import { DynamicSidebarProps, Column } from '../../types';
import styles from './DynamicSidebar.module.css';

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

  useEffect(() => {
    if (isOpen) {
      setFormData({});
      setColumnOptions({});

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

    let requestUrl = column.requestURl;
    if (dependentValues) {
      const values = Object.values(dependentValues).join('/');
      requestUrl = `${requestUrl}/${values}`; // Corrección: Agrega la barra diagonal aquí
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

    const currentColumn = columns.find((col) => col.id === id);
    if (currentColumn && currentColumn.type === 'select') {
      const dependentColumnsToClear = columns.filter((col) =>
        col.dependentColumns?.includes(id)
      );
      dependentColumnsToClear.forEach((depCol) => {
        setFormData((prev) => ({ ...prev, [depCol.id]: '' }));
        setColumnOptions((prev) => ({ ...prev, [depCol.id]: [] }));
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
    const { id, label, type, options, requestURl, dependentColumns } = column;
    const currentOptions = columnOptions[id] || options;

    const isSelect = type === 'select';
    const isFetching = !!loading[id];
    
    // Condición para deshabilitar el input
    let isDisabled = false;
    if (isSelect) {
      // Deshabilitar si está cargando
      if (isFetching) {
        isDisabled = true;
      // Deshabilitar si es una columna dependiente y la columna padre no tiene valor
      } else if (dependentColumns && dependentColumns.length > 0) {
        const parentColumnId = dependentColumns[0];
        if (!formData[parentColumnId]) {
          isDisabled = true;
        }
      }
    }

    switch (type) {
      case 'text':
      case 'number':
      case 'date':
        return (
          <TextField
            key={id}
            label={label}
            variant="outlined"
            fullWidth
            margin="normal"
            type={type}
            slotProps={{
              inputLabel: {
                shrink: type === 'date' || !!formData[id],
              },
            }}
            value={formData[id] || ''}
            onChange={(e) => handleInputChange(id, e.target.value)}
          />
        );
      case 'select':
        return (
          <TextField
            key={id}
            select
            label={label}
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData[id] || ''}
            onChange={(e) => handleInputChange(id, e.target.value)}
            disabled={isDisabled}
          >
            {isFetching ? (
              <MenuItem disabled>Cargando...</MenuItem>
            ) : currentOptions?.length > 0 ? (
              currentOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No hay opciones disponibles</MenuItem>
            )}
          </TextField>
        );
      default:
        return null;
    }
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      classes={{ paper: styles.drawerPaper }}
    >
      <Box className={styles.mainContainer}>
        <Box className={styles.container}>
          <Typography variant="h6" className={styles.title}>
            {title}
          </Typography>
          <Divider />
          <Box className={styles.inputsContainer}>
            {columns.map(renderInput)}
          </Box>
        </Box>
        <Box className={styles.buttonsContainer}>
          <Button onClick={onClose} variant="outlined">
            Cancelar
          </Button>
          <Button onClick={handleSave} variant="contained">
            Guardar
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default DynamicSidebar;