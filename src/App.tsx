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
    type: 'SELECT',
    dependentColumns: [],
    requestUrl: `${BASE_URL}/getAllCompany`,
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
    type: 'SELECT',
    dependentColumns: ['companyNumber'],
    requestUrl: `${BASE_URL}/getAreaByCompany`,
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
    type: 'SELECT',
    dependentColumns: ['companyNumber', 'areaId'],
    requestUrl: `${BASE_URL}/concept`,
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
    type: 'SELECT',
    dependentColumns: ['companyNumber'],
    requestUrl: `${BASE_URL}/getBankByCompany`,
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
    type: 'SELECT',
    dependentColumns: ['companyNumber', 'bankId'],
    requestUrl: `${BASE_URL}/account`,
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
    type: 'TEXT',
    dependentColumns: [],
    htmlInputProps: {
      required: true,
      maxLength: 3,
      minLength: 2,
    },
    isEditable: true,
    showToAddNew: true,
    isPrimaryKey: true
  },
  {
    id: 'creationUser',
    label: 'Usuario Creación',
    type: 'TEXT',
    dependentColumns: [],
    isEditable: false,
    showToAddNew: false
  },
  {
    id: 'creationDate',
    label: 'Fecha Creación',
    type: 'DATETIME-LOCAL',
    dependentColumns: [],
    isEditable: false,
    showToAddNew: false
  },
  {
    id: 'modificationUser',
    label: 'Usuario Modificación',
    type: 'TEXT',
    dependentColumns: [],
    isEditable: false,
    showToAddNew: false
  },
  {
    id: 'modificationDate',
    label: 'Fecha Modificación',
    type: 'DATETIME-LOCAL',
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
      "creationUser": "joseluis.juarezmarquez@metlifeexternos.com.mx",
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
      "companyNumber": "10",
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
      "companyNumber": "2",
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
      "conceptId": "203",
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
      "areaId": "1031",
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
      "companyNumber": "3",
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
      "conceptId": "204",
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
      "bankId": "Santander2",
      "accountNumber": 98765432,
      "salida": "Salida 3",
      "creationUser": "user3",
      "creationDate": "2025-09-10T12:46:41.873",
      "modificationUser": "user3",
      "modificationDate": "2025-09-10T12:46:41.873"
    },
    {
      "companyNumber": "4",
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
      "conceptId": "205",
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
    setRowData(null);
  };

  // Manejar cuando estamos editando un registro existente
  const handleSaveEditData = (editedData: Record<string, any>) => {
    console.log("Registro editado a guardar:", editedData);
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
    <div style={{ padding: '0', margin: '0' }}>
      <h1 style={{ textAlign: 'center', marginTop: '0' }}>AREAS POR CUENTA</h1>
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