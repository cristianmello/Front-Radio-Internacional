import imageCompression from 'browser-image-compression';

// Opciones de compresión optimizadas para la web
const options = {
    // 1. Límite máximo del archivo final. 1MB ya es muy generoso para una imagen web.
    maxSizeMB: 1,

    // 2. Este es el paso más importante: se asegura de que ninguna imagen sea más ancha o alta que 1920px.
    maxWidthOrHeight: 1920,

    // 3. Usa un "Web Worker" para que la compresión no congele el navegador del editor.
    useWebWorker: true,
};

/**
 * Comprime una imagen en el navegador antes de subirla al servidor.
 * @param {File} imageFile - El archivo original que el usuario selecciona.
 * @returns {Promise<File>} Una promesa que se resuelve con el nuevo archivo comprimido.
 */
export const compressImage = async (imageFile) => {
    console.log(`Tamaño original: ${(imageFile.size / 1024 / 1024).toFixed(2)} MB`);

    try {
        const compressedFile = await imageCompression(imageFile, options);
        console.log(`Tamaño comprimido: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
        return compressedFile;
    } catch (error) {
        console.error('Error durante la compresión de la imagen:', error);
        return imageFile;
    }
};