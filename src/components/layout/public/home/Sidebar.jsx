// src/components/layout/public/home/Sidebar.jsx
import React, { useEffect, useState } from "react";
import Url from "../../../../helpers/Url";

const Sidebar = () => {
  const [popular, setPopular] = useState([]);
  const [tags, setTags] = useState([]);
  const [email, setEmail] = useState("");
  const [newsMsg, setNewsMsg] = useState("");
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingTags, setLoadingTags] = useState(true);

  // 1) Fetch “Más Leídos”
  useEffect(() => {
    fetch(
      `${Url.url}/api/articles?published=true&sort=views&page=1&limit=3`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar populares");
        return res.json();
      })
      .then((json) => {
        setPopular(json.items || []);
      })
      .catch((_) => {
        setPopular([]);
      })
      .finally(() => {
        setLoadingPopular(false);
      });
  }, []);

  // 2) Fetch “Temas Populares”
  useEffect(() => {
    fetch(`${Url.url}/api/tags`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar tags");
        return res.json();
      })
      .then((json) => {
        setTags(json.data || []);
      })
      .catch((_) => {
        setTags([]);
      })
      .finally(() => {
        setLoadingTags(false);
      });
  }, []);

  // 3) Manejo de suscripción
  const handleSubmit = (e) => {
    e.preventDefault();
    setNewsMsg("Enviando…");
    fetch(`${Url.url}/api/newsletter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error en suscripción");
        return res.json();
      })
      .then((json) => {
        setNewsMsg("¡Suscripción exitosa!");
        setEmail("");
      })
      .catch((_) => {
        setNewsMsg("Hubo un problema. Intenta de nuevo.");
      });
  };

  return (
    <aside className="sidebar">
      {/* --- Más Leídos --- */}
      <div className="widget popular-posts">
        <h3>Más Leídos</h3>
        {loadingPopular ? (
          <p>Cargando…</p>
        ) : popular.length > 0 ? (
          <ul>
            {popular.map((a) => (
              <li key={a.article_code}>
                <div className="post-image">
                  <img
                    src={a.image || "https://source.unsplash.com/random/100x100/?news"}
                    alt={a.category}
                  />
                </div>
                <div className="post-info">
                  <h5>{a.title}</h5>
                  <span className="date">{a.date}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay datos.</p>
        )}
      </div>

      {/* --- Newsletter --- */}
      <div className="widget newsletter">
        <h3>Suscríbete</h3>
        <p>Recibe las noticias más importantes del día en tu correo</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Tu correo electrónico"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit">Suscribirse</button>
        </form>
        {newsMsg && <p className="newsletter-msg">{newsMsg}</p>}
      </div>

      {/* --- Anuncio pequeño --- */}
      <div className="widget ad-widget">
        <div className="ad-disclaimer">Publicidad</div>
        <a href="#">
          <img
            src="https://source.unsplash.com/random/300x250/?ad"
            alt="Anuncio"
          />
        </a>
      </div>

      {/* --- Tags --- */}
      <div className="widget tags">
        <h3>Temas Populares</h3>
        {loadingTags ? (
          <p>Cargando…</p>
        ) : tags.length > 0 ? (
          <div className="tag-cloud">
            {tags.map((t) => (
              <a key={t.tag_code} href={`/tag/${t.tag_slug}`} className="tag">
                {t.tag_name}
              </a>
            ))}
          </div>
        ) : (
          <p>No hay etiquetas.</p>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

{/*
const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="widget popular-posts">
        <h3>Más Leídos</h3>
        <ul>
          <li>
            <div className="post-image">
              <img
                src="https://source.unsplash.com/random/100x100/?food"
                alt="Gastronomía"
              />
            </div>
            <div className="post-info">
              <h5>La cocina tradicional es declarada patrimonio inmaterial</h5>
              <span className="date">Hace 4 días</span>
            </div>
          </li>
          <li>
            <div className="post-image">
              <img
                src="https://source.unsplash.com/random/100x100/?travel"
                alt="Viajes"
              />
            </div>
            <div className="post-info">
              <h5>Destinos turísticos menos conocidos ganan popularidad</h5>
              <span className="date">Hace 1 semana</span>
            </div>
          </li>
          <li>
            <div className="post-image">
              <img
                src="https://source.unsplash.com/random/100x100/?fashion"
                alt="Moda"
              />
            </div>
            <div className="post-info">
              <h5>La moda sostenible domina las pasarelas esta temporada</h5>
              <span className="date">Hace 2 días</span>
            </div>
          </li>
        </ul>
      </div>

      <div className="widget newsletter">
        <h3>Suscríbete</h3>
        <p>Recibe las noticias más importantes del día en tu correo</p>
        <form action="#" method="post">
          <input type="email" placeholder="Tu correo electrónico" required />
          <button type="submit">Suscribirse</button>
        </form>
      </div>

      <div className="widget ad-widget">
        <div className="ad-disclaimer">Publicidad</div>
        <a href="#">
          <img
            src="https://source.unsplash.com/random/300x250/?ad"
            alt="Anuncio"
          />
        </a>
      </div>

      <div className="widget tags">
        <h3>Temas Populares</h3>
        <div className="tag-cloud">
          <a href="#" className="tag">
            Coronavirus
          </a>
          <a href="#" className="tag">
            Economía
          </a>
          <a href="#" className="tag">
            Elecciones
          </a>
          <a href="#" className="tag">
            Cambio climático
          </a>
          <a href="#" className="tag">
            Tecnología
          </a>
          <a href="#" className="tag">
            Deportes
          </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
*/}