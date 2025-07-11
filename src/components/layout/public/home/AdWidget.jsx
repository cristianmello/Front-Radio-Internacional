import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useEditable } from "../../../../hooks/useEditable";

const defaultData = {
    disclaimer: "Publicidad",
    imageUrl: "https://source.unsplash.com/random/300x250/?ad",
    alt: "Anuncio",
    linkUrl: "#",
};

export default function AdWidget({ isAdminMode, initialData, onUpdate }) {
    const [data, setData] = useState({ ...defaultData, ...initialData });
    useEffect(() => { setData({ ...defaultData, ...initialData }); }, [initialData]);

    const update = fields => {
        setData(prev => ({ ...prev, ...fields }));
        onUpdate?.(fields);
    };

    const refs = {
        disclaimer: useRef(),
        image: useRef(),
        link: useRef(),
    };

    useEditable(refs.disclaimer, "text", () => ({ html: data.disclaimer }), () => ({}), vals => update({ disclaimer: vals.html }), { field: "disclaimer" });
    useEditable(refs.image, "image", () => ({ src: data.imageUrl, alt: data.alt }), () => ({ presets: ["ad", "promo"] }), vals => update({ imageUrl: vals.src, alt: vals.alt }), { field: "image" });
    useEditable(refs.link, "link", () => ({ href: data.linkUrl }), () => ({ label: "URL del anuncio" }), vals => update({ linkUrl: vals.href }), { field: "link" });

    return (
        <div className="widget ad-widget">
            <div ref={refs.disclaimer} className={isAdminMode ? "editable ad-disclaimer" : "ad-disclaimer"} style={{ cursor: isAdminMode ? "pointer" : "default" }}>
                {data.disclaimer}
            </div>
            <a
                ref={refs.link}
                href={data.linkUrl}
                onClick={e => isAdminMode && e.preventDefault()}
                style={{ display: "block", cursor: isAdminMode ? "pointer" : "default" }}
            >
                <div ref={refs.image} className={isAdminMode ? "editable" : ""}>
                    <img src={data.imageUrl} alt={data.alt} />
                </div>
            </a>
        </div>
    );
}

AdWidget.propTypes = {
    isAdminMode: PropTypes.bool,
    initialData: PropTypes.object,
    onUpdate: PropTypes.func,
};
