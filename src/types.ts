// src/types/types.ts

// Define los tipos de input que soportará el componente
export type InputType = 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'DATETIME-LOCAL';

// Define la estructura de cada columna para el formulario
export interface Column {
  id: string; // Identificador único de la columna
  label: string; // Título que se mostrará en el formulario y en la tabla
  type: InputType;
  dependentColumns: string[]; // IDs de columnas que dependen de esta columna para hacer el fetch de datos
  requestUrl?: string; // URL para hacer fetch de datos dinámicos sin parametros
  errorOptionMessage?: string; // Mensaje a mostrar en caso de error al cargar opciones
  htmlInputProps?: ValidationProps; // Propiedades HTML adicionales para el input ej: min, max, required, etc.
  isEditable: boolean; // Indica si la columna es editable o no al abrir el sidebar
  showToAddNew: boolean; // Indica si la columna debe mostrarse al agregar un nuevo registro
  constraints?: Record<string, any>; // Restricciones adicionales específicas para el tipo de input
  filterable?: boolean; // Indica si la columna es filtrable en la tabla
  isPrimaryKey?: boolean; // Indica si la columna es una clave primaria
}

// Define las props que recibirá el componente
export interface DynamicSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  columns: Column[];
  onSaveNew: (data: Record<string, any>) => void; // Función para manejar el guardado de datos
  onSaveEdit: (data: Record<string, any>) => void; // Función para manejar el guardado de datos editados
  initialData?: Record<string, any>; // Propiedad para pasar la data a editar
}

// Define las propiedades de validación que se pueden aplicar a los inputs
export interface ValidationProps {
  required?: boolean;
  min?: number | string;
  max?: number | string;
  maxLength?: number;
  minLength?: number;
  step?: number;
  pattern?: string;
}

//Table types

export interface RowData {
  [key: string]: any;
}

export interface DynamicTableProps {
  columns: Column[];
  data: RowData[];
  onEdit?: (rowData: RowData) => void;
  onCliclkAdd: () => void;
  onDelete: (primaryKeys: Record<string, any>) => void;
}