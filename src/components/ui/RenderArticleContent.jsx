// src/components/layout/public/home/RenderArticleContent.jsx
import React from 'react';
import parse from 'html-react-parser';
import useAdvertisements from '../../hooks/useAdvertisements';
import InlineAd from './InlineAd';

const TRUSTED_IFRAME_HOSTS = [
    'www.youtube.com',
    'player.vimeo.com',
    'www.google.com',
];

const RenderArticleContent = ({ htmlContent }) => {
    const { advertisements, loading, error } = useAdvertisements();

    if (!htmlContent) return null;

    if (loading || error) {
        return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
    }

    const options = {
        replace: domNode => {
            // Lógica para anuncios (se mantiene igual, funciona perfecto)
            if (domNode.attribs && domNode.attribs.class === 'advertisement-placeholder') {
                const adId = parseInt(domNode.attribs['data-ad-id'], 10);
                const adData = advertisements.find(ad => ad.ad_id === adId);
                return adData ? <InlineAd ad={adData} /> : <></>;
            }

            if (domNode.name === 'iframe') {
                const { src } = domNode.attribs;

                if (!src) return <></>;

                try {
                    const url = new URL(src);
                    if (TRUSTED_IFRAME_HOSTS.includes(url.hostname)) {
                        return <iframe {...domNode.attribs} />;
                    }
                } catch (e) {
                    console.warn('URL de iframe inválida, se omitirá:', src);
                }

                return <></>;
            }
        },
    };

    return <div>{parse(htmlContent, options)}</div>;
};

export default RenderArticleContent;