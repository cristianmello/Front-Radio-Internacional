# Realidad Internacional - Front-end

Este es el front-end de la aplicación web de Realidad Nacional, desarrollado con **React** y **Vite**. Esta aplicación consume los datos de una API propia para mostrar noticias, y permitir la administración del contenido.

## ✨ Características

- **Interfaz Pública:** Muestra noticias, artículos y reproductor de audio para los visitantes.
- **Panel de Administración:** Permite a los usuarios con permisos gestionar el contenido del sitio.
- **Editor de Texto Enriquecido:** Utiliza TinyMCE para una experiencia de edición de artículos avanzada.
- **Diseño Adaptable:** Optimizado para una correcta visualización en diferentes dispositivos.

## 🚀 Cómo Empezar

Sigue estos pasos para levantar el proyecto en un entorno local.

### Requisitos

- Node.js (v18 o superior)
- npm (o el gestor de paquetes de tu preferencia)

### Instalación

1.  **Clona el repositorio** (si aún no lo has hecho) y navega a la carpeta del front-end:
    ```bash
    git clone [https://github.com/tu-usuario/tu-repositorio.git](https://github.com/tu-usuario/tu-repositorio.git)
    cd tu-repositorio/FRONT
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

3.  **Configura las variables de entorno:**
    - Este proyecto requiere una clave de API para el editor de texto TinyMCE.
    - Crea un archivo llamado `.env` en la raíz de la carpeta `FRONT`.
    - Añade la siguiente línea al archivo `.env`:
      ```
      VITE_TINYMCE_API_KEY="AQUI_VA_TU_CLAVE_DE_TINYMCE"
      ```
    - Reemplaza `"AQUI_VA_TU_CLAVE_DE_TINYMCE"` con tu clave real.

4.  **Inicia el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:5173` (o el puerto que indique Vite).

## 🛠️ Scripts Disponibles

- **`npm run dev`**: Inicia el servidor de desarrollo.

## 📦 Estructura del Proyecto

src/
├── assets/         # Archivos estáticos como CSS, imágenes y fuentes.
│
├── components/     # Componentes de React reutilizables (botones, modales, layouts).
│
├── context/        # Contextos de React para el manejo de estado global (ej: autenticación).
│
├── helpers/        # Funciones de ayuda y utilidades que no son hooks ni componentes.
│
├── hooks/          # Hooks personalizados de React (ej: useAuth).
│
├── pages/          # Componentes que representan las páginas completas de la aplicación.
│
├── router/         # Configuración de las rutas de la aplicación (React Router).
│
├── services/       # Lógica para comunicarse con la API del back-end.
│
└── main.jsx        # Punto de entrada principal de la aplicación, donde se renderiza React.