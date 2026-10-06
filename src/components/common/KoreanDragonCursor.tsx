import React, { useEffect, useRef } from 'react';

interface KoreanDragonCursorProps {
  containerRef?: React.RefObject<HTMLElement | null>;
}

export const KoreanDragonCursor: React.FC<KoreanDragonCursorProps> = ({ containerRef }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Target positions
    let mouseX = -500;
    let mouseY = -500;
    let targetX = 0;
    let targetY = 0;
    let isMouseOver = false;
    let time = 0;

    // Dragon head state
    let headX = 0;
    let headY = 0;
    let headVx = 0;
    let headVy = 0;
    let headAngle = 0;

    // Segment chain for fluid undulating body
    const NUM_SEGMENTS = 36;
    const SEGMENT_LENGTH = 11;

    interface Segment {
      x: number;
      y: number;
      angle: number;
    }

    const segments: Segment[] = Array.from({ length: NUM_SEGMENTS }, () => ({
      x: 0,
      y: 0,
      angle: 0,
    }));

    // Whisker physics (2 long fluttering whiskers)
    interface WhiskerNode {
      x: number;
      y: number;
    }
    const leftWhisker: WhiskerNode[] = Array.from({ length: 9 }, () => ({ x: 0, y: 0 }));
    const rightWhisker: WhiskerNode[] = Array.from({ length: 9 }, () => ({ x: 0, y: 0 }));

    // Ink smoke & water mist particles
    interface InkParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      radius: number;
      color: string;
    }
    const particles: InkParticle[] = [];

    // Resize handler
    const handleResize = () => {
      const parent = containerRef?.current || canvas.parentElement || document.body;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;
      height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      if (headX === 0 && headY === 0) {
        headX = width * 0.65;
        headY = height * 0.45;
        targetX = headX;
        targetY = headY;
        segments.forEach((seg) => {
          seg.x = headX;
          seg.y = headY;
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const targetElement = containerRef?.current || window;

    const handleMouseMove = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      const rect = (containerRef?.current || canvas).getBoundingClientRect();
      mouseX = mouseEvent.clientX - rect.left;
      mouseY = mouseEvent.clientY - rect.top;

      if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        isMouseOver = true;
        targetX = mouseX;
        targetY = mouseY;
      } else {
        isMouseOver = false;
      }
    };

    const handleMouseEnter = () => {
      isMouseOver = true;
    };

    const handleMouseLeave = () => {
      isMouseOver = false;
    };

    targetElement.addEventListener('mousemove', handleMouseMove as any, { passive: true });
    targetElement.addEventListener('mouseenter', handleMouseEnter as any);
    targetElement.addEventListener('mouseleave', handleMouseLeave as any);

    // Main animation loop
    const render = () => {
      time += 0.032;
      ctx.clearRect(0, 0, width, height);

      // Idle organic floating path if mouse is not in hero area
      if (!isMouseOver || mouseX < 0) {
        const cx = width * 0.6;
        const cy = height * 0.44;
        const rx = width * 0.25;
        const ry = height * 0.18;
        targetX = cx + Math.sin(time * 0.7) * rx;
        targetY = cy + Math.sin(time * 1.4) * (ry * 0.7);
      }

      // 1. Move Head towards target with spring and drag physics
      const dx = targetX - headX;
      const dy = targetY - headY;

      const spring = isMouseOver ? 0.065 : 0.035;
      headVx += dx * spring;
      headVy += dy * spring;

      headVx *= 0.82;
      headVy *= 0.82;

      // Gentle natural swimming sine undulation
      const speed = Math.hypot(headVx, headVy);
      const perpX = -headVy / (speed || 1);
      const perpY = headVx / (speed || 1);
      const swimWave = Math.sin(time * 4.5) * Math.min(3, speed * 0.5);

      headX += headVx + perpX * swimWave;
      headY += headVy + perpY * swimWave;

      // Smooth head angle update
      if (speed > 0.2) {
        const targetAngle = Math.atan2(headVy, headVx);
        let angleDiff = targetAngle - headAngle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        headAngle += angleDiff * 0.2;
      }

      segments[0].x = headX;
      segments[0].y = headY;
      segments[0].angle = headAngle;

      // 2. Inverse Kinematics for 36-segment dragon body
      for (let i = 1; i < NUM_SEGMENTS; i++) {
        const prev = segments[i - 1];
        const curr = segments[i];

        const segDx = curr.x - prev.x;
        const segDy = curr.y - prev.y;
        const angle = Math.atan2(segDy, segDx);

        curr.angle = angle;
        curr.x = prev.x + Math.cos(angle) * SEGMENT_LENGTH;
        curr.y = prev.y + Math.sin(angle) * SEGMENT_LENGTH;

        // Propagating wave down the serpentine spine
        const wave = Math.sin(time * 5.2 - i * 0.26) * (1.2 + (i / NUM_SEGMENTS) * 2.2);
        const waveAngle = angle + Math.PI / 2;
        curr.x += Math.cos(waveAngle) * wave * 0.4;
        curr.y += Math.sin(waveAngle) * wave * 0.4;
      }

      // 3. Emit ink smoke particles along body
      if (Math.random() < 0.4 || speed > 1.2) {
        const emitIdx = Math.floor(Math.random() * (NUM_SEGMENTS - 6)) + 3;
        const emitSeg = segments[emitIdx];
        particles.push({
          x: emitSeg.x + (Math.random() - 0.5) * 8,
          y: emitSeg.y + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5 - 0.15,
          alpha: 0.3 + Math.random() * 0.25,
          radius: 2 + Math.random() * 5,
          color: Math.random() > 0.65 ? 'rgba(197, 160, 89,' : 'rgba(25, 25, 27,', // Bronze or deep ink
        });
      }

      // Draw and update ink particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.007;
        p.radius += 0.12;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${p.alpha})`;
        ctx.fill();
        ctx.restore();
      }

      // 4. Calculate Body Ribs (Tapering silhouette)
      const leftRibs: { x: number; y: number }[] = [];
      const rightRibs: { x: number; y: number }[] = [];

      for (let i = 0; i < NUM_SEGMENTS; i++) {
        const seg = segments[i];
        let ribWidth = 0;
        if (i < 4) {
          ribWidth = 6 + i * 2.2;
        } else if (i < 16) {
          ribWidth = 12.5 - (i - 4) * 0.32;
        } else {
          ribWidth = Math.max(1, 9 - (i - 16) * 0.42);
        }

        const normAngle = seg.angle + Math.PI / 2;
        leftRibs.push({
          x: seg.x + Math.cos(normAngle) * ribWidth,
          y: seg.y + Math.sin(normAngle) * ribWidth,
        });
        rightRibs.push({
          x: seg.x - Math.cos(normAngle) * ribWidth,
          y: seg.y - Math.sin(normAngle) * ribWidth,
        });
      }

      // 5. Draw Dragon Body Ribbon
      const tail = segments[NUM_SEGMENTS - 1];

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(leftRibs[0].x, leftRibs[0].y);
      for (let i = 1; i < leftRibs.length; i++) {
        ctx.lineTo(leftRibs[i].x, leftRibs[i].y);
      }
      ctx.lineTo(tail.x, tail.y);
      for (let i = rightRibs.length - 1; i >= 0; i--) {
        ctx.lineTo(rightRibs[i].x, rightRibs[i].y);
      }
      ctx.closePath();

      // Rich Korean ink wash gradient with royal bronze glow
      const bodyGrad = ctx.createLinearGradient(
        segments[0].x,
        segments[0].y,
        tail.x,
        tail.y
      );
      bodyGrad.addColorStop(0, 'rgba(17, 17, 17, 0.92)');
      bodyGrad.addColorStop(0.25, 'rgba(28, 28, 30, 0.88)');
      bodyGrad.addColorStop(0.65, 'rgba(107, 78, 50, 0.78)');
      bodyGrad.addColorStop(1, 'rgba(158, 129, 96, 0.5)');

      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Clean ink brush stroke outline
      ctx.strokeStyle = 'rgba(17, 17, 17, 0.6)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 6. Dorsal Spine Fins (등갈기 - 붉은 옻칠과 황금빛 갈기)
      for (let i = 2; i < NUM_SEGMENTS - 3; i += 2) {
        const seg = segments[i];
        const spineAngle = seg.angle + Math.PI / 2;
        const spikeLen = Math.sin((i / NUM_SEGMENTS) * Math.PI) * 9 + 3;

        ctx.beginPath();
        ctx.moveTo(seg.x, seg.y);
        ctx.lineTo(
          seg.x + Math.cos(spineAngle) * spikeLen,
          seg.y + Math.sin(spineAngle) * spikeLen
        );
        ctx.strokeStyle = 'rgba(107, 39, 39, 0.85)'; // Lacquer red dorsal fin
        ctx.lineWidth = 1.3;
        ctx.stroke();
      }

      // 7. Brush Plume Tail (붓털 꼬리 지느러미)
      for (let t = -2; t <= 2; t++) {
        const plumeAngle = tail.angle + t * 0.35;
        const plumeLen = 22 - Math.abs(t) * 4;

        ctx.beginPath();
        ctx.moveTo(tail.x, tail.y);
        ctx.quadraticCurveTo(
          tail.x + Math.cos(plumeAngle) * (plumeLen * 0.6) + Math.sin(time * 5 + t) * 3,
          tail.y + Math.sin(plumeAngle) * (plumeLen * 0.6) + Math.cos(time * 5 + t) * 3,
          tail.x + Math.cos(plumeAngle) * plumeLen,
          tail.y + Math.sin(plumeAngle) * plumeLen
        );
        ctx.strokeStyle = t === 0 ? 'rgba(197, 160, 89, 0.9)' : 'rgba(28, 28, 30, 0.7)';
        ctx.lineWidth = t === 0 ? 2 : 1.2;
        ctx.stroke();
      }

      // 8. 4 Dragon Claws & Talons (앞다리 2개, 뒷다리 2개)
      const clawIndices = [7, 13, 20, 26];
      clawIndices.forEach((idx, cIdx) => {
        const seg = segments[idx];
        const side = cIdx % 2 === 0 ? 1 : -1;
        const legMotion = Math.sin(time * 3.5 + cIdx * 1.5) * 0.4;
        const clawAngle = seg.angle + (Math.PI / 2) * side + legMotion;
        const legLen = 16;

        const jointX = seg.x + Math.cos(clawAngle) * legLen;
        const jointY = seg.y + Math.sin(clawAngle) * legLen;

        // Upper leg
        ctx.beginPath();
        ctx.moveTo(seg.x, seg.y);
        ctx.lineTo(jointX, jointY);
        ctx.strokeStyle = 'rgba(28, 28, 30, 0.88)';
        ctx.lineWidth = 2.4;
        ctx.stroke();

        // 3 Sharp Talons (매의 발톱)
        for (let t = -1; t <= 1; t++) {
          const talonAngle = clawAngle + t * 0.5;
          ctx.beginPath();
          ctx.moveTo(jointX, jointY);
          ctx.lineTo(
            jointX + Math.cos(talonAngle) * 6,
            jointY + Math.sin(talonAngle) * 6
          );
          ctx.strokeStyle = 'rgba(158, 129, 96, 0.95)'; // Bronze sharp talons
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }
      });

      // 9. Twin Fluttering Whiskers (용의 긴 수염)
      const noseX = headX + Math.cos(headAngle) * 16;
      const noseY = headY + Math.sin(headAngle) * 16;

      const updateAndDrawWhisker = (
        nodes: WhiskerNode[],
        side: number,
        color: string
      ) => {
        const baseAngle = headAngle + side * 0.75;
        nodes[0].x = noseX;
        nodes[0].y = noseY;

        for (let w = 1; w < nodes.length; w++) {
          const targetNodeX =
            nodes[w - 1].x -
            Math.cos(baseAngle) * 7 +
            Math.sin(time * 6.5 + w * 0.5) * 1.8;
          const targetNodeY =
            nodes[w - 1].y -
            Math.sin(baseAngle) * 7 +
            Math.cos(time * 6.5 + w * 0.5) * 1.8;

          nodes[w].x += (targetNodeX - nodes[w].x) * 0.38;
          nodes[w].y += (targetNodeY - nodes[w].y) * 0.38;
        }

        ctx.beginPath();
        ctx.moveTo(nodes[0].x, nodes[0].y);
        for (let w = 1; w < nodes.length; w++) {
          ctx.lineTo(nodes[w].x, nodes[w].y);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      };

      updateAndDrawWhisker(leftWhisker, 1, 'rgba(17, 17, 17, 0.85)');
      updateAndDrawWhisker(rightWhisker, -1, 'rgba(17, 17, 17, 0.85)');

      // 10. Dragon Head & Horns (사슴 뿔과 용의 두상)
      ctx.save();
      ctx.translate(headX, headY);
      ctx.rotate(headAngle);

      // Head Base Shape (Muzzle, Brow, Jaw)
      ctx.beginPath();
      ctx.moveTo(16, 0); // Snout tip
      ctx.quadraticCurveTo(9, -8, -5, -9); // Top brow
      ctx.lineTo(-14, -6); // Skull base
      ctx.lineTo(-14, 6);
      ctx.quadraticCurveTo(9, 8, 16, 0); // Under jaw
      ctx.fillStyle = 'rgba(17, 17, 17, 0.96)';
      ctx.fill();

      // Sharp Teeth / Fangs
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(10, 4);
      ctx.lineTo(8, 0);
      ctx.fillStyle = '#FAF9F6';
      ctx.fill();

      // Antler Horns (사슴 뿔)
      const drawHorn = (hornSide: number) => {
        ctx.save();
        ctx.scale(1, hornSide);
        ctx.beginPath();
        ctx.moveTo(-6, -7);
        ctx.lineTo(-18, -16);
        ctx.lineTo(-28, -21);
        ctx.moveTo(-18, -16);
        ctx.lineTo(-21, -24); // Horn branch
        ctx.strokeStyle = 'rgba(158, 129, 96, 0.9)'; // Bronze horn
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.restore();
      };
      drawHorn(1);
      drawHorn(-1);

      // Eyes (용의 눈 - 신비로운 황금빛 안광)
      ctx.beginPath();
      ctx.arc(4, -4.5, 2.3, 0, Math.PI * 2);
      ctx.arc(4, 4.5, 2.3, 0, Math.PI * 2);
      ctx.fillStyle = '#C5A059'; // Royal Gold
      ctx.fill();

      // Eye Glint
      ctx.beginPath();
      ctx.arc(4.5, -4.5, 0.9, 0, Math.PI * 2);
      ctx.arc(4.5, 4.5, 0.9, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      ctx.restore(); // Restore head transform

      // 11. Yeouiju (여의주 - 신비로운 황금 보주가 머리 앞을 유영)
      const yeouijuDist = 28 + Math.sin(time * 3.2) * 6;
      const yeouijuAngle = headAngle + Math.sin(time * 2.8) * 0.45;
      const beadX = headX + Math.cos(yeouijuAngle) * yeouijuDist;
      const beadY = headY + Math.sin(yeouijuAngle) * yeouijuDist;

      // Golden Halo
      const beadGlow = ctx.createRadialGradient(beadX, beadY, 1, beadX, beadY, 18);
      beadGlow.addColorStop(0, 'rgba(255, 230, 150, 0.85)');
      beadGlow.addColorStop(0.4, 'rgba(197, 160, 89, 0.35)');
      beadGlow.addColorStop(1, 'rgba(197, 160, 89, 0)');

      ctx.beginPath();
      ctx.arc(beadX, beadY, 18, 0, Math.PI * 2);
      ctx.fillStyle = beadGlow;
      ctx.fill();

      // Core Pearl
      ctx.beginPath();
      ctx.arc(beadX, beadY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#C5A059';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(beadX - 1.2, beadY - 1.2, 1.4, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      targetElement.removeEventListener('mousemove', handleMouseMove as any);
      targetElement.removeEventListener('mouseenter', handleMouseEnter as any);
      targetElement.removeEventListener('mouseleave', handleMouseLeave as any);
    };
  }, [containerRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-20 pointer-events-none w-full h-full"
      aria-hidden="true"
    />
  );
};
