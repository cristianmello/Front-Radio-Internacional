// src/helpers/ScrollToTop.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    // Obtenemos el objeto 'location' completo, que incluye el 'state'
    const location = useLocation();

    useEffect(() => {
        // AHORA TENEMOS UNA CONDICIÓN:
        // Solo sube el scroll si el estado de la navegación NO tiene la propiedad 'preventScrollReset'.
        if (!location.state?.preventScrollReset) {
            window.scrollTo(0, 0);
        }
    }, [location.pathname]); // El efecto se sigue ejecutando cuando cambia la ruta

    return null;
}