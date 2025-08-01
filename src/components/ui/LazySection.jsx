import React from 'react';
import { useInView } from 'react-intersection-observer';
import SectionWrapper from './SectionWrapper';

// 1. Recibimos 'className' por separado y el resto de las props en un objeto.
const LazySection = ({ className, ...props }) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        rootMargin: '200px 0px',
    });

    return (
        // 2. Aplicamos la 'className' que recibimos al div.
        <div ref={ref} className={className}>
            {inView ? (
                // 3. Pasamos el resto de las props a SectionWrapper.
                <SectionWrapper {...props} />
            ) : (
                // El placeholder se mantiene igual.
                <div style={{ minHeight: '400px' }} />
            )}
        </div>
    );
};

export default LazySection;