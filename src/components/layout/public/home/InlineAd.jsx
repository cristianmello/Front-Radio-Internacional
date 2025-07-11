import React from 'react';
import PropTypes from 'prop-types';
import { AD_FORMATS } from '../../../../helpers/adFormats.js';

const InlineAd = ({ ad }) => {
    // Obtenemos la información del formato del anuncio.
    const formatInfo = AD_FORMATS[ad.ad_format] || AD_FORMATS.default;

    // Calculamos la relación de aspecto para mantener la forma del anuncio.
    const aspectRatio = formatInfo.width && formatInfo.height
        ? `${formatInfo.width} / ${formatInfo.height}`
        : 'auto';

    // El estilo en línea ahora solo define variables CSS para que el CSS externo las use.
    // Esto nos da máxima flexibilidad y un diseño responsivo.
    const style = {
        '--ad-max-width': formatInfo.width ? `${formatInfo.width}px` : '100%',
        '--ad-aspect-ratio': aspectRatio,
    };

    return (
        <span className="ad-inline-wrapper">
            <div className="ad-disclaimer">Publicidad</div>
            <a
                href={ad.ad_target_url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="ad-inline-link"
                style={style} // Aplicamos las variables CSS al enlace.
            >
                <img
                    src={ad.ad_image_url}
                    alt={ad.ad_name}
                    loading="lazy"
                    decoding="async"
                />
            </a>
        </span>
    );
};

InlineAd.propTypes = {
    ad: PropTypes.shape({
        ad_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        ad_name: PropTypes.string,
        ad_type: PropTypes.string,
        ad_format: PropTypes.string.isRequired,
        ad_target_url: PropTypes.string,
        ad_image_url: PropTypes.string,
    }).isRequired,
};

export default InlineAd;