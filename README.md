# ⚛️ React Dynamic CRUD Components

Un conjunto de componentes de React dinámicos y reutilizables para construir interfaces completas de gestión de datos (CRUD). Incluye una `DynamicTable` con filtrado, paginación y acciones integradas, y un `DynamicSidebar` para crear y editar registros con validación y selects en cascada.

---

### ✨ Demostración

*(**Sugerencia:** Graba un GIF corto que muestre cómo funciona el filtrado, la paginación y cómo se abre el sidebar al editar. Herramientas como LICEcap o Giphy Capture son excelentes para esto. Luego, sube el GIF al repositorio y reemplaza el enlace de abajo).*

![Components](https://github.com/user-attachments/assets/874fdbd1-dfa1-4930-ba46-99af501a6284)

---

## 🚀 Características Principales

* **⚙️ 100% Declarativo:** Controla toda la UI (tabla y formulario) con un único arreglo de configuración de columnas.
* **🔍 Filtrado Integrado:** Filtra los datos en tiempo real por múltiples columnas.
* **📄 Paginación Automática:** Maneja grandes conjuntos de datos con controles de paginación completos.
* **⚡ Acciones por Fila:** Botones de Editar y Eliminar listos para usar, con lógica para llaves primarias compuestas.
* **📝 Formularios Inteligentes:** El sidebar se adapta para crear o editar, mostrando y habilitando campos según el contexto.
* **🔗 Selects en Cascada:** Soporte nativo para dropdowns que dependen de la selección de otros.
* **✅ Validación de Formularios:** El botón de guardar se deshabilita automáticamente hasta que los campos requeridos estén llenos.
* **🎨 Estilo con SCSS Modules:** Estilos encapsulados y fáciles de personalizar.

---

## 📦 Instalación

Para usar estos componentes en tu proyecto, clona el repositorio e instala las dependencias:

```bash
git clone https://github.com/JosLuisDev/react-dynamic-crud-components.git
cd react-dynamic-crud-components
npm install
