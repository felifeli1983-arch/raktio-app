import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

export default function GlobeComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;
    let width = 0;
    
    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
        if (width === 0) width = 300; // Fallback if container is hidden/0
      }
    };
    window.addEventListener('resize', onResize);
    onResize();

    if (!canvasRef.current) return;

    const isDark = document.documentElement.classList.contains('dark');

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.3,
      dark: isDark ? 1 : 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: isDark ? [0.3, 0.3, 0.3] : [0.9, 0.9, 0.9],
      markerColor: [0.42, 0.36, 0.9], // Primary color #6C5CE7
      glowColor: isDark ? [0.2, 0.2, 0.2] : [1, 1, 1],
      markers: [
        // Italy
        { location: [41.8719, 12.5674], size: 0.1 },
        // US
        { location: [37.0902, -95.7129], size: 0.08 },
        // UK
        { location: [55.3781, -3.4360], size: 0.05 },
        // Australia
        { location: [-25.2744, 133.7751], size: 0.04 },
      ],
      onRender: (state) => {
        state.phi = phi;
        phi += 0.005;
        
        if (canvasRef.current) {
          const currentWidth = canvasRef.current.offsetWidth;
          if (currentWidth > 0) {
            state.width = currentWidth * 2;
            state.height = currentWidth * 2;
          }
        }
      },
    });

    // Observe dark mode changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          // Force re-render to update globe theme
          window.dispatchEvent(new Event('resize'));
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });

    return () => {
      globe.destroy();
      window.removeEventListener('resize', onResize);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="w-full aspect-square relative flex items-center justify-center overflow-hidden rounded-2xl bg-card border border-border">
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          contain: 'layout paint size',
          opacity: 1,
          transition: 'opacity 1s ease',
        }}
      />
      <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-sm p-3 rounded-xl border border-border text-xs">
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-foreground">Attività Globale</span>
          <span className="flex items-center gap-1 text-primary animate-pulse">
            <span className="w-2 h-2 rounded-full bg-primary"></span> Live
          </span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>IT: 45%</span>
          <span>US: 30%</span>
          <span>UK: 15%</span>
          <span>AU: 10%</span>
        </div>
      </div>
    </div>
  );
}
