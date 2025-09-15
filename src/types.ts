// src/types/types.ts

// Define los tipos de input que soportará el componente
export type InputType = 'text' | 'number' | 'date' | 'select';

// Define la estructura de cada columna
export interface Column {
  id: string; // Identificador único de la columna
  label: string; // Título que se mostrará en el formulario
  type: InputType;
  dependentColumns?: string[]; // IDs de columnas que dependen de esta columna para hacer el fetch de datos
  requestURl?: string; // URL para hacer fetch de datos dinámicos sin parametros
  errorOptionMessage?: string; // Mensaje a mostrar en caso de error al cargar opciones
  htmlInputProps?: ValidationProps; // Propiedades HTML adicionales para el input ej: min, max, required, etc.
}

// Define las props que recibirá el componente
export interface DynamicSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  columns: Column[];
  onSave: (data: Record<string, any>) => void; // Función para manejar el guardado de datos
}

export interface ValidationProps {
  required?: boolean;
  min?: number | string;
  max?: number | string;
  maxLength?: number;
  minLength?: number;
  step?: number;
  pattern?: string;
}