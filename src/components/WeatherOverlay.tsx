import React, { useEffect, useRef } from "react";

interface WeatherOverlayProps {
  effect: 'none' | 'rain' | 'heavy-rain' | 'cherry-blossoms' | 'snow' | 'autumn-leaves';
  opacity?: number; // 0 to 100
  density?: number; // 0 to 100
}

interface Particle {
  x: number;
  y: number;
  speedY: number;
  speedX: number;
  size: number;
  opacity: number;
  color?: string;
  angle?: number;
  spin?: number;
}

export default function WeatherOverlay({ effect, opacity = 70, density = 50 }: WeatherOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse tracking for physics
    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize);

    const presetColors = {
      cherryBlossom: ["#FFAEBC", "#FFC6FF", "#FFD6FF", "#FDE2FF"],
      autumnLeaves: ["#D4A373", "#E76F51", "#F4A261", "#E9C46A", "#C97A3E"],
      snow: ["#ffffff", "#e0f2fe", "#f0f9ff"]
    };

    // Initialize particles based on selected effect & density multiplier
    const initParticles = () => {
      particles = [];
      let baseCount = 0;
      if (effect === "rain") baseCount = 120;
      else if (effect === "heavy-rain") baseCount = 220;
      else if (effect === "cherry-blossoms") baseCount = 55;
      else if (effect === "snow") baseCount = 75;
      else if (effect === "autumn-leaves") baseCount = 45;

      // 50 is default balance. Multiply baseCount accordingly
      const densityMultiplier = density / 50; 
      const count = Math.max(2, Math.round(baseCount * densityMultiplier));

      for (let i = 0; i < count; i++) {
        particles.push(createParticle(true));
      }
    };

    const createParticle = (randomY = false): Particle => {
      const pY = randomY ? Math.random() * height : -20;
      const pX = Math.random() * width;

      if (effect === "rain") {
        return {
          x: pX,
          y: pY,
          speedY: 10 + Math.random() * 5,
          speedX: -1 - Math.random() * 1.5,
          size: 1 + Math.random() * 1.5,
          opacity: 0.35 + Math.random() * 0.35
        };
      } else if (effect === "heavy-rain") {
        return {
          x: pX,
          y: pY,
          speedY: 15 + Math.random() * 8,
          speedX: -2 - Math.random() * 2,
          size: 1.5 + Math.random() * 2,
          opacity: 0.45 + Math.random() * 0.45
        };
      } else if (effect === "cherry-blossoms") {
        const colors = presetColors.cherryBlossom;
        return {
          x: pX,
          y: pY,
          speedY: 1 + Math.random() * 1.5,
          speedX: 0.5 + Math.random() * 1.2,
          size: 5 + Math.random() * 6,
          opacity: 0.55 + Math.random() * 0.45,
          color: colors[Math.floor(Math.random() * colors.length)],
          angle: Math.random() * Math.PI * 2,
          spin: -0.01 + Math.random() * 0.03
        };
      } else if (effect === "snow") {
        return {
          x: pX,
          y: pY,
          speedY: 0.8 + Math.random() * 1.2,
          speedX: -0.2 + Math.random() * 0.6,
          size: 2.5 + Math.random() * 4,
          opacity: 0.6 + Math.random() * 0.4,
          color: presetColors.snow[Math.floor(Math.random() * presetColors.snow.length)]
        };
      } else if (effect === "autumn-leaves") {
        return {
          x: pX,
          y: pY,
          speedY: 1.2 + Math.random() * 1.5,
          speedX: -0.5 + Math.random() * 1.0,
          size: 10 + Math.random() * 8,
          opacity: 0.65 + Math.random() * 0.35,
          color: presetColors.autumnLeaves[Math.floor(Math.random() * presetColors.autumnLeaves.length)],
          angle: Math.random() * Math.PI * 2,
          spin: -0.02 + Math.random() * 0.05
        };
      }

      return { x: 0, y: 0, speedY: 0, speedX: 0, size: 0, opacity: 0 };
    };

    initParticles();

    // Thunder flashes for heavy rain
    let thunderAlpha = 0;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      if (effect === "none") {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      // Handle rare random lightning flash during heavy-rain
      if (effect === "heavy-rain" && Math.random() < 0.001) {
        thunderAlpha = 0.4 + Math.random() * 0.4;
      }
      if (thunderAlpha > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${thunderAlpha})`;
        ctx.fillRect(0, 0, width, height);
        thunderAlpha -= 0.04;
      }

      // Dynamic wind vectors from cursor position (-5.0 to +5.0 px/frame drift)
      const windX = ((mouseX - (width / 2)) / (width / 2)) * 5;
      // Dynamic speed scaling factor based on mouseY position (0.5x to 2.0x gravity)
      const verticalSpeedFactor = 0.5 + (mouseY / (height || 1)) * 1.5;

      const globalOpacityMult = opacity / 100;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Draw particle with customized global opacity multiplier and limit to range [0, 1]
        ctx.beginPath();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity * globalOpacityMult));

        if (effect === "rain" || effect === "heavy-rain") {
          ctx.strokeStyle = "rgba(174, 217, 255, 1)";
          ctx.lineWidth = p.size;
          ctx.moveTo(p.x, p.y);
          // Incorporate the cursor wind tilt on rendering drops
          ctx.lineTo(p.x + (p.speedX + windX) * 1.5, p.y + (p.speedY * verticalSpeedFactor) * 1.5);
          ctx.stroke();
        } else if (effect === "cherry-blossoms") {
          ctx.fillStyle = p.color || "#ffc6ff";
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle || 0);
          // Draw a small ellipse-like petal
          ctx.scale(1, 0.6);
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (effect === "snow") {
          ctx.fillStyle = p.color || "#ffffff";
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (effect === "autumn-leaves") {
          ctx.fillStyle = p.color || "#C97A3E";
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle || 0);
          
          // Draw an elegant, organic pointed leaf shape
          ctx.beginPath();
          // Top tip of the leaf starts at (0, -p.size) and curves down to (0, p.size * 0.8) which represents the base
          ctx.moveTo(0, -p.size);
          // Left side curve of the leaf, extending to the left outward
          ctx.quadraticCurveTo(-p.size * 0.7, -p.size * 0.2, 0, p.size * 0.82);
          // Right side curve of the leaf, extending to the right outward
          ctx.quadraticCurveTo(p.size * 0.7, -p.size * 0.2, 0, -p.size);
          ctx.closePath();
          ctx.fill();

          // Draw the leaf stem extending outward from the base
          ctx.beginPath();
          ctx.strokeStyle = p.color || "#C97A3E";
          ctx.lineWidth = p.size * 0.12;
          ctx.lineCap = "round";
          ctx.moveTo(0, p.size * 0.7);
          ctx.lineTo(0, p.size * 1.15);
          ctx.stroke();

          // Draw the central primary vein
          ctx.beginPath();
          ctx.strokeStyle = "rgba(0, 0, 0, 0.14)";
          ctx.lineWidth = p.size * 0.08;
          ctx.moveTo(0, p.size * 0.75);
          ctx.lineTo(0, -p.size * 0.75);
          ctx.stroke();

          // Draw side leaf veins branching off
          ctx.beginPath();
          ctx.strokeStyle = "rgba(0, 0, 0, 0.09)";
          ctx.lineWidth = p.size * 0.05;
          
          // Left side veins
          ctx.moveTo(0, p.size * 0.2);
          ctx.lineTo(-p.size * 0.32, -p.size * 0.05);
          ctx.moveTo(0, -p.size * 0.2);
          ctx.lineTo(-p.size * 0.24, -p.size * 0.4);
          
          // Right side veins
          ctx.moveTo(0, p.size * 0.2);
          ctx.lineTo(p.size * 0.32, -p.size * 0.05);
          ctx.moveTo(0, -p.size * 0.2);
          ctx.lineTo(p.size * 0.24, -p.size * 0.4);
          
          ctx.stroke();
          ctx.restore();
        }

        // Apply physics with mouse cursor wind/speed changes
        p.y += p.speedY * verticalSpeedFactor;
        p.x += p.speedX + windX;

        if (effect === "cherry-blossoms" || effect === "autumn-leaves") {
          if (p.angle !== undefined && p.spin !== undefined) {
            p.angle += p.spin;
            // Float sway oscillation
            p.speedX += Math.sin(p.y / 30) * 0.05;
          }
        } else if (effect === "snow") {
          // sway gently
          p.x += Math.sin(p.y / 20) * 0.2;
        }

        // Reset particles looping
        if (p.y > height + 20 || p.x < -20 || p.x > width + 20) {
          particles[i] = createParticle(false);
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [effect, opacity, density]);

  if (effect === "none") return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-55 w-full h-full"
    />
  );
}
