// src/components/layout/private/content/ArticlesAdminList.jsx
import React, {
    useState,
    forwardRef,
    useImperativeHandle,
} from "react";

const ArticlesAdminList = forwardRef(
    ({ onCreateArticle, onUpdateArticle, activeSectionId }, ref) => {
        const [isAddModalOpen, setIsAddModalOpen] = useState(false);
        const [isEditModalOpen, setIsEditModalOpen] = useState(false);

        const [newArticle, setNewArticle] = useState({
            title: "",
            summary: "",
            category: "",
            imageUrl: "",
            link: "",
            size: "small",
            orientation: "vertical",
        });

        const [editArticle, setEditArticle] = useState({
            sectionId: null,
            newsId: null,
            title: "",
            summary: "",
            category: "",
            imageUrl: "",
            link: "",
            size: "small",
            orientation: "vertical",
        });

        // Exponemos dos funciones al padre: openAddModal() y openEditModal(article)
        useImperativeHandle(ref, () => ({
            openAddModal: () => {
                if (!activeSectionId) {
                    alert("Para añadir una noticia, antes tenés que seleccionar o crear una sección.");
                    return;
                }
                setIsAddModalOpen(true);
            },
            openEditModal: (article) => {
                setEditArticle({
                    sectionId: article.sectionId,
                    newsId: article.id,
                    title: article.title,
                    summary: article.summary,
                    category: article.category,
                    imageUrl: article.imageUrl,
                    link: article.link || "",
                    size: article.size || "small",
                    orientation: article.orientation || "vertical",
                });
                setIsEditModalOpen(true);
            },
        }));

        const closeAddModal = () => {
            setIsAddModalOpen(false);
            setNewArticle({
                title: "",
                summary: "",
                category: "",
                imageUrl: "",
                link: "",
                size: "small",
                orientation: "vertical",
            });
        };

        const closeEditModal = () => {
            setIsEditModalOpen(false);
            setEditArticle({
                sectionId: null,
                newsId: null,
                title: "",
                summary: "",
                category: "",
                imageUrl: "",
                link: "",
                size: "small",
                orientation: "vertical",
            });
        };

        const handleAddSubmit = (e) => {
            e.preventDefault();
            if (
                !newArticle.title.trim() ||
                !newArticle.summary.trim() ||
                !newArticle.category.trim() ||
                !newArticle.imageUrl.trim()
            ) {
                alert("Completá todos los campos obligatorios.");
                return;
            }
            onCreateArticle({
                ...newArticle,
                sectionId: activeSectionId,
            });
            closeAddModal();
        };

        const handleEditSubmit = (e) => {
            e.preventDefault();
            if (
                !editArticle.title.trim() ||
                !editArticle.summary.trim() ||
                !editArticle.category.trim() ||
                !editArticle.imageUrl.trim()
            ) {
                alert("Completá todos los campos obligatorios.");
                return;
            }
            onUpdateArticle(editArticle);
            closeEditModal();
        };


        return (
            <>

                {/* ===== Modal “Añadir Nueva Noticia” ===== */}
                {isAddModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <button className="modal-close-btn" onClick={closeAddModal}>
                                &times;
                            </button>
                            <h2>Añadir Nueva Noticia</h2>
                            <form id="add-news-form" onSubmit={handleAddSubmit}>
                                <div className="form-group">
                                    <label htmlFor="news-title">Título:</label>
                                    <input
                                        type="text"
                                        id="news-title"
                                        name="title"
                                        value={newArticle.title}
                                        onChange={(e) =>
                                            setNewArticle({ ...newArticle, title: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="news-summary">Resumen:</label>
                                    <textarea
                                        id="news-summary"
                                        name="summary"
                                        value={newArticle.summary}
                                        onChange={(e) =>
                                            setNewArticle({ ...newArticle, summary: e.target.value })
                                        }
                                        required
                                    ></textarea>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="news-category">Categoría:</label>
                                    <input
                                        type="text"
                                        id="news-category"
                                        name="category"
                                        value={newArticle.category}
                                        onChange={(e) =>
                                            setNewArticle({ ...newArticle, category: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="news-image-url">URL de la Imagen:</label>
                                    <input
                                        type="url"
                                        id="news-image-url"
                                        name="imageUrl"
                                        value={newArticle.imageUrl}
                                        onChange={(e) =>
                                            setNewArticle({ ...newArticle, imageUrl: e.target.value })
                                        }
                                        required
                                    />
                                    <small>
                                        Por favor, usá una URL válida (.png, .jpg, etc.).
                                    </small>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="news-link">Enlace (opcional):</label>
                                    <input
                                        type="url"
                                        id="news-link"
                                        name="link"
                                        value={newArticle.link}
                                        onChange={(e) =>
                                            setNewArticle({ ...newArticle, link: e.target.value })
                                        }
                                        placeholder="#"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="news-size">Tamaño:</label>
                                    <select
                                        id="news-size"
                                        value={newArticle.size}
                                        onChange={(e) =>
                                            setNewArticle({ ...newArticle, size: e.target.value })
                                        }
                                    >
                                        <option value="small">Pequeño</option>
                                        <option value="medium">Mediano</option>
                                        <option value="large">Grande</option>
                                        <option value="extralarge">Extra Grande</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="news-orientation">Orientación:</label>
                                    <select
                                        id="news-orientation"
                                        value={newArticle.orientation}
                                        onChange={(e) =>
                                            setNewArticle({
                                                ...newArticle,
                                                orientation: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="vertical">Vertical</option>
                                        <option value="horizontal">Horizontal</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <button type="submit">Guardar Noticia</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ===== Modal “Editar Noticia” ===== */}
                {isEditModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <button className="modal-close-btn" onClick={closeEditModal}>
                                &times;
                            </button>
                            <h2>Editar Noticia</h2>
                            <form id="edit-news-form" onSubmit={handleEditSubmit}>
                                <input
                                    type="hidden"
                                    id="edit-news-section-id"
                                    name="sectionId"
                                    value={editArticle.sectionId}
                                />
                                <input
                                    type="hidden"
                                    id="edit-news-id"
                                    name="newsId"
                                    value={editArticle.newsId}
                                />
                                <div className="form-group">
                                    <label htmlFor="edit-news-title">Título:</label>
                                    <input
                                        type="text"
                                        id="edit-news-title"
                                        name="title"
                                        value={editArticle.title}
                                        onChange={(e) =>
                                            setEditArticle({ ...editArticle, title: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="edit-news-summary">Resumen:</label>
                                    <textarea
                                        id="edit-news-summary"
                                        name="summary"
                                        value={editArticle.summary}
                                        onChange={(e) =>
                                            setEditArticle({ ...editArticle, summary: e.target.value })
                                        }
                                        required
                                    ></textarea>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="edit-news-category">Categoría:</label>
                                    <input
                                        type="text"
                                        id="edit-news-category"
                                        name="category"
                                        value={editArticle.category}
                                        onChange={(e) =>
                                            setEditArticle({ ...editArticle, category: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="edit-news-image-url">URL de la Imagen:</label>
                                    <input
                                        type="url"
                                        id="edit-news-image-url"
                                        name="imageUrl"
                                        value={editArticle.imageUrl}
                                        onChange={(e) =>
                                            setEditArticle({
                                                ...editArticle,
                                                imageUrl: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                    <small>
                                        Por favor, usá una URL válida (.png, .jpg, etc.).
                                    </small>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="edit-news-link">Enlace (opcional):</label>
                                    <input
                                        type="url"
                                        id="edit-news-link"
                                        name="link"
                                        value={editArticle.link}
                                        onChange={(e) =>
                                            setEditArticle({ ...editArticle, link: e.target.value })
                                        }
                                        placeholder="#"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="edit-news-size">Tamaño:</label>
                                    <select
                                        id="edit-news-size"
                                        value={editArticle.size}
                                        onChange={(e) =>
                                            setEditArticle({ ...editArticle, size: e.target.value })
                                        }
                                    >
                                        <option value="small">Pequeño</option>
                                        <option value="medium">Mediano</option>
                                        <option value="large">Grande</option>
                                        <option value="extralarge">Extra Grande</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="edit-news-orientation">Orientación:</label>
                                    <select
                                        id="edit-news-orientation"
                                        value={editArticle.orientation}
                                        onChange={(e) =>
                                            setEditArticle({
                                                ...editArticle,
                                                orientation: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="vertical">Vertical</option>
                                        <option value="horizontal">Horizontal</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <button type="submit">Guardar Cambios</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </>
        );
    }
);

export default ArticlesAdminList;
