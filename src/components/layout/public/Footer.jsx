// src/components/layout/public/Footer.jsx
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useCategories from "../../../hooks/UseCategories";

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { categories, loading, error } = useCategories();

  const handleCategoryClick = (e, slug) => {
    e.preventDefault();
    // 1. Dispatch same event so main layout responds
    const ev = new CustomEvent("categoryChange", { detail: slug });
    document.dispatchEvent(ev);

    // 2. Navigate to category route
    const path = `/categoria/${slug}`;
    navigate(path);

    // 3. Scroll logic
    if (slug === "inicio") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setTimeout(() => {
        const dest = document.getElementById("destacados");
        if (dest) dest.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          {/* Logo y descripción */}
          <div className="footer-logo">
            <h2>RadioInternacional</h2>
            <p>Tu portal de noticias confiable</p>
          </div>

          {/* Bloque de enlaces */}
          <div className="footer-links">
            {/* ------ CATEGORÍAS ------ */}
            <div className="footer-section">
              <h3>Categorías</h3>
              {loading ? (
                <p>Cargando...</p>
              ) : error ? (
                <p className="error">{error}</p>
              ) : (
                <ul>
                  {categories
                    .filter(cat => cat.category_slug !== "inicio")
                    .map(cat => (
                      <li
                        key={cat.category_code}
                        className={
                          location.pathname === `/categoria/${cat.category_slug}`
                            ? "active"
                            : ""
                        }
                      >
                        <Link
                          to={`/categoria/${cat.category_slug}`}
                          onClick={e => handleCategoryClick(e, cat.category_slug)}
                        >
                          {cat.category_name}
                        </Link>
                      </li>
                    ))}
                </ul>
              )}
            </div>

            {/* ------ COMPAÑÍA ------ */}
            <div className="footer-section">
              <h3>Compañía</h3>
              <ul>
                <li><Link to="/about">Sobre nosotros</Link></li>
                {/*<li><Link to="/team">Equipo editorial</Link></li>*/}
                {/*<li><Link to="/contact">Contacto</Link></li>*/}
              </ul>
            </div>

            {/* ------ LEGAL ------ */}
            <div className="footer-section">
              <h3>Legal</h3>
              <ul>
                {/*<li><Link to="/terms">Términos y condiciones</Link></li>*/}
                <li><Link to="/politica-de-privacidad">Política de Privacidad</Link></li>
                {/*<li><Link to="/cookies">Política de cookies</Link></li>*/}
              </ul>
            </div>
          </div>

          {/* ------ REDES SOCIALES ------ */}
          <div className="footer-social">
            <h3>Síguenos</h3>
            <div className="social-icons">
              <a href="https://www.facebook.com/radionternacionalamyfm/" target="_blank" rel="noreferrer">
                <i className="fab fa-facebook-f"></i>
              </a>
              {/* <a href="https://twitter.com" target="_blank" rel="noreferrer">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer">
                <i className="fab fa-youtube"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer">
                <i className="fab fa-linkedin-in"></i>
              </a>
              */}
            </div>
          </div>
        </div>

        {/* Pie de página inferior */}
        <div className="footer-bottom">
          <p>© 2025 RadioInternacional - Todos los derechos reservados</p>
        </div>
      </div>
    </footer>
  );
}
