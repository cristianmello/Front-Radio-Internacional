import React from "react";
import MainControls from "../private/content/MainControls";
import NewsListSection from "./home/NewsListSection";
import FeaturedNewsSection from "./home/FeaturedNewsSection";

const Main = () => {
  return (
    <main>
      <MainControls />
      <section id="news-container" className="news-container"></section>
      <NewsListSection />
      <FeaturedNewsSection />
      <div id="dynamic-sections-container"></div>
    </main>
  );
};

export default Main;

















/*import React from "react";

const Main = () => {
  return (
    
    <main>
        <section class="controls-section">
            <div class="control-group">
                 <span>Tamaño:</span>
                 <button data-size="small">Pequeño</button>
                 <button data-size="medium">Mediano</button>
                 <button data-size="large">Grande</button>
                 <button data-size="extralarge">Extra Grande</button>
            </div>
            <div class="control-group">
                <span>Orientación:</span>
                <button data-orientation="vertical">Vertical</button>
                <button data-orientation="horizontal">Horizontal</button>
            </div>
             <button id="confirm-action-btn" disabled>Deseleccionar Todo</button>
             <button id="add-news-btn">Añadir Noticia</button>
             <button id="add-section-btn">Añadir Contenedor</button> 
        </section>

        <section id="news-container" class="news-container">
            <!-- News cards will be populated by JS -->
        </section>

        <!-- New: List-Based News Section -->
        <section class="list-news-section editable-section" data-section-id="ultimas-noticias" data-section-type="list">
            <div class="section-header">
                <h1 class="section-title editable-title" data-title-id="ultimas-noticias-title">Últimas Noticias</h1>
                <button class="edit-general-btn edit-title-btn" data-target-id="ultimas-noticias-title" title="Editar Título">&#9998;</button>
                <button class="edit-general-btn edit-section-color-btn" data-target-id="ultimas-noticias" title="Editar Color Fondo">&#127912;</button>
                <button class="edit-general-btn delete-section-btn" data-target-id="ultimas-noticias" title="Eliminar Sección">&#128465;</button>
                <button class="add-content-to-section-btn" data-target-section="ultimas-noticias" title="Añadir Titular a esta Sección">+</button> 
            </div>
            <ul class="headline-list">
                <li data-headline-id="headline-1"><a href="#"><strong>Economía:</strong> El Banco Central mantiene las tasas de interés en medio de la incertidumbre global.</a> <span class="headline-time">hace 5 min</span> <button class="edit-general-btn edit-headline-btn" data-target-id="headline-1" title="Editar Titular">&#9998;</button> <button class="edit-general-btn delete-headline-btn" data-target-id="headline-1" title="Eliminar Titular">&#128465;</button></li>
                <li data-headline-id="headline-2"><a href="#"><strong>Política:</strong> El parlamento debate nueva legislación sobre energías renovables.</a> <span class="headline-time">hace 15 min</span> <button class="edit-general-btn edit-headline-btn" data-target-id="headline-2" title="Editar Titular">&#9998;</button> <button class="edit-general-btn delete-headline-btn" data-target-id="headline-2" title="Eliminar Titular">&#128465;</button></li>
                <li data-headline-id="headline-3"><a href="#"><strong>Deportes:</strong> Resultados de la última jornada de la liga local de fútbol.</a> <span class="headline-time">hace 30 min</span> <button class="edit-general-btn edit-headline-btn" data-target-id="headline-3" title="Editar Titular">&#9998;</button> <button class="edit-general-btn delete-headline-btn" data-target-id="headline-3" title="Eliminar Titular">&#128465;</button></li>
                <li data-headline-id="headline-4"><a href="#"><strong>Tecnología:</strong> Lanzamiento de nuevo smartphone insignia genera expectativas.</a> <span class="headline-time">hace 1 hora</span> <button class="edit-general-btn edit-headline-btn" data-target-id="headline-4" title="Editar Titular">&#9998;</button> <button class="edit-general-btn delete-headline-btn" data-target-id="headline-4" title="Eliminar Titular">&#128465;</button></li>
                <li data-headline-id="headline-5"><a href="#"><strong>Cultura:</strong> Inauguración de exposición de arte contemporáneo en el museo nacional.</a> <span class="headline-time">hace 2 horas</span> <button class="edit-general-btn edit-headline-btn" data-target-id="headline-5" title="Editar Titular">&#9998;</button> <button class="edit-general-btn delete-headline-btn" data-target-id="headline-5" title="Eliminar Titular">&#128465;</button></li>
                <li data-headline-id="headline-6"><a href="#"><strong>Internacional:</strong> Negociaciones comerciales avanzan entre bloques económicos.</a> <span class="headline-time">hace 3 horas</span> <button class="edit-general-btn edit-headline-btn" data-target-id="headline-6" title="Editar Titular">&#9998;</button> <button class="edit-general-btn delete-headline-btn" data-target-id="headline-6" title="Eliminar Titular">&#128465;</button></li>
            </ul>
        </section>

        <!-- New: Featured Section with Different Background -->
        <section class="featured-section editable-section" data-section-id="destacados" data-section-type="featured">
            <div class="section-header">
                <h1 class="section-title editable-title" data-title-id="destacados-title">Destacados Internacionales</h1>
                <button class="edit-general-btn edit-title-btn" data-target-id="destacados-title" title="Editar Título">&#9998;</button>
                <button class="edit-general-btn edit-section-color-btn" data-target-id="destacados" title="Editar Color Fondo">&#127912;</button>
                <button class="edit-general-btn delete-section-btn" data-target-id="destacados" title="Eliminar Sección">&#128465;</button>
                 <button class="add-content-to-section-btn" data-target-section="destacados" title="Añadir Destacado a esta Sección">+</button> 
            </div>
            <div class="featured-news-items">
                <!-- Example Featured Item 1 -->
                <article class="featured-news-item editable-featured" data-featured-id="featured-1">
                    <img src="/news_image_2.png" alt="Cumbre Económica" loading="lazy">
                    <div class="featured-news-content">
                        <span class="category">Economía</span>
                        <h3>Análisis Post-Cumbre</h3>
                        <p>Expertos analizan los acuerdos y desacuerdos de la reciente cumbre económica mundial.</p>
                        <a href="#">Leer análisis</a>
                        <button class="edit-general-btn edit-featured-btn" data-target-id="featured-1" title="Editar Destacado">&#9998;</button>
                        <button class="edit-general-btn delete-featured-btn" data-target-id="featured-1" title="Eliminar Destacado">&#128465;</button>
                    </div>
                </article>
                <!-- Example Featured Item 2 -->
                <article class="featured-news-item editable-featured" data-featured-id="featured-2">
                     <img src="/news_image_1.png" alt="Comunicación Satelital" loading="lazy">
                     <div class="featured-news-content">
                        <span class="category">Tecnología</span>
                        <h3>Impacto de Nuevos Satélites</h3>
                        <p>Cómo la nueva generación de satélites podría cambiar el acceso a internet en zonas remotas.</p>
                        <a href="#">Más detalles</a>
                         <button class="edit-general-btn edit-featured-btn" data-target-id="featured-2" title="Editar Destacado">&#9998;</button>
                         <button class="edit-general-btn delete-featured-btn" data-target-id="featured-2" title="Eliminar Destacado">&#128465;</button>
                    </div>
                </article>
                <!-- Example Featured Item 3 -->
                <article class="featured-news-item editable-featured" data-featured-id="featured-3">
                    <img src="/news_image_7.png" alt="Monumento Histórico" loading="lazy">
                     <div class="featured-news-content">
                        <span class="category">Cultura</span>
                        <h3>Reapertura Monumental</h3>
                        <p>El público vuelve a visitar el monumento tras una extensa restauración.</p>
                        <a href="#">Ver galería</a>
                        <button class="edit-general-btn edit-featured-btn" data-target-id="featured-3" title="Editar Destacado">&#9998;</button>
                         <button class="edit-general-btn delete-featured-btn" data-target-id="featured-3" title="Eliminar Destacado">&#128465;</button>
                    </div>
                </article>
            </div>
        </section>
        
        <!-- Container for dynamically added sections -->
        <div id="dynamic-sections-container"></div>

    </main>
  )
}

export default Main;
*/