import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicyPage = () => {
    return (
        <div className="container">
            <section className="content-section-footer">
                <h2>Política de Privacidad</h2>
                <p><strong>Última actualización:</strong> 10 de julio de 2025</p>

                <h3>1. Marco Legal e Introducción</h3>
                <p>
                    Bienvenido a Realidad Nacional. Tu privacidad es de suma importancia para nosotros. Esta Política de Privacidad se ajusta a lo dispuesto en la <strong>Ley N° 18.331 de 11 de agosto de 2008</strong> y el <strong>Decreto N° 414/009 de 21 de agosto de 2009</strong> sobre Protección de Datos Personales y Habeas Data. Su objetivo es informarte de manera clara y transparente sobre qué datos personales recopilamos, cómo los utilizamos, con quién los compartimos y cuáles son tus derechos.
                </p>

                <h3>2. Responsable del Tratamiento de Datos</h3>
                <p>
                    El responsable del tratamiento de tus datos es <strong>Realidad Nacional</strong> ("nosotros", "nuestro"), con domicilio en Av. Sarandí 792, Rivera, Uruguay. {/*Puedes contactarnos a través de nuestro <Link to="/contact">formulario de contacto</Link> o directamente en el correo electrónico: <a href="mailto:contacto@radiointernacional.com.uy">contacto@radiointernacional.com.uy</a>.*/}
                </p>

                <h3>3. Información que Recopilamos</h3>
                <p>
                    Para proporcionarte nuestros servicios, recopilamos los siguientes tipos de información:
                </p>
                <ul>
                    <li><strong>Datos de Identificación que nos proporcionas:</strong> Nombre, apellido, correo electrónico, fecha de nacimiento y, opcionalmente, tu número de teléfono cuando te registras o nos contactas.</li>
                    <li><strong>Credenciales de Seguridad:</strong> Tu contraseña de manera cifrada (hashed). Nunca almacenamos tu contraseña en texto plano.</li>
                    <li><strong>Información Técnica y de Conexión:</strong> Dirección IP, tipo de navegador y sistema operativo (user agent) cuando te registras, inicias sesión o interactúas con nuestros servicios. Esto se hace por motivos de seguridad y para prevenir fraudes.</li>
                    <li><strong>Contenido Generado por el Usuario:</strong> Imágenes de perfil que decidas subir.</li>
                </ul>

                <h3>4. Finalidad y Legitimación del Tratamiento</h3>
                <p>
                    La base de legitimación para el tratamiento de tus datos es tu <strong>consentimiento informado</strong>, que nos otorgas al registrarte o utilizar nuestros servicios. Utilizamos la información que recopilamos para las siguientes finalidades:
                </p>
                <ul>
                    <li><strong>Proveer y gestionar nuestros servicios:</strong> Para crear y administrar tu cuenta de usuario, autenticar tu identidad y permitirte el acceso a las funciones de la plataforma.</li>
                    <li><strong>Comunicación Contigo:</strong> Para enviar correos electrónicos transaccionales importantes, como la verificación de tu cuenta, notificaciones sobre tu cuenta y respuestas a tus consultas.</li>
                    <li><strong>Personalización:</strong> Para permitirte tener un perfil con una imagen personalizada.</li>
                </ul>
                <p>No estás obligado a proporcionar tus datos, pero algunos son indispensables para el funcionamiento de los servicios. De no contar con ellos, podríamos vernos imposibilitados de prestarlos.</p>

                <h3>5. Comunicación y Transferencia Internacional de Datos</h3>
                <p>
                    No vendemos ni alquilamos tus datos personales. Sin embargo, para operar, compartimos información con proveedores de servicios de confianza. Esto constituye una transferencia internacional de datos, ya que sus servidores pueden estar fuera de Uruguay:
                </p>
                <p>
                    Estos proveedores están obligados contractualmente a proteger tu información y solo pueden utilizarla para los fines específicos para los que fueron contratados.
                </p>

                <h3>6. Seguridad de tus Datos</h3>
                <p>
                    Nos tomamos la seguridad de tus datos muy en serio. Implementamos medidas técnicas y organizativas para proteger tu información contra el acceso no autorizado, la alteración o la destrucción.
                </p>

                <h3>7. Plazo de Conservación de los Datos</h3>
                <p>
                    Conservaremos tus datos personales mientras sean necesarios para las finalidades para las que fueron recolectados, mientras mantengas tu cuenta activa con nosotros, o hasta que revoques tu consentimiento. Una vez que solicites la eliminación de tu cuenta, tus datos serán eliminados de forma segura, salvo que debamos conservarlos durante un tiempo adicional para cumplir con obligaciones legales.
                </p>

                <h3>8. Derechos de los Titulares de los Datos</h3>
                <p>
                    De acuerdo con la legislación uruguaya, previa acreditación de tu identidad, tienes derecho a ejercer tus derechos de <strong>Acceso, Rectificación, Actualización, Inclusión y Supresión (Cancelación)</strong> de tus datos.
                </p>

                <h3>9. Enlaces a Sitios de Terceros</h3>
                <p>
                    Nuestra página puede contener enlaces a otros sitios web. Esta Política de Privacidad se aplica exclusivamente a los datos recopilados en nuestro sitio. No somos responsables de las prácticas de privacidad de sitios externos.
                </p>

                <h3>10. Cambios en esta Política</h3>
                <p>
                    Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos sobre cualquier cambio importante publicando la nueva política en esta página y actualizando la fecha de "Última actualización" en la parte superior. El uso continuado de nuestros servicios después de dichos cambios constituirá tu aceptación de los mismos.
                </p>

                <h3>11. Ley Aplicable y Jurisdicción</h3>
                <p>
                    Esta Política de Privacidad se rige en todos sus puntos por las leyes de la República Oriental del Uruguay. Cualquier controversia será sometida a los tribunales de la ciudad de Rivera.
                </p>
            </section>
        </div>
    );
};

export default PrivacyPolicyPage;
