// src/components/layout/public/home/list/HeadlinesSection.jsx
import React from "react";
import HeadlineItem from "./HeadlineItem";

const headlinesData = [
    {
    id: "headline-1",
    category: "Economía",
    text: "El Banco Central mantiene las tasas de interés en medio de la incertidumbre global.",
    time: "hace 5 min",
  },
  {
    id: "headline-2",
    category: "Política",
    text: "El parlamento debate nueva legislación sobre energías renovables.",
    time: "hace 15 min",
  },
  {
    id: "headline-3",
    category: "Deportes",
    text: "Resultados de la última jornada de la liga local de fútbol.",
    time: "hace 30 min",
  },
  {
    id: "headline-4",
    category: "Tecnología",
    text: "Lanzamiento de nuevo smartphone insignia genera expectativas.",
    time: "hace 1 hora",
  },
  {
    id: "headline-5",
    category: "Cultura",
    text: "Inauguración de exposición de arte contemporáneo en el museo nacional.",
    time: "hace 2 horas",
  },
  {
    id: "headline-6",
    category: "Internacional",
    text: "Negociaciones comerciales avanzan entre bloques económicos.",
    time: "hace 3 horas",
  },
];

const HeadlinesSection = () => {
    return (
        <section
            className="list-news-section editable-section"
            data-section-id="ultimas-noticias"
            data-section-type="list"
        >
            <div className="section-header">
                <h1
                    className="section-title editable-title"
                    data-title-id="ultimas-noticias-title"
                >
                    Últimas Noticias
                </h1>
                <button
                    className="edit-general-btn edit-title-btn"
                    data-target-id="ultimas-noticias-title"
                    title="Editar Título"
                >
                    &#9998;
                </button>
                <button
                    className="edit-general-btn edit-section-color-btn"
                    data-target-id="ultimas-noticias"
                    title="Editar Color Fondo"
                >
                    &#127912;
                </button>
                <button
                    className="edit-general-btn delete-section-btn"
                    data-target-id="ultimas-noticias"
                    title="Eliminar Sección"
                >
                    &#128465;
                </button>
                <button
                    className="add-content-to-section-btn"
                    data-target-section="ultimas-noticias"
                    title="Añadir Titular a esta Sección"
                >
                    +
                </button>
            </div>
            <ul className="headline-list">
                {headlinesData.map(({ id, category, text, timeAgo }) => (
                    <HeadlineItem
                        key={id}
                        id={id}
                        category={category}
                        text={text}
                        timeAgo={timeAgo}
                    />
                ))}
            </ul>
        </section>
    );
};

export default HeadlinesSection;
