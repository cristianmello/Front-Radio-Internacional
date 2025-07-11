
// src/components/layout/public/home/CreateArticleModal.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import useCategories from "../../../../hooks/useCategories";
import useAuth from "../../../../hooks/UseAuth";
import Url from "../../../../helpers/Url";

const defaultContentHTML = `
            <p>En un giro inesperado que ha sorprendido a la comunidad internacional, los líderes de dos naciones históricamente enfrentadas han firmado hoy un acuerdo de paz que pone fin a décadas de conflicto. El tratado, negociado en secreto durante los últimos seis meses, establece un marco para la cooperación económica, cultural y política entre ambos países.</p>
            
            <p>"Este es un día que pasará a la historia como el momento en que elegimos la paz sobre la guerra, la cooperación sobre el conflicto", declaró uno de los mandatarios durante la ceremonia de firma, visiblemente emocionado. Su homólogo añadió que "las generaciones futuras nos juzgarán por nuestra valentía para romper con el pasado".</p>
            
            <p>El acuerdo incluye disposiciones para:</p>
            <ul>
                <li>La desmilitarización gradual de las zonas fronterizas</li>
                <li>La creación de una comisión conjunta para resolver disputas territoriales pendientes</li>
                <li>El establecimiento de un corredor comercial libre de aranceles</li>
                <li>Programas de intercambio cultural y educativo entre universidades de ambos países</li>
            </ul>
            
            <p>Los analistas internacionales han recibido el acuerdo con cautela pero optimismo. "Es un primer paso crucial, pero la implementación será el verdadero desafío", comentó la Dra. Elena Ramírez, especialista en relaciones internacionales de la Universidad Central.</p>
            
            <p>Los mercados financieros han reaccionado positivamente, con un alza significativa en las bolsas de ambos países. Empresas multinacionales ya han anunciado planes de inversión en la región, anticipando un período de estabilidad y crecimiento económico.</p>
            
            <p>Sin embargo, grupos de la oposición en ambos países han expresado preocupaciones sobre ciertas cláusulas del acuerdo, argumentando que podrían comprometer la soberanía nacional. Se esperan manifestaciones tanto de apoyo como de protesta en las próximas semanas.</p>
            
            <p>Los líderes mundiales han felicitado a ambos gobiernos por su valentía y visión. El Secretario General de las Naciones Unidas ha ofrecido el apoyo de la organización para supervisar la implementación del acuerdo y facilitar el diálogo continuo.</p>
            
            <p>Este tratado de paz marca un punto de inflexión para una región que ha sufrido conflictos intermitentes durante más de cincuenta años, con un costo humano estimado en más de 100,000 vidas y millones de desplazados. Los ciudadanos de ambas naciones han expresado esperanza de que este acuerdo traiga finalmente una paz duradera y prosperidad compartida.</p>
`;

export default function CreateArticleModal({ onSave, onCancel }) {
    const modalContentRef = useRef(null);
    const { categories, loading: loadingCategories, error: errorCategories } = useCategories();
    const { auth } = useAuth();

    // Estados del formulario
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [excerpt, setExcerpt] = useState("");

    // const [isPremium, setIsPremium] = useState(false); // Comentado como solicitaste.

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        if (formError && modalContentRef.current) {
            modalContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [formError]);

    // Generación automática del slug
    useEffect(() => {
        const generateSlug = (text) =>
            text
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9 ]/g, "")
                .trim()
                .replace(/\s+/g, "-");
        setSlug(generateSlug(title));
    }, [title]);

    if (loadingCategories) {
        return (
            <div className="modal-edit active">
                <div className="modal-edit-content">Cargando categorías...</div>
            </div>
        );
    }
    if (errorCategories) {
        return (
            <div className="modal-edit active">
                <div className="modal-edit-content">Error cargando categorías.</div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!title || !categoryId) {
            setFormError("El Título y la Categoría son campos obligatorios.");
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();

        formData.append("article_title", title);
        formData.append("article_slug", slug);
        formData.append("article_category_id", categoryId);
        formData.append("article_excerpt", excerpt);
        formData.append("article_content", defaultContentHTML);
        formData.append("article_is_published", "false"); // Se envía como string

        if (imageFile) {
            // --- CORRECCIÓN DEL CAMPO DE IMAGEN ---
            // Se usa el nombre de campo que espera tu middleware multer: 'article_image_url'
            formData.append("article_image_url", imageFile);
        }

        const result = (await onSave(formData)) || {};

        if (!result.success) {
            console.error("Error al crear artículo:", result);
            setFormError(result.message || "Ocurrió un error. Revisa la consola.");
        } else {
            onCancel();
        }
        setIsSubmitting(false);
    };
    const filteredCategories = categories.filter(cat => cat.category_slug !== 'inicio');

    return (
        <div className="modal-edit active" id="createArticleModal">
            <div className="modal-edit-content" ref={modalContentRef}>
                <div className="modal-edit-title">Crear Nuevo Borrador de Artículo</div>
                <form onSubmit={handleSubmit} className="edit-form" encType="multipart/form-data">

                    {formError && <p className="error-message">{formError}</p>}

                    <h4>Información Básica</h4>
                    <div className="edit-field">
                        <label>Título:</label>
                        <input type="text" value={title} required onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="edit-field">
                        <label>Slug (auto):</label>
                        <input type="text" value={slug} readOnly />
                    </div>
                    <div className="edit-field">
                        <label>Categoría:</label>
                        <select value={categoryId} required onChange={(e) => setCategoryId(e.target.value)}>
                            <option value="" disabled>-- Elige una --</option>
                            {filteredCategories.map((cat) => (
                                <option key={cat.category_code} value={cat.category_code}>{cat.category_name}</option>
                            ))}
                        </select>
                    </div>

                    <h4>Extracto</h4>
                    <div className="edit-field">
                        <textarea value={excerpt} maxLength={500} onChange={(e) => setExcerpt(e.target.value)} />
                        <small>{excerpt.length}/500</small>
                    </div>

                    <h4>Imagen Principal</h4>
                    <div className="edit-field">
                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setImageFile(e.target.files[0])} />
                    </div>
                    {imageFile && (
                        <div className="image-preview">
                            <img src={URL.createObjectURL(imageFile)} alt="Vista previa" />
                        </div>
                    )}

                    <div className="edit-buttons">
                        <button type="button" className="btn-cancel" onClick={onCancel} disabled={isSubmitting}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-save" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    <span style={{ marginLeft: '8px' }}>Creando...</span>
                                </>
                            ) : "Crear Borrador"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

CreateArticleModal.propTypes = {
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

/*// src/components/layout/public/home/CreateArticleModal.jsx
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import useCategories from "../../../../hooks/useCategories";

// 1) Definimos aquí el contenido fijo tal cual en tu ArticlePage.
// He puesto un ejemplo simplificado; ajusta el HTML al que quieras.
const defaultContentHTML = `
            <p>En un giro inesperado que ha sorprendido a la comunidad internacional, los líderes de dos naciones históricamente enfrentadas han firmado hoy un acuerdo de paz que pone fin a décadas de conflicto. El tratado, negociado en secreto durante los últimos seis meses, establece un marco para la cooperación económica, cultural y política entre ambos países.</p>
            
            <div class="article-image-full">
                <img src="https://source.unsplash.com/random/1000x600/?peace-agreement" alt="Firma del acuerdo de paz">
                <div class="article-image-caption">Momento histórico durante la firma del acuerdo en la cumbre internacional</div>
            </div>
            
            <p>"Este es un día que pasará a la historia como el momento en que elegimos la paz sobre la guerra, la cooperación sobre el conflicto", declaró uno de los mandatarios durante la ceremonia de firma, visiblemente emocionado. Su homólogo añadió que "las generaciones futuras nos juzgarán por nuestra valentía para romper con el pasado".</p>
            
            <p>El acuerdo incluye disposiciones para:</p>
            <ul>
                <li>La desmilitarización gradual de las zonas fronterizas</li>
                <li>La creación de una comisión conjunta para resolver disputas territoriales pendientes</li>
                <li>El establecimiento de un corredor comercial libre de aranceles</li>
                <li>Programas de intercambio cultural y educativo entre universidades de ambos países</li>
            </ul>
            
            <p>Los analistas internacionales han recibido el acuerdo con cautela pero optimismo. "Es un primer paso crucial, pero la implementación será el verdadero desafío", comentó la Dra. Elena Ramírez, especialista en relaciones internacionales de la Universidad Central.</p>
            
            <div class="article-image-full">
                <img src="https://source.unsplash.com/random/1000x600/?diplomacy" alt="Delegaciones diplomáticas">
                <div class="article-image-caption">Las delegaciones diplomáticas durante las negociaciones previas al acuerdo</div>
            </div>
            
            <p>Los mercados financieros han reaccionado positivamente, con un alza significativa en las bolsas de ambos países. Empresas multinacionales ya han anunciado planes de inversión en la región, anticipando un período de estabilidad y crecimiento económico.</p>
            
            <p>Sin embargo, grupos de la oposición en ambos países han expresado preocupaciones sobre ciertas cláusulas del acuerdo, argumentando que podrían comprometer la soberanía nacional. Se esperan manifestaciones tanto de apoyo como de protesta en las próximas semanas.</p>
            
            <p>Los líderes mundiales han felicitado a ambos gobiernos por su valentía y visión. El Secretario General de las Naciones Unidas ha ofrecido el apoyo de la organización para supervisar la implementación del acuerdo y facilitar el diálogo continuo.</p>
            
            <p>Este tratado de paz marca un punto de inflexión para una región que ha sufrido conflictos intermitentes durante más de cincuenta años, con un costo humano estimado en más de 100,000 vidas y millones de desplazados. Los ciudadanos de ambas naciones han expresado esperanza de que este acuerdo traiga finalmente una paz duradera y prosperidad compartida.</p>
`;


export default function CreateArticleModal({ onSave, onCancel }) {
    const { categories, loading: loadingCategories, error: errorCategories } = useCategories();

    // 2) Eliminamos el state de content, ya no se usa
    const [slug, setSlug] = useState("");
    const [title, setTitle] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [excerpt, setExcerpt] = useState("");
    const [publishedAt, setPublishedAt] = useState("");
    const [isPublished, setIsPublished] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Slug automático
    useEffect(() => {
        const generateSlug = (text) =>
            text
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9 ]/g, "")
                .trim()
                .replace(/\s+/g, "-");
        setSlug(generateSlug(title));
    }, [title]);

    // Fecha por defecto
    useEffect(() => {
        const hoy = new Date().toISOString().split("T")[0];
        setPublishedAt(hoy);
    }, []);

    if (loadingCategories) {
        return (
            <div className="modal-edit active">
                <div className="modal-edit-content">Cargando categorías...</div>
            </div>
        );
    }
    if (errorCategories) {
        return (
            <div className="modal-edit active">
                <div className="modal-edit-content">Error cargando categorías.</div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        // validaciones
        if (!title || !categoryId) {
            alert("Completa Título y Categoría.");
            return;
        }
        if (excerpt.length > 300) {
            alert("El extracto no puede superar 300 caracteres.");
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("article_slug", slug);
        formData.append("article_title", title);
        formData.append("article_category_id", categoryId);
        if (imageFile) formData.append("article_image_url", imageFile);
        formData.append("article_excerpt", excerpt);
        // 3) Insertamos siempre el contenido por defecto
        formData.append("article_content", defaultContentHTML);
        formData.append("article_published_at", publishedAt);
        formData.append("article_is_published", isPublished);
        formData.append("article_is_premium", isPremium);

        const result = (await onSave(formData)) || {};
        if (!result.success) {
            console.error("Error de validación al crear artículo:", result);
            alert("Error al añadir artículo: " + (result.message || "Revisa consola"));
        } else {
            onCancel();
        }
        setIsSubmitting(false);
    };

    return (
        <div className="modal-edit active" id="createArticleModal">
            <div className="modal-edit-content">
                <div className="modal-edit-title">Crear Nuevo Artículo</div>
                <form onSubmit={handleSubmit} className="edit-form">

                    <h4>Información Básica</h4>
                    <div className="edit-field">
                        <label>Título:</label>
                        <input
                            type="text"
                            value={title}
                            required
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="edit-field">
                        <label>Slug (auto):</label>
                        <input type="text" value={slug} readOnly />
                    </div>
                    <div className="edit-field">
                        <label>Categoría:</label>
                        <select
                            value={categoryId}
                            required
                            onChange={(e) => setCategoryId(e.target.value)}
                        >
                            <option value="" disabled>-- Elige una --</option>
                            {categories.map((cat) => (
                                <option key={cat.category_code} value={cat.category_code}>
                                    {cat.category_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <h4>Extracto</h4>
                    <div className="edit-field">
                        <textarea
                            value={excerpt}
                            maxLength={300}
                            onChange={(e) => setExcerpt(e.target.value)}
                        />
                        <small>{excerpt.length}/300</small>
                    </div>

                    <h4>Imagen</h4>
                    <div className="edit-field">
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => setImageFile(e.target.files[0])}
                        />
                    </div>
                    {imageFile && (
                        <div className="image-preview">
                            <img src={URL.createObjectURL(imageFile)} alt="Vista previa" />
                        </div>
                    )}

                    <h4>Publicación</h4>
                    <div className="edit-field">
                        <label>Fecha de publicación:</label>
                        <input
                            type="date"
                            value={publishedAt}
                            onChange={(e) => setPublishedAt(e.target.value)}
                        />
                    </div>
                    <div className="edit-field checkbox-field">
                        <label>
                            <input
                                type="checkbox"
                                checked={isPublished}
                                onChange={() => setIsPublished(!isPublished)}
                            />{" "}
                            Publicado
                        </label>
                    </div>
                    <div className="edit-field checkbox-field">
                        <label>
                            <input
                                type="checkbox"
                                checked={isPremium}
                                onChange={() => setIsPremium(!isPremium)}
                            />{" "}
                            Premium
                        </label>
                    </div>

                    <div className="edit-buttons">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-save"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Creando..." : "Crear"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

CreateArticleModal.propTypes = {
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};


*/
{/* Funcionaaaaaimport React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import useCategories from "../../../../hooks/useCategories";

export default function CreateArticleModal({ onSave, onCancel }) {
    const { categories, loading: loadingCategories, error: errorCategories } = useCategories();

    // Estados del formulario
    const [slug, setSlug] = useState("");
    const [title, setTitle] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [excerpt, setExcerpt] = useState("");
    const [content, setContent] = useState("");
    const [publishedAt, setPublishedAt] = useState("");
    const [isPublished, setIsPublished] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. Generar slug automáticamente a partir del título
    useEffect(() => {
        const generateSlug = (text) =>
            text
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "") // quita tildes
                .replace(/[^a-z0-9 ]/g, "")
                .trim()
                .replace(/\s+/g, "-");
        setSlug(generateSlug(title));
    }, [title]);

    // 2. Fecha por defecto hoy
    useEffect(() => {
        const hoy = new Date().toISOString().split("T")[0];
        setPublishedAt(hoy);
    }, []);

    if (loadingCategories) {
        return (
            <div className="modal-edit active">
                <div className="modal-edit-content">Cargando categorías...</div>
            </div>
        );
    }

    if (errorCategories) {
        return (
            <div className="modal-edit active">
                <div className="modal-edit-content">Error cargando categorías.</div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 3. Validaciones básicas
        if (!title || !categoryId || !content) {
            alert("Completa Título, Categoría y Contenido.");
            return;
        }
        if (excerpt.length > 300) {
            alert("El extracto no puede superar 300 caracteres.");
            return;
        }

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append("article_slug", slug);
        formData.append("article_title", title);
        formData.append("article_category_id", categoryId);
        if (imageFile) formData.append("article_image_url", imageFile);
        formData.append("article_excerpt", excerpt);
        formData.append("article_content", content);
        formData.append("article_published_at", publishedAt);
        formData.append("article_is_published", isPublished);
        formData.append("article_is_premium", isPremium);

        const result = (await onSave(formData)) || {};
        if (!result.success) {
            console.error("Error de validación al crear artículo:", result);
            alert("Error al añadir artículo: " + (result.message || "Revisa la consola"));
        } else {
            onCancel();
        }

        setIsSubmitting(false);
    };

    return (
        <div className="modal-edit active" id="createArticleModal">
            <div className="modal-edit-content">
                <div className="modal-edit-title">Crear Nuevo Artículo</div>
                <form id="createForm" onSubmit={handleSubmit} className="edit-form">
                    <h4>Información Básica</h4>
                    <div className="edit-field">
                        <label>Título:</label>
                        <input
                            type="text"
                            value={title}
                            required
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="edit-field">
                        <label>Slug (auto):</label>
                        <input
                            type="text"
                            value={slug}
                            readOnly
                        />
                    </div>
                    <div className="edit-field">
                        <label>Categoría:</label>
                        <select
                            value={categoryId}
                            required
                            onChange={(e) => setCategoryId(e.target.value)}
                        >
                            <option value="" disabled>
                                -- Elige una --
                            </option>
                            {categories.map((cat) => (
                                <option key={cat.category_code} value={cat.category_code}>
                                    {cat.category_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <h4>Contenido</h4>
                    <div className="edit-field">
                        <label>Contenido:</label>
                        <textarea
                            value={content}
                            required
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                    <div className="edit-field">
                        <label>Extracto (máx. 300):</label>
                        <textarea
                            value={excerpt}
                            maxLength={300}
                            onChange={(e) => setExcerpt(e.target.value)}
                        />
                        <small>{excerpt.length}/300</small>
                    </div>
                    <div className="edit-field">
                        <label>Imagen:</label>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => setImageFile(e.target.files[0])}
                        />
                    </div>
                    {imageFile && (
                        <div className="image-preview">
                            <img
                                src={URL.createObjectURL(imageFile)}
                                alt="Vista previa"
                            />
                        </div>
                    )}

                    <h4>Publicación</h4>
                    <div className="edit-field">
                        <label>Fecha de publicación:</label>
                        <input
                            type="date"
                            value={publishedAt}
                            onChange={(e) => setPublishedAt(e.target.value)}
                        />
                    </div>
                    <div className="edit-field checkbox-field">
                        <label>
                            <input
                                type="checkbox"
                                checked={isPublished}
                                onChange={() => setIsPublished(!isPublished)}
                            />{" "}
                            Publicado
                        </label>
                    </div>
                    <div className="edit-field checkbox-field">
                        <label>
                            <input
                                type="checkbox"
                                checked={isPremium}
                                onChange={() => setIsPremium(!isPremium)}
                            />{" "}
                            Premium
                        </label>
                    </div>

                    <div className="edit-buttons">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-save"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Creando..." : "Crear"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

CreateArticleModal.propTypes = {
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};
*/}