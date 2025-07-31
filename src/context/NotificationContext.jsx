// src/context/NotificationContext.js
import React, { createContext, useState, useRef, useContext, useCallback } from 'react';

// Mapa de iconos
const iconMap = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    info: 'fas fa-info-circle',
};

// 1. Crear el Contexto
const NotificationContext = createContext();

// 2. Crear el Proveedor (Provider)
export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const notificationTimer = useRef(null);

    const showNotification = useCallback((message, type = 'info', duration = 3000) => {
        if (notificationTimer.current) {
            clearTimeout(notificationTimer.current);
        }
        setNotification({ show: true, message, type });
        
        notificationTimer.current = setTimeout(() => {
            // AJUSTE: Usamos la forma funcional de setState para más seguridad.
            // Esto simplemente oculta la notificación actual sin sobreescribir el mensaje o el tipo.
            setNotification(currentNotif => ({ ...currentNotif, show: false }));
        }, duration);
    }, []);

    const value = { showNotification };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <div className={`notification ${notification.show ? 'show' : ''} notification-${notification.type}`}>
                {notification.type && <i className={iconMap[notification.type]}></i>}
                <span>{notification.message}</span>
            </div>
        </NotificationContext.Provider>
    );
};

// 3. Crear el Hook para usar el contexto fácilmente
export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification debe ser usado dentro de un NotificationProvider');
    }
    return context;
};