import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Url from '../../../../helpers/Url';

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('Estamos verificando tu cuenta...');

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            setMessage('El enlace de verificación no es válido o falta el token.');
            return;
        }

        const verifyToken = async () => {
            try {
                const response = await fetch(`${Url.url}/api/users/verify-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Ocurrió un error inesperado.');
                }

                setStatus('success');
                setMessage(data.message);

            } catch (err) {
                setStatus('error');
                setMessage(err.message || 'El enlace es inválido o ha expirado. Intenta solicitar uno nuevo.');
            }
        };

        verifyToken();
    }, [searchParams]);

    const renderContent = () => {
        switch (status) {
            case 'success':
                return (
                    <>
                        <div className="icon-container success">
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <h1>¡Email Verificado!</h1>
                        <p>{message}</p>
                        <p>Ahora puedes disfrutar de todas las funciones de Radio Internacional.</p>
                        <div className="buttons">
                            <Link to="/" className="primary-btn">Ir a la página principal</Link>
                        </div>
                    </>
                );
            case 'error':
                return (
                    <>
                        <div className="icon-container error">
                            <i className="fas fa-times-circle"></i>
                        </div>
                        <h1>Error de Verificación</h1>
                        <p>{message}</p>
                        <div className="buttons">
                            <Link to="/" className="primary-btn">Volver al Inicio</Link>
                        </div>
                    </>
                );
            default: // 'verifying'
                return (
                    <>
                        <div className="icon-container verifying">
                            <i className="fas fa-spinner fa-spin"></i>
                        </div>
                        <h1>Verificando...</h1>
                        <p>{message}</p>
                    </>
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

export default VerifyEmailPage;
