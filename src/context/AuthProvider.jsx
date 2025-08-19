// src/context/AuthContext.jsx
import React, { useState, useEffect, createContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Url from '../helpers/Url';

const AuthContext = createContext();

// Variables globales para manejar el semáforo de refresh token
let isRefreshing = false;
let refreshPromise = null;
let currentAccessToken = null;

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [auth, setAuth] = useState(null);
    const [roles, setRoles] = useState([]);
    const [profile, setProfile] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState('');
    const [loading, setLoading] = useState(true);

    const refreshAuth = useCallback(async () => {
        try {
            const res = await fetch(`${Url.url}/api/users/refresh-token`, {
                method: 'POST',
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Refresh failed');

            const { token } = await res.json();
            currentAccessToken = token;
            return token;
        } catch (err) {
            console.error('Refresh token failed:', err);
            currentAccessToken = null;
            setAuth(null);
            setRoles([]);
            setAvatarUrl('');
            return null;
        }
    }, []);

    const authFetch = useCallback(async (input, init = {}) => {
        const csrfToken = getCookie('XSRF-TOKEN');

        const doFetch = async (accessToken) => {
            const finalHeaders = {
                ...(init.headers || {}),
                'csrf-token': csrfToken,
                ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
            };
            // Eliminar Content-Type si hay FormData para evitar errores
            if (init.body instanceof FormData) {
                delete finalHeaders['Content-Type'];
            }
            return fetch(input, {
                ...init,
                headers: finalHeaders,
                credentials: 'include',
            });
        };

        // Primera petición
        let res = await doFetch(currentAccessToken);

        // Si la petición falla por token expirado y el token no es null
        if (res.status === 401 && currentAccessToken) {

            if (!isRefreshing) {
                isRefreshing = true;
                refreshPromise = refreshAuth();
            }

            try {
                const newToken = await refreshPromise;
                if (newToken) {
                    // Reintenta la petición original con el nuevo token
                    res = await doFetch(newToken);
                } else {
                    // Si el refresh falla, devuelve un 401 para redirigir al login
                    return new Response(JSON.stringify({ message: 'Session expired. Please log in again.' }), { status: 401 });
                }
            } finally {
                // Reinicia el semáforo al terminar el proceso de refresh
                isRefreshing = false;
                refreshPromise = null;
            }
        }

        return res;
    }, [refreshAuth]);

    // authenticateUser usa authFetch (y borra la lógica de fetchProfile duplicada)
    const authenticateUser = useCallback(async () => {
        setLoading(true);
        // La lógica de refresh inicial ahora se maneja dentro de authFetch
        const res = await authFetch(`${Url.url}/api/users/profile`, { method: 'GET' });

        if (!res.ok) {
            // Si authFetch no pudo autenticar, limpia la sesión
            setAuth(null);
            setRoles([]);
            setAvatarUrl('');
        } else {
            const { data: user } = await res.json();
            setAuth(user);
            setProfile(user);
            setRoles(user.role ? [user.role.role_name] : []);
            if (user.avatar) setAvatarUrl(user.avatar);
        }
        setLoading(false);
    }, [authFetch]);

    const login = async ({ user_mail, user_password }) => {
        try {
            const res = await authFetch(`${Url.url}/api/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ user_mail, user_password }),
            });
            const body = await res.json();

            if (!res.ok) {
                // Creamos un error con el mensaje y le adjuntamos el código
                const error = new Error(body.message || 'Error desconocido');
                error.code = body.code;
                throw error;
            }
            currentAccessToken = body.token;
            await authenticateUser();
            navigate('/');
            return { success: true };
        } catch (err) {
            return {
                success: false,
                message: err.message,
                code: err.code
            };
        }
    };

    const logout = async () => {
        try {
            await fetch(`${Url.url}/api/users/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${currentAccessToken}`,
                },
                credentials: 'include',
            });
        } catch { }
        currentAccessToken = null;
        setAuth(null);
        setRoles([]);
        setAvatarUrl('');
        navigate('/');
    };

    const register = async ({
        user_name,
        user_lastname,
        user_birth,
        user_phone,
        user_mail,
        user_password
    }) => {
        try {
            const res = await authFetch(`${Url.url}/api/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_name,
                    user_lastname,
                    user_birth,
                    user_phone,
                    user_mail,
                    user_password
                }),
            });
            const body = await res.json();

            if (!res.ok) {
                console.error('Errores de validación en register:', body.errors);
                throw new Error(body.message);
            }
            return { success: true, message: body.message };

        } catch (err) {
            console.error('Error en register:', err);
            return { success: false, message: err.message };
        }
    };

    const recoverPassword = async ({ user_mail }) => {
        try {
            const res = await authFetch(`${Url.url}/api/users/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_mail }),
            });
            const body = await res.json();
            if (!res.ok) {
                throw new Error(body.message || 'Error al solicitar recuperación');
            }
            return { success: true, message: body.message };
        } catch (err) {
            console.error('Error en recoverPassword:', err);
            return { success: false, message: err.message };
        }
    };

    const resendVerificationEmail = async ({ user_mail }) => {
        try {
            const res = await authFetch(`${Url.url}/api/users/send-verification-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_mail }),
            });
            const body = await res.json();
            if (!res.ok) {
                throw new Error(body.message || 'Error al reenviar el correo.');
            }
            return { success: true, message: body.message };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    useEffect(() => {
        authenticateUser();
    }, [authenticateUser]);

    return (
        <AuthContext.Provider value={{
            auth,
            setAuth,
            roles,
            loading,
            profile,
            login,
            logout,
            register,
            recoverPassword,
            resendVerificationEmail,
            getToken,
            authFetch
        }}>
            {children}
        </AuthContext.Provider>
    );
};
export default AuthContext;