// src/router/privateroute.jsx (o donde lo tengas)

import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Header from '../public/Header';
import Footer from '../public/Footer';
import useAuth from '../../../hooks/useAuth';

const PrivateLayout = () => {
  // 1. Obtenemos también los 'roles' del usuario
  const { auth, roles, loading } = useAuth();

  if (loading) {
    return <p>Verificando sesión...</p>;
  }

  // 2. Corregimos la clave a 'user_code' para la autenticación
  if (!auth || !auth.user_code) {
    // Si no hay sesión, redirigimos a login
    return <Navigate to="/login" replace />;
  }

  // 3. AÑADIMOS la lógica de autorización por rol
  const isAdmin = roles && roles.some(role => ['admin', 'superadmin'].includes(role));

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container">
      <Header />
      <main>
          <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PrivateLayout;