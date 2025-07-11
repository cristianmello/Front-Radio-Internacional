// src/components/layout/public/home/MainContent.jsx
import React, { useEffect, useState } from "react";
import NewsItem from "./NewsItem";
import Url from "../../../../helpers/Url";
import NewsLayout from "./NewsLayout";

const MainContent = ({ category }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const isInicio = category === "inicio";

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ published: "true" });
    if (!isInicio) params.set("category_slug", category);

    fetch(`${Url.url}/api/articles?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar artículos");
        return res.json();
      })
      .then((json) =>
        setArticles(
          (json.items || []).map((a) => ({
            id: a.article_code,
            imageUrl: a.image,
            category: a.category,
            title: a.title,
            excerpt: a.excerpt,
            author: a.author,
            date: a.date,
            readTime: a.readTime,
            articleId: String(a.article_code),
          }))
        )
      )
      .catch((_) => setArticles([]))
      .finally(() => setLoading(false));
  }, [category, isInicio]);

  const headerTitle = isInicio
    ? "Destacados"
    : category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <NewsLayout className={isInicio ? "inicio" : ""}>
      <div className="section-header">
        <h2>{headerTitle}</h2>
      </div>
      <div className="news-list">
        {loading ? (
          <p>Cargando artículos…</p>
        ) : articles.length > 0 ? (
          articles.map((a) => (
            <NewsItem
              key={a.id}
              category={a.category}
              title={a.title}
              excerpt={a.excerpt}
              author={a.author}
              date={a.date}
              imageUrl={a.imageUrl}
              readTime={a.readTime}
              articleId={a.articleId}
            />
          ))
        ) : (
          <p>No hay artículos disponibles.</p>
        )}
      </div>
    </NewsLayout>
  );
};

export default MainContent;



{/*
function fetchCategoryArticles(category) {
  const data = {
    politica: [
      {
        id: 1,
        imageUrl: "https://source.unsplash.com/random/800x500/?politics-1",
        category: "Política",
        title: "Histórico acuerdo de paz firmado entre naciones en conflicto",
        excerpt:
          "Tras décadas de tensiones, los líderes mundiales celebran el tratado que promete estabilidad en la región.",
        author: "María González",
        date: "Hace 2 horas",
      },
    ],
    economia: [
      {
        id: 3,
        imageUrl: "https://source.unsplash.com/random/800x500/?economy-1",
        category: "Economía",
        title: "Mercados globales responden positivamente a reformas económicas",
        excerpt:
          "Las bolsas internacionales registran alzas históricas tras anuncio de nuevas políticas.",
        author: "Roberto Sánchez",
        date: "Hace 1 día",
      },
    ],
    tecnologia: [
      {
        id: 2,
        imageUrl: "https://source.unsplash.com/random/800x500/?technology-1",
        category: "Tecnología",
        title: "Nueva inteligencia artificial revoluciona la medicina",
        excerpt:
          "El sistema puede diagnosticar enfermedades con mayor precisión que los médicos humanos.",
        author: "Carlos Vega",
        date: "Hace 4 horas",
      },
    ],
    deportes: [],
    entretenimiento: [ ],
    ciencia: [],
  };
  return Promise.resolve(data[category] || []);
}


const MainContent = ({ category }) => {
  const [articles, setArticles] = useState([]);
  const isInicio = category === "inicio";

  useEffect(() => {
    if (!isInicio) {
      // Carga simulada de datos
      fetchCategoryArticles(category).then((list) => setArticles(list));
    }
  }, [category, isInicio]);

  // Texto del título
  const headerTitle = isInicio
    ? "Destacados"
    : category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className={`news-layout ${isInicio ? "inicio" : ""}`}>
      <section className="main-content">
        <div className="section-header">
          <h2>{headerTitle}</h2>
        </div>
        <div className="news-list">
          {isInicio ? (
            <>
              <NewsItem
                category="Medio Ambiente"
                title="Récord de temperaturas preocupa a científicos climáticos"
                excerpt="Los últimos datos confirman la tendencia al calentamiento global acelerado..."
                author="Carlos Martínez"
                date="Hace 5 horas"
                imageUrl="https://source.unsplash.com/random/800x500/?environment"
                articleId="9"
              />
              <NewsItem
                category="Educación"
                title="Reforma educativa incluirá programación como asignatura obligatoria"
                excerpt="El ministerio anuncia cambios curriculares para preparar a los estudiantes..."
                author="Ana López"
                date="Hace 1 día"
                imageUrl="https://source.unsplash.com/random/800x500/?education"
                articleId="10"
              />
              <NewsItem
                category="Negocios"
                title="Startup local recibe financiación millonaria para expandirse globalmente"
                excerpt="La compañía de tecnología verde atrajo a inversores internacionales..."
                author="Roberto Sánchez"
                date="Hace 3 días"
                imageUrl="https://source.unsplash.com/random/800x500/?business"
                articleId="11"
              />
            </>
          ) : (
            articles.map((a) => (
              <NewsItem
                key={a.id}
                category={a.category}
                title={a.title}
                excerpt={a.excerpt}
                author={a.author}
                date={a.date}
                imageUrl={a.imageUrl}
                articleId={String(a.id)}
              />
            ))
          )}
        </div>
      </section>

      <aside className="sidebar">
        <Sidebar />
      </aside>
    </div>
  );
};

export default MainContent;
*/}