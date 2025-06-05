import React from "react";

const Register = ({ onSubmit, loading }) => (
  <form onSubmit={onSubmit}>
    <h2>Registrarse</h2>
    <div className="form-group">
      <label>Nombre:</label>
      <input type="text" name="name" required />
    </div>
    <div className="form-group">
      <label>Correo Electrónico:</label>
      <input type="email" name="email" required />
    </div>
    <div className="form-group">
      <label>Contraseña:</label>
      <input type="password" name="password" required />
    </div>
    <div className="form-group">
      <label>Confirmar Contraseña:</label>
      <input type="password" name="confirm_password" required />
    </div>
    <div className="form-group">
      <button type="submit" disabled={loading}>
        {loading ? "Registrando..." : "Registrarse"}
      </button>
    </div>
  </form>
);

export default Register;
