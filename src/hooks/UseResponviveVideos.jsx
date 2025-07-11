import { useEffect } from 'react';

const UseResponsiveVideos = () => {
    useEffect(() => {
        const adjustVideoLayout = () => {
            const videoCards = document.querySelectorAll('.video-card:not(.main-video)');
            if (window.innerWidth <= 768) {
                videoCards.forEach(card => card.style.height = 'auto');
            } else {
                videoCards.forEach(card => card.style.height = '');
            }
        };

        adjustVideoLayout();
        window.addEventListener('resize', adjustVideoLayout);
        return () => window.removeEventListener('resize', adjustVideoLayout);
    }, []);
};

export default UseResponsiveVideos;
