'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Point, DrawingPath } from '@/lib/live-presentation';

interface DrawingCanvasProps {
  isTrainer: boolean;
  isActive: boolean;
  mode: 'pen' | 'laser' | null;
  drawings: DrawingPath[];
  laserPos: Point | null;
  onDrawStart?: () => void;
  onDrawEnd?: (path: DrawingPath) => void;
  onLaserMove?: (pos: Point | null) => void;
  color?: string;
}

export default function DrawingCanvas({
  isTrainer,
  isActive,
  mode,
  drawings,
  laserPos,
  onDrawStart,
  onDrawEnd,
  onLaserMove,
  color = '#ef4444'
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);

  // Draw existing paths
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and Redraw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const drawPath = (path: Point[], strokeColor: string, width: number) => {
      if (path.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = width;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      
      ctx.moveTo(path[0].x * canvas.width, path[0].y * canvas.height);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x * canvas.width, path[i].y * canvas.height);
      }
      ctx.stroke();
    };

    // 1. Redraw history
    drawings?.forEach(d => drawPath(d.points, d.color, d.width));

    // 2. Redraw current local path (preview)
    if (currentPath.length > 0) {
      drawPath(currentPath, color, 3);
    }
  }, [drawings, currentPath, color]);

  // Handle Resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent): Point | null => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height
    };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isTrainer || !isActive || !mode) return;
    const pos = getPos(e);
    if (!pos) return;

    if (mode === 'pen') {
      setIsDrawing(true);
      setCurrentPath([pos]);
      onDrawStart?.();
    } else if (mode === 'laser') {
      onLaserMove?.(pos);
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isTrainer || !isActive || !mode) return;
    const pos = getPos(e);
    if (!pos) return;

    if (mode === 'pen' && isDrawing) {
      setCurrentPath(prev => [...prev, pos]);
    } else if (mode === 'laser') {
      onLaserMove?.(pos);
    }
  };

  const handleEnd = () => {
    if (!isTrainer || !isActive) return;
    
    if (mode === 'pen' && isDrawing) {
      if (currentPath.length > 1) {
        onDrawEnd?.({
          id: Math.random().toString(36).substring(7),
          points: currentPath,
          color: color,
          width: 3
        });
      }
      setIsDrawing(false);
      setCurrentPath([]);
    } else if (mode === 'laser') {
      onLaserMove?.(null);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 z-40 touch-none ${isActive && mode ? 'cursor-crosshair' : 'pointer-events-none'}`}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full pointer-events-none opacity-80"
      />

      {/* Laser Pointer */}
      <AnimatePresence>
        {laserPos && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              left: `${laserPos.x * 100}%`,
              top: `${laserPos.y * 100}%`,
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300, mass: 0.5 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          >
            {/* Core */}
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_15px_5px_rgba(239,68,68,0.8)]" />
            {/* Outer Glow */}
            <div className="absolute inset-0 w-3 h-3 bg-red-400 rounded-full animate-ping opacity-40" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
