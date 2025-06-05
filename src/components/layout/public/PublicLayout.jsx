import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../Header';
import { Footer } from '../Footer';

const PublicLayout = () => {
    return (
        <>
            <Header />
            <section className="layout__content">
                <Outlet />
            </section>
            <Footer />
        </>
    );
};
export default PublicLayout;
