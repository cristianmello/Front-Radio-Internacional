import React from 'react';
import { useInView } from 'react-intersection-observer';
import SectionWrapper from './SectionWrapper';

// 1. Aceptamos el objeto 'props' completo en lugar de desestructurar campos específicos.
const LazySection = (props) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        rootMargin: '200px 0px',
    });

    return (
        <div ref={ref}>
            {inView ? (
                // 2. Usamos {...props} para pasar TODAS las propiedades recibidas
                //    (incluyendo 'section', 'key', y nuestra crucial 'onSectionDeleted')
                //    directamente al componente SectionWrapper.
                <SectionWrapper {...props} />
            ) : (
                // Un placeholder con altura para evitar saltos en el layout mientras carga
                <div style={{ minHeight: '400px' }} />
            )}
        </div>
    );
};

export default LazySection;