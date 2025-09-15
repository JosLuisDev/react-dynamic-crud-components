// src/App.tsx

import React, { useState } from 'react';
import { Button } from '@mui/material';
import DynamicSidebar from './components/DynamicSidebar/DynamicSidebar';
import { Column } from './types';

// Url base para las solicitudes
const BASE_URL = 'http://192.168.100.114:8085/v1/services/treasury/area-account-maintenance';

// Datos de ejemplo para las columnas
const sampleColumns: Column[] = [
  {
    id: 'companyNumber',
    label: 'Compañia',
    type: 'select', // ej: 'text', 'number', 'date', 'select'
    dependentColumns: [], // Corregido: Array vacío para indicar que no tiene dependencias
    requestURl: `${BASE_URL}/getAllCompany`,
    errorOptionMessage: 'No hay compañías disponibles',
    htmlInputProps: {
      required: true,
    }
  },
  {
    id: 'areaId',
    label: 'Area',
    type: 'select',
    dependentColumns: ['companyNumber'],
    requestURl: `${BASE_URL}/getAreaByCompany`,
    errorOptionMessage: 'No hay áreas disponibles para la compañía seleccionada',
    htmlInputProps: {
      required: true,
    }
  },
  {
    id: 'conceptId',
    label: 'Concepto',
    type: 'select',
    dependentColumns: ['companyNumber', 'areaId'],
    requestURl: `${BASE_URL}/concept`,
    errorOptionMessage: 'No hay conceptos disponibles para el área y compañía seleccionada',
    htmlInputProps: {
      required: true,
    }
  },
  {
    id: 'bankId',
    label: 'Banco',
    type: 'select',
    dependentColumns: ['companyNumber'],
    requestURl: `${BASE_URL}/getBankByCompany`,
    errorOptionMessage: 'No hay bancos disponibles para la compañía seleccionada',
    htmlInputProps: {
      required: true,
    }
  },
  {
    id: 'accountNumber',
    label: 'Cuenta',
    type: 'select',
    dependentColumns: ['companyNumber', 'bankId'],
    requestURl: `${BASE_URL}/account`,
    errorOptionMessage: 'No hay cuentas disponibles para el banco y compañía seleccionada',
    htmlInputProps: {
      required: true,
    }
  },
  {
    id: 'salida',
    label: 'Salida',
    type: 'text',
    dependentColumns: [],
    htmlInputProps: {
      required: true,
    }
  }
];

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleOpenSidebar = () => {
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleSaveData = (data: Record<string, any>) => {
    console.log('Datos a guardar:', data);
  };

  return (
    <div>
      <Button variant="contained" onClick={handleOpenSidebar}>
        Abrir Formulario
      </Button>
      <DynamicSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        title="AGREGAR"
        columns={sampleColumns}
        onSave={handleSaveData}
      />
    </div>
  );
};

export default App;