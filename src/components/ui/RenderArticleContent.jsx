// src/components/layout/public/home/RenderArticleContent.jsx
import React from 'react';
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

    // Mientras cargan anuncios o hay error, render raw (esto ya lo tenías)
    if (loading || error) {
        return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
    }

    // SANITIZAR: permitir iframe + atributos necesarios
    const purifyConfig = {
        ADD_TAGS: ['iframe'],
        ADD_ATTR: [
            'allow', 'allowfullscreen', 'frameborder', 'loading', 'referrerpolicy', 'sandbox',
            'src', 'width', 'height', 'title', 'class', 'style', 'data-ad-id'
        ]
    };
    const cleanHtml = DOMPurify.sanitize(htmlContent, purifyConfig);

    const options = {
        replace: domNode => {
            if (!domNode || !domNode.name) return;

            // anuncios: si la clase contiene advertisement-placeholder
            if (domNode.attribs && (domNode.attribs.class || '').includes('advertisement-placeholder')) {
                const adId = parseInt(domNode.attribs['data-ad-id'], 10);
                const adData = advertisements.find(ad => ad.ad_id === adId);
                return adData ? <InlineAd ad={adData} /> : <></>;
            }

            // iframes: validación del host y normalización de props
            if (domNode.name === 'iframe') {
                const srcRaw = domNode.attribs && domNode.attribs.src;
                if (!srcRaw) return <></>;

                let url;
                try {
                    url = new URL(srcRaw, window.location.href);
                } catch (e) {
                    console.warn('URL de iframe inválida, se omitirá:', srcRaw);
                    return <></>;
                }

                if (!isTrustedHost(url.hostname)) {
                    console.warn('Iframe no permitido por hostname:', url.hostname);
                    return <></>;
                }

                const normalized = normalizeIframeProps({ ...domNode.attribs, src: url.href });
                return <iframe {...normalized} />;
            }

            return undefined;
        },
    };

    return <div>{parse(cleanHtml, options)}</div>;
};

export default RenderArticleContent;
