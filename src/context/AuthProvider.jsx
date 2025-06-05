import React, { useState, useEffect, createContext } from 'react';
import { Url } from '../helpers/Url';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(null);
    const [roles, setRoles] = useState([]);
    const [avatarUrl, setAvatarUrl] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authenticateUser();
    }, []);

    const authenticateUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const res = await fetch(`${Url.url}/user/profile`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) {
                // Token inválido o expirado
                localStorage.removeItem('token');
                setLoading(false);
                return;
            }

            const data = await res.json();

            setAuth(data.user || {});
            setRoles(data.roles || []);

            // Si el backend devuelve una URL pública del avatar
            if (data.user?.avatar) {
                setAvatarUrl(data.user.avatar);
            }

        } catch (err) {
            console.error('Error al autenticar:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                auth,
                setAuth,
                roles,
                setRoles,
                avatarUrl,
                setAvatarUrl,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
