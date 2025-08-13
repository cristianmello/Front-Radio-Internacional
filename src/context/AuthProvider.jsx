// src/context/AuthContext.jsx
import React, { useState, useEffect, createContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Url from '../helpers/Url';

const AuthContext = createContext();

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
            localStorage.setItem('token', token);

            return token;
        } catch (err) {
            return null;
        }
    }, []);

    const getToken = () => localStorage.getItem('token');

    const authFetch = useCallback(async (input, init = {}) => {
        console.log("--- [CSRF Frontend Debug] ---");
        console.log("Todas las cookies:", document.cookie);

        const csrfToken = getCookie('XSRF-TOKEN');
        console.log("Token CSRF extraído de la cookie:", csrfToken);

        const token = getToken();
        // Construimos los headers base:
        const headers = {
            ...(init.headers || {}),
            ...(token && { Authorization: `Bearer ${token}` }),
            ...(csrfToken && { 'csrf-token': csrfToken })
        };

        console.log("Cabeceras que se enviarán:", headers); // SENSOR 4: ¿Se está añadiendo la cabecera a la petición?
        console.log("---------------------------------");
        // Si el body NO es FormData, lo tratamos como JSON:
        if (!(init.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        // Función interna para hacer la petición real
        const doFetch = async (bearerToken) => {
            return fetch(input, {
                ...init,
                headers,
                credentials: 'include'
            });
        };

        // Primera petición
        let res = await doFetch(token);

        // Si recibimos 401 y había token, intentamos refresh
        if (res.status === 401 && token) {
            const newToken = await refreshAuth();
            if (newToken) {
                // renovamos Authorization
                headers.Authorization = `Bearer ${newToken}`;
                // reintentamos
                res = await doFetch(newToken);
            }
        }

        return res;
    }, [refreshAuth]);

    // authenticateUser usa authFetch (y borra la lógica de fetchProfile duplicada)
    const authenticateUser = useCallback(async () => {
        setLoading(true);

        let token = getToken();

        const hasRefreshCookie = document.cookie
            .split(';')
            .some(c => c.trim().startsWith('refreshToken='));

        // Sólo intento refresh si NO tengo access token y SÍ hay cookie de refresh
        if (!token && hasRefreshCookie) {
            token = await refreshAuth();
        }

        if (!token) {
            // aquí caes tras logout o tras fallo de refresh
            localStorage.removeItem('token');
            setAuth(null);
            setRoles([]);
            setAvatarUrl('');
            setLoading(false);
            return;
        }

        const res = await authFetch(`${Url.url}/api/users/profile`, { method: 'GET' });
        if (!res.ok) {
            localStorage.removeItem('token');
            setAuth(null);
            setRoles([]);
            setAvatarUrl('');
            setLoading(false);
            return;
        }
        const { data: user } = await res.json();
        setAuth(user);
        setProfile(user);
        setRoles(user.role ? [user.role.role_name] : []);
        if (user.avatar) setAvatarUrl(user.avatar);
        setLoading(false);
    }, [authFetch, refreshAuth]);

    const login = async ({ user_mail, user_password }) => {
        try {
            const res = await fetch(`${Url.url}/api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

            const { token } = body;
            localStorage.setItem('token', token);
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
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                credentials: 'include',
            });
        } catch { }
        localStorage.removeItem('token');
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
            const res = await fetch(`${Url.url}/api/users/register`, {
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
            const res = await fetch(`${Url.url}/api/users/forgot-password`, {
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
            const res = await fetch(`${Url.url}/api/users/send-verification-email`, {
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