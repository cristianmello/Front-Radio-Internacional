import React from "react";

const ForgotPassword = ({ onSubmit, loading, onSwitchTab }) => (
    <form onSubmit={onSubmit}>
        <h2>Recuperar Contraseña</h2>
        <p>Ingresa tu correo electrónico para recibir el enlace de recuperación.</p>
        <div className="form-group">
            <label>Correo Electrónico:</label>
            <input type="email" name="email" required />
        </div>
        <div className="form-group">
            <button type="submit" disabled={loading}>
                {loading ? "Enviando..." : "Enviar Enlace"}
            </button>
        </div>
        <div className="form-group form-options">
            <button type="button" onClick={() => onSwitchTab("login")}>
                Volver a Iniciar Sesión
            </button>
        </div>
    </form>
);

export default ForgotPassword;
