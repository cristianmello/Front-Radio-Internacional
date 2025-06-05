import React from "react";

const Login = ({ onSubmit, loading, onSwitchTab }) => (
  <form onSubmit={onSubmit}>
    <h2>Iniciar Sesión</h2>
    <div className="form-group">
      <label>Correo Electrónico:</label>
      <input type="email" name="email" required />
    </div>
    <div className="form-group">
      <label>Contraseña:</label>
      <input type="password" name="password" required />
    </div>
    <div className="form-group form-options">
      <button type="button" onClick={() => onSwitchTab("recovery")}>
        ¿Olvidaste tu contraseña?
      </button>
    </div>
    <div className="form-group">
      <button type="submit" disabled={loading}>
        {loading ? "Cargando..." : "Iniciar Sesión"}
      </button>
    </div>
  </form>
);

export default Login;


/*import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "https://backend-radio-internacional-production.up.railway.app/api/users";

const LoginRegister = () => {

  const navigate = useNavigate();

  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const switchTab = (tabName) => {
    setMessage(null);
    setTab(tabName);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await fetch(`${BACKEND_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ user_mail: email, user_password: password }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        setTimeout(() => {
          navigate("/home");
        }, 1000);
      }
      else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error de red o del servidor." });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirm_password.value;

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden." });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: name,
          user_mail: email,
          user_password: password,
          user_lastname: "-",
          user_birth: "2000-01-01",
          user_phone: "-",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        e.target.reset();
        setTab("login");
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error de red o del servidor." });
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const email = e.target.email.value;

    try {
      const res = await fetch(`${BACKEND_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_mail: email }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: data.message });
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error de red o del servidor." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <section className="login-register-container">
        <div className="login-register-form">
          <div className="tab-buttons">
            <button
              className={`tab-button ${tab === "login" ? "active" : ""}`}
              onClick={() => switchTab("login")}
            >
              Iniciar Sesión
            </button>
            <button
              className={`tab-button ${tab === "register" ? "active" : ""}`}
              onClick={() => switchTab("register")}
            >
              Registrarse
            </button>
          </div>

          {message && (
            <div className={`message ${message.type}`}>{message.text}</div>
          )}

          {tab === "login" && (
            <form onSubmit={handleLogin}>
              <h2>Iniciar Sesión</h2>
              <div className="form-group">
                <label>Correo Electrónico:</label>
                <input type="email" name="email" required />
              </div>
              <div className="form-group">
                <label>Contraseña:</label>
                <input type="password" name="password" required />
              </div>
              <div className="form-group form-options">
                <button type="button" onClick={() => switchTab("recovery")}>
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="form-group">
                <button type="submit" disabled={loading}>
                  {loading ? "Cargando..." : "Iniciar Sesión"}
                </button>
              </div>
            </form>
          )}

          {tab === "register" && (
            <form onSubmit={handleRegister}>
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
          )}

          {tab === "recovery" && (
            <form onSubmit={handleRecovery}>
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
                <button type="button" onClick={() => switchTab("login")}>
                  Volver a Iniciar Sesión
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default LoginRegister;
*/