// src/helpers/Global.jsx
import { v4 as uuidv4 } from "uuid";

// PREDEFINED_FONTS igual que en tu script:
export const PREDEFINED_FONTS = [
    { name: "Merriweather (predeterminado)", value: "'Merriweather', serif" },
    { name: "Roboto", value: "'Roboto', sans-serif" },
    { name: "Georgia", value: "'Georgia', serif" },
    { name: "Arial", value: "'Arial', sans-serif" },
    { name: "Verdana", value: "'Verdana', sans-serif" },
    { name: "Times New Roman", value: "'Times New Roman', Times, serif" },
];

/**
 * Crea un objeto "sección" con ID, nombre, noticias iniciales y propiedades de estilo.
 * @param {string} name 
 * @param {Array} newsItems 
 */
export function createSectionObject(name, newsItems = []) {
    const sectionId = `section-${uuidv4()}`;
    return {
        id: sectionId,
        name,
        news: newsItems.map((item) => ({
            ...item,
            id: item.id != null ? item.id.toString() : `news-${uuidv4()}`,
            size: item.size || "small",
            orientation: item.orientation || "vertical",
        })),
        // Aquí guardamos referencias a propiedades de estilo que luego
        // usaremos para personalizar la sección:
        backgroundColor: "#fdfdfd",
        titleFontFamily: PREDEFINED_FONTS[0].value,
        titleColor: "#1a1a1a",
        articleTextColor: "#444444",
    };
}
