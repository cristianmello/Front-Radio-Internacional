// src/components/layout/public/Header.jsx
import React from "react";
import { Link, NavLink } from "react-router-dom";
import useAuth from "../../hooks/UseAuth";
import logo from "../../assets/img/logos-1.png"

export const Header = () => {
  const { auth } = useAuth();

  return (
    <header>
      <div className="header-content">
        <Link to="/" className="logo-link">
          <img
            src={logo}
            alt="Radio Internacional Logo"
            className="header-logo"
          />
        </Link>

        <nav className="main-nav">
          <ul>
            <li>
              <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
                Inicio
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>
                Acerca de
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" className={({ isActive }) => (isActive ? "active" : "")}>
                Contacto
              </NavLink>
            </li>

            {/* Si no está autenticado, muestro “Usuario” que lleva a login */}
            {!auth?.id ? (
              <li>
                <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
                  Usuario
                </NavLink>
              </li>
            ) : (
              <>
                {/* Si el usuario sí está autenticado, muestro “Perfil” y “Cerrar sesión” */}
                <li>
                  <NavLink to="/profile" className={({ isActive }) => (isActive ? "active" : "")}>
                    Perfil
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/logout" className={({ isActive }) => (isActive ? "active" : "")}>
                    Cerrar sesión
                  </NavLink>
                </li>

                {/* Mostrar “Administración” si es admin o superadmin */}
                {["superadmin", "admin"].includes(auth.role?.role_name) && (
                  <>
                    <li>
                      <NavLink to="/admin/usuarios">Administración</NavLink>
                    </li>
                    <li>
                      <NavLink to="/admin/controles">Controles</NavLink>
                    </li>
                  </>
                )}

              </>
            )}
          </ul>
        </nav>
      </div>

      <nav className="category-nav">
        <ul>
          <li>
            <NavLink to="/categorias" className={({ isActive }) => (isActive ? "active" : "")}>
              Todas
            </NavLink>
          </li>
          {/* Aquí pueden listarse dinámicamente las categorías si lo deseas */}
        </ul>
      </nav>
    </header>
  );
};
