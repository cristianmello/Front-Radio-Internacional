import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useEditable } from "../../../../hooks/useEditable";

const defaultData = {
    heading: "Suscríbete",
    description: "Recibe las noticias más importantes del día en tu correo",
    inputPlaceholder: "Tu correo electrónico",
    buttonText: "Suscribirse",
};

export default function NewsletterWidget({ isAdminMode, initialData, onUpdate }) {
    const [data, setData] = useState({ ...defaultData, ...initialData });
    useEffect(() => { setData({ ...defaultData, ...initialData }); }, [initialData]);

    const update = fields => {
        setData(prev => ({ ...prev, ...fields }));
        onUpdate?.(fields);
    };

    const refs = {
        heading: useRef(),
        description: useRef(),
        inputPlaceholder: useRef(),
        buttonText: useRef(),
    };

    useEditable(refs.heading, "text", () => ({ html: data.heading }), () => ({}), vals => update({ heading: vals.html }), { field: "heading" });
    useEditable(refs.description, "text", () => ({ html: data.description }), () => ({}), vals => update({ description: vals.html }), { field: "description" });
    useEditable(refs.inputPlaceholder, "text", () => ({ html: data.inputPlaceholder }), () => ({ label: "Placeholder" }), vals => update({ inputPlaceholder: vals.html }), { field: "inputPlaceholder" });
    useEditable(refs.buttonText, "text", () => ({ html: data.buttonText }), () => ({ label: "Botón" }), vals => update({ buttonText: vals.html }), { field: "buttonText" });

    return (
        <div className="widget newsletter">
            <h3 ref={refs.heading} className={isAdminMode ? "editable" : ""} style={{ cursor: isAdminMode ? "pointer" : "default" }}>
                {data.heading}
            </h3>
            <p ref={refs.description} className={isAdminMode ? "editable" : ""} style={{ cursor: isAdminMode ? "pointer" : "default" }}>
                {data.description}
            </p>
            <form>
                <input
                    ref={refs.inputPlaceholder}
                    type="email"
                    placeholder={data.inputPlaceholder}
                    onClick={e => isAdminMode && e.preventDefault()}
                    style={{ cursor: isAdminMode ? "pointer" : "text" }}
                />
                <button
                    ref={refs.buttonText}
                    onClick={e => isAdminMode && e.preventDefault()}
                    style={{ cursor: isAdminMode ? "pointer" : "pointer" }}
                >
                    {data.buttonText}
                </button>
            </form>
        </div>
    );
}

NewsletterWidget.propTypes = {
    isAdminMode: PropTypes.bool,
    initialData: PropTypes.object,
    onUpdate: PropTypes.func,
};
