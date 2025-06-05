// src/components/layout/public/home/list/HeadlineItem.jsx
import React from "react";

const HeadlineItem = ({ id, category, text, timeAgo }) => {
    return (
        <li data-headline-id={id}>
            <a href="#">
                <strong>{category}:</strong> {text}
            </a>{" "}
            <span className="headline-time">{timeAgo}</span>
            <button
                className="edit-general-btn edit-headline-btn"
                data-target-id={id}
                title="Editar Titular"
            >
                &#9998;
            </button>
            <button
                className="edit-general-btn delete-headline-btn"
                data-target-id={id}
                title="Eliminar Titular"
            >
                &#128465;
            </button>
        </li>
    );
};

export default HeadlineItem;
