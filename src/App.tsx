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
    type: 'select',
    options: [],
    dependentColumns: [], // Corregido: Array vacío para indicar que no tiene dependencias
    requestURl: `${BASE_URL}/getAllCompany`, // Eliminada la barra diagonal final
  },
  {
    id: 'areaId',
    label: 'Area',
    type: 'select',
    options: [],
    dependentColumns: ['companyNumber'],
    requestURl: `${BASE_URL}/getAreaByCompany`, // Eliminada la barra diagonal final
  },
  {
    id: 'conceptId',
    label: 'Concepto',
    type: 'select',
    options: [],
    dependentColumns: ['companyNumber', 'areaId'],
    requestURl: `${BASE_URL}/getConceptByAreaAndCompany`, // Eliminada la barra diagonal final
  },
  {
    id: 'bankId',
    label: 'Banco',
    type: 'select',
    options: [],
    dependentColumns: ['companyNumber'],
    requestURl: `${BASE_URL}/getBankByCompany`, // Eliminada la barra diagonal final
  },
  {
    id: 'accountNumber',
    label: 'Cuenta',
    type: 'select',
    options: [],
    dependentColumns: ['companyNumber', 'bankId'],
    requestURl: `${BASE_URL}/getAccountByBankAndCompany`, // Eliminada la barra diagonal final
  },
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