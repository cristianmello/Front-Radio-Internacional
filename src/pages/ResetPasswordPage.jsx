// src/pages/ResetPasswordPage.jsx
import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Url from '../helpers/Url';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('form');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ password: '', confirm: '' });

    const token = searchParams.get('token');

    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            setStatus('error');
            setMessage('Token no encontrado en la URL.');
            return;
        }
        if (formData.password.length < 8) {
            setMessage('La contraseña debe tener al menos 8 caracteres.');
            return;
        }
        if (formData.password !== formData.confirm) {
            setMessage('Las contraseñas no coinciden.');
            return;
        }

        setIsSubmitting(true);
        setMessage('');

        try {
            const res = await fetch(`${Url.url}/api/users/reset-password?token=${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_password: formData.password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            setStatus('success');
            setMessage(data.message);
        } catch (err) {
            setStatus('error');
            setMessage(err.message || 'Ocurrió un error.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderContent = () => {
        switch (status) {
            case 'success':
                return (
                    <div className="text-center">
                        <h1>¡Éxito!</h1>
                        <p>{message}</p>
                        <Link to="/" className="primary-btn" onClick={() => navigate('/')}>Ir a Iniciar Sesión</Link>
                    </div>
                );
            case 'error':
                return (
                    <div className="text-center">
                        <h1>Error</h1>
                        <p>{message}</p>
                        <Link to="/" className="primary-btn">Volver al Inicio</Link>
                    </div>
                );
            default:
                return (
                    <form onSubmit={handleSubmit}>
                        <h1>Crear Nueva Contraseña</h1>
                        <div className="form-group">
                            <label htmlFor="password">Nueva Contraseña</label>
                            <input type="password" name="password" id="password" value={formData.password} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirm">Confirmar Nueva Contraseña</label>
                            <input type="password" name="confirm" id="confirm" value={formData.confirm} onChange={handleInputChange} required />
                        </div>
                        {message && <p className="form-error">{message}</p>}
                        <button type="submit" className="auth-submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : 'Restablecer Contraseña'}
                        </button>
                    </form>
                );
        }
    };

    return (
        <div className="verification-container">
            <div className="verification-box">
                {renderContent()}
            </div>
        </div>
    );
};

export default ResetPasswordPage;