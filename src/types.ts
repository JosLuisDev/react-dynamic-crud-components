// src/types/types.ts

// Define los tipos de input que soportará el componente
export type InputType = 'text' | 'number' | 'date' | 'select';

// Define la estructura de cada columna
export interface Column {
  id: string; // Identificador único de la columna
  label: string; // Título que se mostrará en el formulario
  type: InputType;
  options?: { value: string; label: string }[]; // Opciones para el tipo 'select'
  dependentColumns?: string[]; // IDs de columnas que dependen de esta columna para hacer el fetch de datos
  requestURl?: string; // URL para hacer fetch de datos dinámicos sin parametros
}

// Define las props que recibirá el componente
export interface DynamicSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  columns: Column[];
  onSave: (data: Record<string, any>) => void; // Función para manejar el guardado de datos
}