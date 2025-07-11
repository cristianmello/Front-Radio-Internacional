// src/components/layout/public/home/AdSection.jsx
import React from "react";

const AdSection = () => {
  return (
    <section className="ad-section">
      <div className="ad-container">
        <div className="ad-disclaimer">Publicidad</div>
        <div className="ad-large">
          <a href="#">
            <img
              src="https://source.unsplash.com/random/970x250/?advertisement"
              alt="Anuncio"
            />
          </a>
        </div>
      </div>
    </section>
  );
};

export default AdSection;
