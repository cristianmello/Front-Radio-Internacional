// src/components/layout/public/AuthModal.jsx
import React, { useState, useEffect, useRef } from "react";
import Url from "../../../helpers/Url"

const TABS = [
  { key: "login-form", label: "Iniciar Sesión" },
  { key: "register-form", label: "Registrarse" },
  { key: "recovery-form", label: "Recuperar Contraseña" },
];


const AuthModal = ({ isOpen, onClose, onLogin, onRegister, onRecover, error }) => {
  const [activeTab, setActiveTab] = useState("login-form");
  const [formError, setFormError] = useState("");
  const modalBackgroundRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [lastLoginAttemptEmail, setLastLoginAttemptEmail] = useState("");

  const [recoverySuccess, setRecoverySuccess] = useState(false);

  const [showResendLink, setShowResendLink] = useState(false);
  const loginEmailInputRef = useRef(null);




  // 1) Cuando se abra/cierre el modal, bloqueamos scroll y reset de pestaña
  useEffect(() => {
    if (isOpen) {
      setActiveTab("login-form");
      setFormError("");
      setIsSubmitting(false);
      setShowResendLink(false);
      setRegistrationSuccess(false);
      setLastLoginAttemptEmail("");
      setRecoverySuccess(false);

      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // 2) Cerrar al clicar fuera del contenedor
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (e.target === modalBackgroundRef.current) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("click", handleOutsideClick);
    }
    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleResendEmail = async () => {
    const email = loginEmailInputRef.current?.value;
    if (!email) {
      setFormError("Por favor, ingresa tu correo para reenviar la verificación.");
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    try {
      const res = await fetch(`${Url.url}/api/users/send-verification-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_mail: email }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message);

      setShowResendLink(false); // Oculta el botón después del éxito
      // Muestra un mensaje de éxito usando el mismo estado de error
      setFormError("¡Correo de verificación reenviado! Revisa tu bandeja de entrada.");
    } catch (err) {
      setFormError(err.message || "No se pudo reenviar el correo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date();
  const yyyy = today.getFullYear() - 12; // fecha mínima para tener 12 años
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const maxBirthDate = `${yyyy}-${mm}-${dd}`;

  return (
    <div
      id="auth-modal"
      className="auth-modal open"
      ref={modalBackgroundRef}
      style={{ display: isOpen ? "block" : "none" }}

    >
      <div className="auth-container">
        <button className="close-auth-button" onClick={onClose}>
          &times;
        </button>

        {/* TABS */}
        <div className="auth-tabs">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              className={`auth-tab ${activeTab === key ? "active" : ""}`}
              // --- CAMBIO AQUÍ ---
              onClick={() => {
                setActiveTab(key);
                setFormError("");
                // Reiniciamos ambos estados de éxito al cambiar de pestaña
                setRegistrationSuccess(false);
                setRecoverySuccess(false);
              }}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="auth-form-container">
          {/* LOGIN FORM */}
          <form
            id="login-form"
            className={`auth-form ${activeTab === "login-form" ? "active" : ""}`}
            onSubmit={async (e) => {
              e.preventDefault();
              setFormError("");
              setShowResendLink(false);
              setIsSubmitting(true);
              const email = e.target["login-email"].value.trim();
              setLastLoginAttemptEmail(email);
              try {
                const result = await onLogin({
                  user_mail: e.target["login-email"].value.trim(),
                  user_password: e.target["login-password"].value
                });
                if (result && !result.success) {
                  if (result.code === 'ACCOUNT_NOT_VERIFIED') {
                    setShowResendLink(true);
                  }
                  setFormError(result.message);
                } else {
                  onClose();
                }
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <h3>Iniciar Sesión</h3>
            {formError && activeTab === "login-form" && (
              <p className="form-error">{formError}</p>
            )}
            <div className="form-group">
              <label htmlFor="login-email">Correo Electrónico</label>
              <input type="email" id="login-email" required ref={loginEmailInputRef} />
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Contraseña</label>
              <input
                type="password"
                id="login-password"
                required
                minLength={6}
              />
            </div>
            {showResendLink && (
              <div className="form-group resend-container">
                <button
                  type="button"
                  className="resend-button"
                  onClick={handleResendEmail}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Reenviar correo de verificación"}
                </button>
              </div>
            )}
            <button type="submit" className="auth-submit" disabled={isSubmitting}>
              {isSubmitting ? "Cargando..." : "Iniciar Sesión"}
            </button>
          </form>

          {/* REGISTER FORM */}
          {registrationSuccess ? (
            <div className="registration-success">
              <div className="icon-container success"><i className="fas fa-check-circle"></i></div>
              <h3>¡Registro Exitoso!</h3>
              <p>Hemos enviado un enlace de verificación a tu correo electrónico. Por favor, revísalo para activar tu cuenta.</p>
              <button type="button" className="auth-submit" onClick={onClose}>Entendido</button>
            </div>
          ) : (
            <form id="register-form" className={`auth-form ${activeTab === "register-form" ? "active" : ""}`} onSubmit={async (e) => {
              e.preventDefault();
              setFormError("");

              const user_name = e.target["register-name"].value.trim();
              const user_lastname = e.target["register-lastname"].value.trim();
              const user_birth = e.target["register-birth"].value;
              const user_phone = e.target["register-phone"].value.trim();
              const user_mail = e.target["register-email"].value.trim();
              const user_password = e.target["register-password"].value;
              const confirm = e.target["register-confirm"].value;

              // Validaciones cliente
              if (user_name.length < 3) {
                return setFormError("El nombre debe tener al menos 3 caracteres.");
              }
              if (user_lastname.length < 3) {
                return setFormError("El apellido debe tener al menos 3 caracteres.");
              }
              if (!user_birth) {
                return setFormError("Debes indicar tu fecha de nacimiento.");
              }
              if (user_birth > maxBirthDate) {
                return setFormError("Debes tener al menos 12 años para registrarte.");
              }
              if (user_phone && !/^[\d\s+\-()]*$/.test(user_phone)) {
                return setFormError("Formato de teléfono inválido.");
              }
              if (user_password.length < 6) {
                return setFormError("La contraseña debe tener al menos 6 caracteres.");
              }
              if (user_password !== confirm) {
                return setFormError("Las contraseñas no coinciden.");
              }

              setIsSubmitting(true);
              try {

                const result = await onRegister({
                  user_name: e.target["register-name"].value.trim(),
                  user_lastname: e.target["register-lastname"].value.trim(),
                  user_birth: e.target["register-birth"].value,
                  user_phone: e.target["register-phone"].value.trim() || null,
                  user_mail: e.target["register-email"].value.trim(),
                  user_password: e.target["register-password"].value
                });

                if (result && !result.success) {
                  setFormError(result.message);
                } else {
                  setRegistrationSuccess(true);
                }
              } finally {
                setIsSubmitting(false);
              }
            }}

            >
              <h3>Crear Cuenta</h3>
              {formError && activeTab === 'register-form' && <p className="form-error">{formError}</p>}
              <div className="form-group">
                <label htmlFor="register-name">Nombre</label>
                <input type="text" id="register-name" required />
              </div>
              <div className="form-group">
                <label htmlFor="register-lastname">Apellido</label>
                <input type="text" id="register-lastname" required />
              </div>
              <div className="form-group">
                <label htmlFor="register-birth">Fecha de Nacimiento</label>
                <input
                  type="date"
                  id="register-birth"
                  required
                  max={maxBirthDate}
                />
              </div>
              <div className="form-group">
                <label htmlFor="register-phone">Teléfono (opcional)</label>
                <input type="tel" id="register-phone" />
              </div>
              <div className="form-group">
                <label htmlFor="register-email">Correo Electrónico</label>
                <input type="email" id="register-email" required />
              </div>
              <div className="form-group">
                <label htmlFor="register-password">Contraseña</label>
                <input
                  type="password"
                  id="register-password"
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label htmlFor="register-confirm">Confirmar Contraseña</label>
                <input
                  type="password"
                  id="register-confirm"
                  required
                  minLength={6}
                />
              </div>
              <div className="form-options">
                <label>
                  <input type="checkbox" required /> Acepto términos y condiciones
                </label>
              </div>
              <button type="submit" className="auth-submit" disabled={isSubmitting}>
                {isSubmitting ? "Cargando..." : "Registrarse"}
              </button>
            </form>
          )}

          {/* RECOVERY FORM */}
          {recoverySuccess ? (
            <div className="registration-success"> {/* Reutilizamos la clase de éxito */}
              <div className="icon-container success"><i className="fas fa-check-circle"></i></div>
              <h3>¡Revisa tu Correo!</h3>
              <p>Si tu correo está en nuestro sistema, recibirás un enlace para restablecer tu contraseña.</p>
              <button type="button" className="auth-submit" onClick={onClose}>Entendido</button>
            </div>
          ) : (
            <form
              id="recovery-form"
              className={`auth-form ${activeTab === "recovery-form" ? "active" : ""}`}
              onSubmit={async (e) => {
                e.preventDefault();
                setFormError("");
                setIsSubmitting(true);
                try {
                  const result = await onRecover({
                    user_mail: e.target["recovery-email"].value.trim()
                  });

                  if (result && !result.success) {
                    setFormError(result.message);
                  } else {
                    // CAMBIO: En lugar de cerrar, mostramos el mensaje de éxito
                    setRecoverySuccess(true);
                  }
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <h3>Recuperar Contraseña</h3>
              {formError && activeTab === 'recovery-form' && <p className="form-error">{formError}</p>}

              <div className="form-group">
                <label htmlFor="recovery-email">Correo Electrónico</label>
                <input type="email" id="recovery-email" required />
              </div>
              <button type="submit" className="auth-submit" disabled={isSubmitting}>
                {isSubmitting ? "Cargando..." : "Enviar Enlace"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;