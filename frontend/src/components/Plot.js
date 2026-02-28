'use client';

import { useEffect, useRef } from 'react';

export default function Plot({ data, layout, config, style, useResizeHandler, ...props }) {
    const plotRef = useRef(null);

    useEffect(() => {
        let Plotly;
        let resizeObserver;
        let mounted = true;

        if (plotRef.current) {
            import('plotly.js-dist-min').then(module => {
                if (!mounted) return;
                Plotly = module.default || module;
                const cnf = { ...config, responsive: useResizeHandler };
                Plotly.newPlot(plotRef.current, data, layout, cnf);

                if (useResizeHandler) {
                    resizeObserver = new ResizeObserver(() => {
                        if (plotRef.current) {
                            Plotly.Plots.resize(plotRef.current);
                        }
                    });
                    resizeObserver.observe(plotRef.current);
                }
            }).catch(err => console.error("Plotly load error:", err));
        }

        return () => {
            mounted = false;
            if (resizeObserver && plotRef.current) {
                resizeObserver.disconnect();
            }
            if (Plotly && plotRef.current) {
                Plotly.purge(plotRef.current);
            }
        };
    }, [data, layout, config, useResizeHandler]);

    return <div ref={plotRef} style={{ width: '100%', height: '100%', ...style }} {...props} />;
}
