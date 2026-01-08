import React, { useEffect, useRef } from 'react';
import { SnowParticle } from '../types';

interface SnowCanvasProps {
  intensity: number; // 0.0 to 1.0
}

interface Ripple {
  x: number;
  y: number;
  age: number; // Frames alive
}

const SnowCanvas: React.FC<SnowCanvasProps> = ({ intensity }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<SnowParticle[]>([]);
  const requestRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const ripplesRef = useRef<Ripple[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Event Handlers
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleClick = (e: MouseEvent) => {
      // Create a ripple effect on click
      ripplesRef.current.push({ x: e.clientX, y: e.clientY, age: 0 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    const createParticle = (isInitial: boolean = false): SnowParticle => {
      const width = canvas.width;
      const height = canvas.height;
      // Size increases with intensity: base 1-3px, plus up to 2.5px more
      const baseRadius = Math.random() * 2 + 1;
      const intensityBonus = intensity * 2.5; 
      
      return {
        x: Math.random() * width,
        y: isInitial ? Math.random() * height : -20,
        radius: baseRadius + intensityBonus,
        speed: Math.random() * 1 + 0.5 + (intensity * 2), // Faster with intensity
        wind: Math.random() * 2 - 1,
        opacity: Math.random() * 0.5 + 0.3,
        wobble: Math.random() * Math.PI * 2,
        hovered: false,
      };
    };

    const update = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Manage Particle Count
      const targetCount = 50 + Math.floor(intensity * 400);
      while (particlesRef.current.length < targetCount) {
        particlesRef.current.push(createParticle(particlesRef.current.length < 50));
      }
      if (particlesRef.current.length > targetCount) {
        particlesRef.current.splice(targetCount);
      }

      // Update Ripples
      // Remove old ripples (age > 30 frames)
      ripplesRef.current = ripplesRef.current.filter(r => r.age < 30);
      ripplesRef.current.forEach(r => r.age++);

      // Update Particles
      particlesRef.current.forEach((p) => {
        // Basic movement
        p.wobble += 0.05;
        p.y += p.speed;
        p.x += Math.sin(p.wobble) * 0.5 + (p.wind * 0.5);

        // Interaction: Hover
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 100) {
          p.hovered = true;
          // Gentle push away from mouse
          const force = (100 - dist) / 100;
          p.x += (dx / dist) * force * 3;
          p.y += (dy / dist) * force * 3;
        } else {
          p.hovered = false;
        }

        // Interaction: Ripples (Click)
        ripplesRef.current.forEach(r => {
          const rdx = p.x - r.x;
          const rdy = p.y - r.y;
          const rDist = Math.sqrt(rdx * rdx + rdy * rdy);
          const rippleRadius = r.age * 15; // Expanding radius

          // If particle is near the expanding ripple ring
          if (rDist < rippleRadius + 20 && rDist > rippleRadius - 20) {
             // Push outwards strongly
             const force = 5; 
             p.x += (rdx / rDist) * force;
             p.y += (rdy / rDist) * force;
          }
          
          // If particle is at the center of click (immediate disappearance/reset)
          if (r.age === 1 && rDist < 50) {
             p.y = -20;
             p.x = Math.random() * width;
          }
        });

        // Wrap around
        if (p.y > height + 10) {
          p.y = -10;
          p.x = Math.random() * width;
        }
        if (p.x > width + 10) p.x = -10;
        if (p.x < -10) p.x = width + 10;

        // Draw
        ctx.beginPath();
        
        // Color: White normally, Pink/Gold if hovered
        const colorStops = p.hovered 
          ? { start: `rgba(255, 200, 220, ${p.opacity})`, end: 'rgba(255, 200, 220, 0)' }
          : { start: `rgba(255, 255, 255, ${p.opacity})`, end: 'rgba(255, 255, 255, 0)' };

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        gradient.addColorStop(0, colorStops.start);
        gradient.addColorStop(1, colorStops.end);
        
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw active ripples (optional visual debug or effect)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ripplesRef.current.forEach(r => {
         ctx.beginPath();
         ctx.arc(r.x, r.y, r.age * 15, 0, Math.PI * 2);
         ctx.stroke();
      });

      requestRef.current = requestAnimationFrame(update);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    requestRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [intensity]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-auto z-10"
      style={{ cursor: 'crosshair' }}
    />
  );
};

export default SnowCanvas;