// src/components/layout/public/home/RenderArticleContent.jsx
import React from 'react';
import parse, { domToReact } from 'html-react-parser';
import useAdvertisements from '../../../../hooks/useAdvertisements';
import InlineAd from './InlineAd';

const RenderArticleContent = ({ htmlContent }) => {
    // El hook que nos trae todos los anuncios disponibles sigue siendo necesario.
    const { advertisements, loading, error } = useAdvertisements();

    // Si aún no tenemos el contenido o los anuncios, no mostramos nada o un loader.
    if (!htmlContent || loading || error) {
        // Puedes poner un esqueleto de carga aquí si lo deseas
        return <div dangerouslySetInnerHTML={{ __html: htmlContent || '' }} />;
    }

    const options = {
        replace: domNode => {
            // Buscamos los placeholders de anuncios que el editor de texto generó.
            if (domNode.attribs && domNode.attribs.class === 'advertisement-placeholder') {
                const adId = parseInt(domNode.attribs['data-ad-id'], 10);
                const adData = advertisements.find(ad => ad.ad_id === adId);

                // Si encontramos el anuncio correspondiente en nuestra lista,
                // lo reemplazamos con el componente <InlineAd>.
                if (adData) {
                    return <InlineAd ad={adData} />;
                }

                // Si el anuncio no se encuentra (ej: fue borrado), no renderizamos nada.
                return <></>;
            }
        },
    };

    // Parseamos el contenido. La librería se encarga de todo.
    return <div>{parse(htmlContent, options)}</div>;
};

export default RenderArticleContent; 