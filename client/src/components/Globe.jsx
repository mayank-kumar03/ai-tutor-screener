import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

export default function Globe() {
  const canvasRef = useRef();

  useEffect(() => {
    let phi = 0;
    
    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 1600,
      height: 1600,
      phi: 0,
      theta: 0.1,
      dark: 1, 
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.1, 0.1, 0.1], // Dark gray wireframe
      markerColor: [0.1, 0.8, 0.1], // Green markers
      glowColor: [0.05, 0.05, 0.05], // Subtle glow
      markers: [
        { location: [37.7595, -122.4367], size: 0.03 },
        { location: [40.7128, -74.006], size: 0.1 },
        { location: [28.6139, 77.2090], size: 0.08 },
        { location: [51.5074, -0.1278], size: 0.05 },
        { location: [-33.8688, 151.2093], size: 0.07 },
      ],
      onRender: (state) => {
        state.phi = phi;
        phi += 0.003; 
      },
    });

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        maxWidth: '800px',
        aspectRatio: '1 / 1',
        margin: 'auto',
        display: 'block',
      }}
    />
  );
}
