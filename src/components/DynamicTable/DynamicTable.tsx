import React, { useState, useMemo, useRef, useEffect } from 'react';
import styles from './DynamicTable.module.scss';
import { Column, DynamicTableProps, RowData } from '../../types';

/**
 * Genera una clave única y estable para una fila de datos.
 * @param row El objeto de datos de la fila.
 * @param primaryKeyColumns Un array pre-filtrado de las columnas que son llaves primarias.
 * @returns Una cadena única como clave.
 */
const generateCompositeKey = (row: RowData, primaryKeyColumns: Column[]): string => {
  const keyParts = primaryKeyColumns.map(col => row[col.id]);
  return keyParts.join('_');
};

const DynamicTable: React.FC<DynamicTableProps> = ({ columns, data, onEdit, onCliclkAdd, onDelete }) => {

  // La clave es el 'id' de la columna y el valor es el texto del filtro.
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // --- NUEVO ESTADO PARA EL POPOVER DE CONFIRMACIÓN ---
  // Guarda la clave de la fila que se está considerando para eliminar.
  const [rowToDeleteKey, setRowToDeleteKey] = useState<string | null>(null);

  const popoverRef = useRef<HTMLDivElement>(null);

  // Identifica qué columnas tienen la opción de filtro activada.
  const filterableColumns = columns.filter(col => col.filterable);

  // 3. AGREGA useEffect PARA MANEJAR CLICS FUERA DEL POPOVER
  useEffect(() => {
    // Función que se ejecuta al hacer clic en cualquier parte del documento
    const handleClickOutside = (event: MouseEvent) => {
      // Si el popover existe (ref.current no es nulo) y el clic fue fuera de él...
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setRowToDeleteKey(null); // ...cierra el popover.
      }
    };

    // Solo agrega el listener si el popover está abierto
    if (rowToDeleteKey) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Función de limpieza: se ejecuta cuando el componente se desmonta o el popover se cierra.
    // Es crucial para evitar que el listener siga activo innecesariamente.
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [rowToDeleteKey]); // Este efecto depende del estado del popover

  // Filtramos las columnas de llave primaria una sola vez y lo memorizamos.
  // Solo se volverá a calcular si el array 'columns' cambia.
  const primaryKeyColumns = useMemo(() =>
    columns.filter(col => col.isPrimaryKey),
    [columns]
  );

  // Hook useMemo para recalcular los datos filtrados solo cuando 'data' o 'filters' cambien.
  const filteredData = useMemo(() => {
    // Si no hay filtros activos, devuelve todos los datos.
    if (Object.keys(filters).every(key => !filters[key])) {
      return data;
    }

    // Aplica el filtro
    return data.filter(row => {
      // 'every' se asegura de que la fila cumpla con TODOS los filtros activos.
      return Object.keys(filters).every(columnId => {
        const filterValue = filters[columnId]?.toLowerCase();
        const rowValue = String(row[columnId])?.toLowerCase();

        // Si no hay valor de filtro para esta columna, se considera que pasa el filtro.
        if (!filterValue) return true;

        // Comprueba si el valor de la fila incluye el texto del filtro.
        return rowValue.includes(filterValue);
      });
    });
  }, [data, filters]);

  // Paginación
  const totalPages = Math.ceil(filteredData.length / rowsPerPage); // Calcula el total de páginas
  // Datos paginados basados en la página actual y filas por página
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, rowsPerPage]);

  // Manejador para actualizar el estado de los filtros.
  const handleFilterChange = (columnId: string, value: string) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [columnId]: value,
    }));
  };

  // Función para limpiar todos los filtros.
  const clearFilters = () => {
    setFilters({});
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => { // Actualiza el número de filas por página
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1); // Volver a la primera página al cambiar el número de filas
  };
  // Función para ir a una página específica
  const goToPage = (pageNumber: number) => {
    const page = Math.max(1, Math.min(pageNumber, totalPages));
    setCurrentPage(page);
  };

  const formatValue = (value: any, dataType: string) => {
    if (dataType.toUpperCase() === 'DATETIME-LOCAL' && value) {
      try {
        const date = new Date(value);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexed
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}-${month}-${year} ${hours}:${minutes}`;
      } catch (e) {
        return String(value ?? ''); // Fallback en caso de fecha inválida
      }
    }
    return String(value ?? ''); // Usamos ?? para manejar null y undefined
  };

  // --- NUEVA FUNCIÓN PARA MANEJAR LA CONFIRMACIÓN DE ELIMINACIÓN ---
  const handleConfirmDelete = (row: RowData) => {
    const primaryKeyValues = primaryKeyColumns.reduce((keys, col) => {
        keys[col.id] = row[col.id];
        return keys;
    }, {} as Record<string, any>);
    onDelete(primaryKeyValues);
    setRowToDeleteKey(null); // Cierra el popover después de eliminar
  };

  return (
    <>
      {/*Contenedor para los inputs de filtro */}
      {filterableColumns.length > 0 && (
        <div className={styles.filterContainer}>
          {filterableColumns.map(column => (
            <input
              key={column.id}
              type="text"
              placeholder={`Filtrar por ${column.label}...`}
              value={filters[column.id] || ''}
              onChange={(e) => handleFilterChange(column.id, e.target.value)}
              className={styles.filterInput}
            />
          ))}
          <button onClick={clearFilters} className={`${styles.actionButton} ${styles.clearButton}`} title="Limpiar Filtros">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13.013 3H2l8 9.46V19l4 2v-8.54l.9-1.055M22 3l-5 5M17 3l5 5" />
            </svg>
          </button>
          <div className={styles.addButtonContainer}>
            <button onClick={onCliclkAdd} className={styles.addButton} title="Agregar Nuevo">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Agregar</span>
            </button>
          </div>
        </div>
      )}

      <div className={styles.mainWrapper}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                {columns.map((column) => (
                  <th key={column.id}>{column.label}</th>
                ))}
                <th className={styles.actionsHeader}></th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row) => {
                const compositeKey = generateCompositeKey(row, primaryKeyColumns);
                return (
                  <tr key={compositeKey} className={styles.tableRow}>
                    {columns.map((column) => (
                      <td key={column.id} className={styles.tableCell}>
                        {formatValue(row[column.id], column.type)}
                      </td>
                    ))}
                    <td className={`${styles.tableCell} ${styles.actionsCellContainer}`}>
                      <div className={styles.actionsCell}>
                        {onEdit && (
                          <button onClick={() => onEdit(row)} className={`${styles.actionButton} ${styles.editButton}`} title="Editar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => setRowToDeleteKey(compositeKey)} // MODIFICADO: Abre el popover
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          title="Eliminar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>

                        {/* --- INICIO DEL POPOVER DE CONFIRMACIÓN --- */}
                        {rowToDeleteKey === compositeKey && (
                          <div className={styles.popoverContainer} ref={popoverRef}>
                            <p className={styles.popoverMessage}>¿Seguro que quieres eliminar?</p>
                            <div className={styles.popoverActions}>
                              <button onClick={() => setRowToDeleteKey(null)} className={`${styles.popoverButton} ${styles.popoverCancelButton}`}>
                                Cancelar
                              </button>
                              <button onClick={() => handleConfirmDelete(row)} className={`${styles.popoverButton} ${styles.popoverConfirmButton}`}>
                                Sí
                              </button>
                            </div>
                          </div>
                        )}
                        {/* --- FIN DEL POPOVER --- */}

                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        { /* Paginacion */}
        {totalPages >= 1 && (
          <div className={styles.paginationContainer}>
            <div className={styles.paginationGroup}>
              <span>Filas por página:</span>
              <select value={rowsPerPage} onChange={handleRowsPerPageChange} className={styles.rowsPerPageSelect}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <span className={styles.pageIndicator}>
              Página {currentPage} de {totalPages}
            </span>

            <div className={styles.paginationGroup}>
              <button onClick={() => goToPage(1)} disabled={currentPage === 1} className={styles.paginationButton}>
                {'<<'}
              </button>
              <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className={styles.paginationButton}>
                {'<'}
              </button>
              <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className={styles.paginationButton}>
                {'>'}
              </button>
              <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} className={styles.paginationButton}>
                {'>>'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DynamicTable;