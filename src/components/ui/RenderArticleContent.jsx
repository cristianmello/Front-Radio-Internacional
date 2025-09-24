// src/components/layout/public/home/RenderArticleContent.jsx
import React, { useMemo } from 'react';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';
import useAdvertisements from '../../hooks/useAdvertisements';
import InlineAd from './InlineAd';

const TRUSTED_IFRAME_HOSTNAMES = [
    'youtube.com',
    'www.youtube.com',
    'youtube-nocookie.com',
    'www.youtube-nocookie.com',
    'm.youtube.com',
    'player.vimeo.com',
    'vimeo.com',
    'www.google.com',
];

const isTrustedHost = (hostname) => {
    if (!hostname) return false;
    return TRUSTED_IFRAME_HOSTNAMES.some(h => hostname === h || hostname.endsWith('.' + h));
};

const normalizeIframeProps = (attribs = {}) => {
    const src = attribs.src || '';
    const title = attribs.title || 'Embedded content';
    const width = attribs.width || (typeof attribs.style === 'string' && attribs.style.match(/width:\s*([^;]+)/)?.[1]) || undefined;
    const height = attribs.height || (typeof attribs.style === 'string' && attribs.style.match(/height:\s*([^;]+)/)?.[1]) || undefined;

    const frameBorder = attribs.frameborder ?? attribs['frameBorder'] ?? '0';
    const allow = attribs.allow || 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    const allowFullScreen = attribs.allowfullscreen !== undefined || attribs.allowFullScreen !== undefined || attribs['allowFullScreen'] !== undefined;

    const className = attribs.class || attribs.className || undefined;
    const loading = attribs.loading || 'lazy';
    const referrerPolicy = attribs.referrerpolicy || attribs.referrerPolicy || undefined;
    const sandbox = attribs.sandbox || undefined;

    const props = { src, title, width, height, frameBorder, allow, allowFullScreen, className, loading, referrerPolicy, sandbox };
    Object.keys(props).forEach(k => props[k] === undefined && delete props[k]);
    return props;
};

const RenderArticleContent = ({ htmlContent }) => {
    const { advertisements, loading, error } = useAdvertisements();

    if (!htmlContent) return null;

    // SANITIZAR: permitir iframe + atributos necesarios
    const purifyConfig = useMemo(() => ({
        ADD_TAGS: ['iframe'],
        ADD_ATTR: [
            'allow', 'allowfullscreen', 'frameborder', 'loading', 'referrerpolicy', 'sandbox',
            'src', 'width', 'height', 'title', 'class', 'style', 'data-ad-id'
        ]
    }), []);

    const cleanHtml = useMemo(() => {
        if (!htmlContent) return '';
        // Usamos la config memorizada
        return DOMPurify.sanitize(htmlContent, purifyConfig);
    }, [htmlContent, purifyConfig]);

    // 4. Memorizar las opciones de parseo y la función 'replace'
    const options = useMemo(() => ({
        replace: domNode => {
            if (!domNode || !domNode.name) return;

            // Lógica de Anuncios (depende de 'advertisements')
            if (domNode.attribs && (domNode.attribs.class || '').includes('advertisement-placeholder')) {
                const adId = parseInt(domNode.attribs['data-ad-id'], 10);
                const adData = advertisements.find(ad => ad.ad_id === adId);
                return adData ? <InlineAd ad={adData} /> : <></>;
            }

            // Lógica de Iframes
            if (domNode.name === 'iframe') {
                const srcRaw = domNode.attribs && domNode.attribs.src;
                if (!srcRaw) return <></>;

                try {
                    const url = new URL(srcRaw, window.location.href);
                    if (!isTrustedHost(url.hostname)) {
                        console.warn('Iframe no permitido por hostname:', url.hostname);
                        return <></>;
                    }
                    const normalized = normalizeIframeProps({ ...domNode.attribs, src: url.href });
                    return <iframe {...normalized} />;
                } catch (e) {
                    console.warn('URL de iframe inválida, se omitirá:', srcRaw);
                    return <></>;
                }
            }
        },
    }), [advertisements]);

    // 5. Memorizar el contenido final renderizado
    const renderedContent = useMemo(() => {
        if (!cleanHtml) return null;

        // Si los anuncios están cargando o hay un error, no parseamos con las opciones
        // para evitar que los anuncios no aparezcan. Mostramos el HTML ya sanitizado.
        if (loading || error) {
            return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
        }

        // Si todo está bien, hacemos el parseo completo
        return parse(cleanHtml, options);
    }, [cleanHtml, options, loading, error]);

    return <div>{renderedContent}</div>;
};

export default RenderArticleContent;