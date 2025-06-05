import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import useAuth from '../hooks/UseAuth';

const PrivateLayout = () => {
  const { auth, loading } = useAuth();

  if (loading) return <p>Cargando...</p>;

  if (!auth || !auth.member_code) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Header />
      <main className="layout__content">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default PrivateLayout;
