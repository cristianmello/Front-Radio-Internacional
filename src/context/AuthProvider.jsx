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
        if (isRefreshing) {
            return refreshPromise;
        }
        isRefreshing = true;
        refreshPromise = (async () => {
            try {
                // Intentamos leer el token CSRF que el servidor pone en cookie
                let csrfToken = getCookie('XSRF-TOKEN');

                // Si por alguna razón no existe (problema de dominio/path), hacemos
                // un GET sencillo para que el middleware de tu servidor cree la cookie CSRF.
                if (!csrfToken) {
                    try {
                        await fetch(`${Url.url}/api/pages/home`, { method: 'GET', credentials: 'include' });
                        csrfToken = getCookie('XSRF-TOKEN');
                    } catch (err) {
                        // no fatal: intentamos seguir de todas formas
                        console.warn('No se pudo forzar GET para obtener XSRF-TOKEN:', err);
                    }
                }

                const headers = {};
                if (csrfToken) headers['csrf-token'] = csrfToken;

                const res = await fetch(`${Url.url}/api/users/refresh-token`, {
                    method: 'POST',
                    credentials: 'include',
                    headers
                });

                if (!res.ok) {
                    // Opcional: loguear body para debugging en dev
                    let text;
                    try { text = await res.text(); } catch (_) { text = 'no body'; }
                    throw new Error(`Refresh failed: ${res.status} ${text}`);
                }

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
            } finally {
                isRefreshing = false;
                refreshPromise = null;
            }
        })();
        return refreshPromise;
    }, [setAuth, setRoles, setAvatarUrl]);

    const authFetch = useCallback(async (input, init = {}) => {
        const doFetch = async (accessToken) => {
            const csrfToken = getCookie('XSRF-TOKEN'); // <- moved here
            const finalHeaders = {
                ...(init.headers || {}),
                ...(csrfToken && { 'csrf-token': csrfToken }),
                ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
            };
            if (init.body instanceof FormData) {
                delete finalHeaders['Content-Type'];
            }
            return fetch(input, {
                ...init,
                headers: finalHeaders,
                credentials: 'include',
            });
        };

        let res = await doFetch(currentAccessToken);

        if (res.status === 401 && currentAccessToken) {
            const newToken = await refreshAuth();
            if (newToken) {
                res = await doFetch(newToken);
            } else {
                return new Response(JSON.stringify({ message: 'Session expired. Please log in again.' }), { status: 401 });
            }
        }
        return res;
    }, [refreshAuth]);

    // authenticateUser usa authFetch (y borra la lógica de fetchProfile duplicada)
    const authenticateUser = useCallback(async () => {
        setLoading(true);
        const hasRefreshCookie = document.cookie.split(';').some(c => c.trim().startsWith('refreshToken='));

        // 1. Si no hay token en memoria, pero sí en la cookie, forzamos un refresh.
        if (!currentAccessToken && hasRefreshCookie) {
            const newToken = await refreshAuth();
            if (!newToken) {
                // Si la renovación falla, cerramos la sesión y salimos.
                setLoading(false);
                return;
            }
        }

        // 2. Si hay un token (ya sea el original o el recién renovado), intentamos obtener el perfil.
        if (currentAccessToken) {
            const res = await authFetch(`${Url.url}/api/users/profile`, { method: 'GET' });
            if (!res.ok) {
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
        } else {
            // 3. Si no hay ningún token, la sesión simplemente no se establece.
            setAuth(null);
            setRoles([]);
            setAvatarUrl('');
        }
        setLoading(false);
    }, [authFetch, refreshAuth]);

    const login = async ({ user_mail, user_password }) => {
        try {
            const res = await fetch(`${Url.url}/api/users/login`, {
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
            const csrfToken = getCookie('XSRF-TOKEN');
            await fetch(`${Url.url}/api/users/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(csrfToken && { 'csrf-token': csrfToken }),
                    Authorization: `Bearer ${currentAccessToken}`,
                },
                credentials: 'include',
            });
        } catch (e) {
            console.warn('Logout request failed (client will still clear local state):', e);
        }

        // Siempre limpiamos cliente aunque el fetch falle
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
            authFetch
        }}>
            {children}
        </AuthContext.Provider>
    );
};
export default AuthContext;