'use client';

import { useEffect, useRef, useState } from 'react';
import createGlobe from 'cobe';

export default function Globe({ markers = [] }) {
    const canvasRef = useRef();
    const pointerInteracting = useRef(null);
    const pointerInteractionMovement = useRef(0);
    const [{ r }, setR] = useState({ r: 0 });

    useEffect(() => {
        let phi = 0;
        let width = 0;

        const onResize = () => {
            if (canvasRef.current) {
                width = canvasRef.current.offsetWidth;
            }
        };
        window.addEventListener('resize', onResize);
        onResize();

        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: width * 2,
            height: width * 2,
            phi: 0,
            theta: 0.3,
            dark: 1,
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor: [0.1, 0.1, 0.2], // Dark slate blue
            markerColor: [1, 0.3, 0.1], // Orange-red accent
            glowColor: [0.1, 0.2, 0.4],
            markers: markers.map(m => ({ location: [m.lat, m.lng], size: m.size })),
            onRender: (state) => {
                if (!pointerInteracting.current) {
                    phi += 0.005;
                }
                state.phi = phi + r;
                state.width = width * 2;
                state.height = width * 2;
            }
        });

        return () => {
            globe.destroy();
            window.removeEventListener('resize', onResize);
        };
    }, [markers, r]);

    return (
        <div className="globe-container">
            <canvas
                ref={canvasRef}
                onPointerDown={(e) => {
                    pointerInteracting.current = e.clientX;
                    canvasRef.current.style.cursor = 'grabbing';
                }}
                onPointerUp={() => {
                    pointerInteracting.current = null;
                    canvasRef.current.style.cursor = 'grab';
                }}
                onPointerOut={() => {
                    pointerInteracting.current = null;
                    canvasRef.current.style.cursor = 'grab';
                }}
                onMouseMove={(e) => {
                    if (pointerInteracting.current !== null) {
                        const deltaX = e.clientX - pointerInteracting.current;
                        pointerInteractionMovement.current = deltaX;
                        setR({ r: r + deltaX / 200 });
                        pointerInteracting.current = e.clientX;
                    }
                }}
                onTouchMove={(e) => {
                    if (pointerInteracting.current !== null && e.touches[0]) {
                        const deltaX = e.touches[0].clientX - pointerInteracting.current;
                        pointerInteractionMovement.current = deltaX;
                        setR({ r: r + deltaX / 100 });
                        pointerInteracting.current = e.touches[0].clientX;
                    }
                }}
                style={{
                    width: '100%',
                    height: '100%',
                    cursor: 'grab',
                    contain: 'layout paint size',
                    opacity: 1,
                    transition: 'opacity 1s ease',
                }}
            />
        </div>
    );
}
