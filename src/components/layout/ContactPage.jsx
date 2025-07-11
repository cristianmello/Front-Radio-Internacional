import React from "react";
//import "../../assets/css/contactpage/Contact.css";

const ContactPage = () => {
  return (
    <>
      <main>
        <section className="contact-form">
          <h2>Contáctenos</h2>
          <p style={{ textAlign: "center", marginBottom: "2rem", color: "#555" }}>
            ¿Tiene alguna pregunta, comentario o sugerencia? Nos encantaría saber de usted.
          </p>
          <form>
            <div className="form-group">
              <label htmlFor="name">Nombre:</label>
              <input type="text" id="name" name="name" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico:</label>
              <input type="email" id="email" name="email" required />
            </div>
            <div className="form-group">
              <label htmlFor="subject">Asunto:</label>
              <input type="text" id="subject" name="subject" required />
            </div>
            <div className="form-group">
              <label htmlFor="message">Mensaje:</label>
              <textarea id="message" name="message" required></textarea>
            </div>
            <div className="form-group">
              <button type="submit">Enviar Mensaje</button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
};

export default ContactPage;
