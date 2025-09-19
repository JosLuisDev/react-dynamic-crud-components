import React, { useState } from 'react';
import DynamicSidebar from './components/DynamicSidebar/DynamicSidebar';
import DynamicTable from './components/DynamicTable/DynamicTable';
import { Column, RowData } from './types';

// Url base para las solicitudes
const BASE_URL = 'http://192.168.100.114:8085/v1/services/treasury/area-account-maintenance';

// Datos de ejemplo para las columnas de la tabla y el formulario
const sampleColumns: Column[] = [
  {
    id: 'companyNumber',
    label: 'Compañia',
    type: 'select',
    dependentColumns: [],
    requestURl: `${BASE_URL}/getAllCompany`,
    errorOptionMessage: 'No hay compañías disponibles',
    htmlInputProps: {
      required: true,
    },
    isEditable: false,
    showToAddNew: true,
    filterable: true,
    isPrimaryKey: true
  },
  {
    id: 'areaId',
    label: 'Area',
    type: 'select',
    dependentColumns: ['companyNumber'],
    requestURl: `${BASE_URL}/getAreaByCompany`,
    errorOptionMessage: 'No hay áreas disponibles',
    htmlInputProps: {
      required: true,
    },
    isEditable: false,
    showToAddNew: true,
    filterable: true,
    isPrimaryKey: true
  },
  {
    id: 'conceptId',
    label: 'Concepto',
    type: 'select',
    dependentColumns: ['companyNumber', 'areaId'],
    requestURl: `${BASE_URL}/concept`,
    errorOptionMessage: 'No hay conceptos disponibles',
    htmlInputProps: {
      required: true,
    },
    isEditable: false,
    showToAddNew: true,
    filterable: true,
    isPrimaryKey: true
  },
  {
    id: 'bankId',
    label: 'Banco',
    type: 'select',
    dependentColumns: ['companyNumber'],
    requestURl: `${BASE_URL}/getBankByCompany`,
    errorOptionMessage: 'No hay bancos disponibles',
    htmlInputProps: {
      required: true,
    },
    isEditable: false,
    showToAddNew: true,
    filterable: true,
    isPrimaryKey: true
  },
  {
    id: 'accountNumber',
    label: 'Cuenta',
    type: 'select',
    dependentColumns: ['companyNumber', 'bankId'],
    requestURl: `${BASE_URL}/account`,
    errorOptionMessage: 'No hay cuentas disponibles',
    htmlInputProps: {
      required: true,
    },
    isEditable: false,
    showToAddNew: true,
    isPrimaryKey: true
  },
  {
    id: 'salida',
    label: 'Salida',
    type: 'text',
    dependentColumns: [],
    htmlInputProps: {
      required: true,
    },
    isEditable: true,
    showToAddNew: true,
    isPrimaryKey: true
  },
  {
    id: 'creationUser',
    label: 'Usuario Creación',
    type: 'text',
    dependentColumns: [],
    isEditable: false,
    showToAddNew: false
  },
  {
    id: 'creationDate',
    label: 'Fecha Creación',
    type: 'datetime-local',
    dependentColumns: [],
    isEditable: false,
    showToAddNew: false
  },
  {
    id: 'modificationUser',
    label: 'Usuario Modificación',
    type: 'text',
    dependentColumns: [],
    isEditable: false,
    showToAddNew: false
  },
  {
    id: 'modificationDate',
    label: 'Fecha Modificación',
    type: 'datetime-local',
    dependentColumns: [],
    isEditable: false,
    showToAddNew: false
  }
];

const tableData: RowData[] = [
    {
      "companyNumber": "1",
      "areaId": "101",
      "conceptId": "201",
      "bankId": "BBVA",
      "accountNumber": 12345678,
      "salida": "Salida 1",
      "creationUser": "user1",
      "creationDate": "2025-09-10T12:46:41.873",
      "modificationUser": "user1",
      "modificationDate": "2025-09-10T12:46:41.873"
    },
    {
      "companyNumber": "2",
      "areaId": "102",
      "conceptId": "202",
      "bankId": "Banamex",
      "accountNumber": 87654321,
      "salida": "Salida 2",
      "creationUser": "user2",
      "creationDate": "2025-09-10T12:46:41.873",
      "modificationUser": "user2",
      "modificationDate": "2025-09-10T12:46:41.873"
    },
    {
      "companyNumber": "2",
      "areaId": "103",
      "conceptId": "203",
      "bankId": "Santander",
      "accountNumber": 98765432,
      "salida": "Salida 3",
      "creationUser": "user3",
      "creationDate": "2025-09-10T12:46:41.873",
      "modificationUser": "user3",
      "modificationDate": "2025-09-10T12:46:41.873"
    },
    {
      "companyNumber": "1",
      "areaId": "101",
      "conceptId": "201",
      "bankId": "BBVA",
      "accountNumber": 12345678,
      "salida": "Salida 1",
      "creationUser": "user1",
      "creationDate": "2025-09-10T12:46:41.873",
      "modificationUser": "user1",
      "modificationDate": "2025-09-10T12:46:41.873"
    },
    {
      "companyNumber": "2",
      "areaId": "102",
      "conceptId": "202",
      "bankId": "Banamex",
      "accountNumber": 87654321,
      "salida": "Salida 2",
      "creationUser": "user2",
      "creationDate": "2025-09-10T12:46:41.873",
      "modificationUser": "user2",
      "modificationDate": "2025-09-10T12:46:41.873"
    },
    {
      "companyNumber": "2",
      "areaId": "103",
      "conceptId": "203",
      "bankId": "Santander",
      "accountNumber": 98765432,
      "salida": "Salida 3",
      "creationUser": "user3",
      "creationDate": "2025-09-10T12:46:41.873",
      "modificationUser": "user3",
      "modificationDate": "2025-09-10T12:46:41.873"
    }
];

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Estado para controlar la visibilidad del sidebar
  const [rowData, setRowData] = useState<RowData | null>(null); // Estado para la fila a editar
  const [tableRows, setTableRows] = useState<RowData[]>(tableData); // Estado para las filas de la tabla
  const [title, setTitle] = useState<string>("AGREGAR"); // Estado para el título del sidebar

  const BASE_URL = 'http://192.168.100.114:8085/v1/services/treasury/area-account-maintenance';
  
  // Maneja el clic en el botón de "Editar" de la tabla
  const handleEditClick = (row: RowData) => {
    setTitle("EDITAR");
    setRowData(row);
    setIsSidebarOpen(true);
  };

  // Manejar cuando estamos en agregar nuevo registro
  const handleSaveNewData = (newData: Record<string, any>) => {
    console.log("Nuevo registro a agregar:", newData);
  };

  // Manejar cuando estamos editando un registro existente
  const handleSaveEditData = (editedData: Record<string, any>) => {
    console.log("Registro editado a guardar:", editedData);
    // Peticion al endpoint que actualiza un registro existente
    fetch(`${BASE_URL}/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editedData),
    })
    .then(response => { // Verifica si la respuesta es exitosa
      if (!response.ok) {
        throw new Error('Error al actualizar el registro');
      }
      return response.json();
    })
    .then(data => { // Maneja la respuesta del servidor
      console.log('Registro actualizado:', data);
      // Actualizar la tabla con el registro editado
      setTableRows(prevRows => prevRows.map(row => row.accountNumber === data.accountNumber ? data : row));
    })
    .catch(error => { // Maneja errores de red o del servidor
      console.error('Error:', error);
      alert('Hubo un error al actualizar el registro. Por favor, inténtelo de nuevo.');
    });
    setRowData(null);
  }

  const handleDeleteRow = (primaryKeys: Record<string, any>) => {
    console.log("Eliminar registro con claves primarias:", primaryKeys);
  }


  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setRowData(null);
  };

  const handleAddNew = () => {
    setTitle("AGREGAR");
    setRowData(null);
    setIsSidebarOpen(true);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ textAlign: 'center' }}>Mantenimiento de Area por cuenta</h1>
      <DynamicTable
        columns={sampleColumns}
        data={tableRows}
        onEdit={handleEditClick}
        onCliclkAdd={handleAddNew}
        onDelete={handleDeleteRow}
      />
      
      {isSidebarOpen && (
        <DynamicSidebar
          isOpen={isSidebarOpen}
          onClose={handleCloseSidebar}
          title={title}
          columns={sampleColumns}
          onSaveNew={handleSaveNewData}
          onSaveEdit={handleSaveEditData}
          initialData={rowData ?? undefined}
        />
      )}
    </div>
  );
};

export default App;