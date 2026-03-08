"use client";

import { useEffect, useRef, useCallback } from "react";
import { GameEngine } from "./Engine";

interface TouchControlsProps {
  engineRef: React.RefObject<GameEngine | null>;
  isVisible: boolean;
}

/**
 * Virtual joystick overlay for touchscreen / mobile play.
 * Renders in the bottom-left corner of the game.
 * Reports analog dx/dy [-1..1] to the GameEngine via engine.setTouch().
 */
export function TouchControls({ engineRef, isVisible }: TouchControlsProps) {
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const joystickKnobRef = useRef<HTMLDivElement>(null);
  const touchIdRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);
  const currentDxRef = useRef(0);
  const currentDyRef = useRef(0);

  // Push touch state to engine every animation frame
  const syncEngine = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.setTouch(currentDxRef.current, currentDyRef.current);
    }
    animFrameRef.current = requestAnimationFrame(syncEngine);
  }, [engineRef]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(syncEngine);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (engineRef.current) engineRef.current.setTouch(0, 0);
    };
  }, [syncEngine, engineRef]);

  const getBaseCenter = () => {
    const base = joystickBaseRef.current;
    if (!base) return { cx: 0, cy: 0, radius: 50 };
    const rect = base.getBoundingClientRect();
    return {
      cx: rect.left + rect.width / 2,
      cy: rect.top + rect.height / 2,
      radius: rect.width / 2,
    };
  };

  const updateKnob = (clientX: number, clientY: number) => {
    const { cx, cy, radius } = getBaseCenter();
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = radius * 0.65; // knob travel limit
    if (dist > maxDist) {
      dx = (dx / dist) * maxDist;
      dy = (dy / dist) * maxDist;
    }
    // Move knob visually
    const knob = joystickKnobRef.current;
    if (knob) {
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
    }
    // Normalize to -1..1
    currentDxRef.current = dx / maxDist;
    currentDyRef.current = dy / maxDist;
  };

  const resetKnob = () => {
    const knob = joystickKnobRef.current;
    if (knob) knob.style.transform = "translate(0px, 0px)";
    currentDxRef.current = 0;
    currentDyRef.current = 0;
    isDraggingRef.current = false;
    touchIdRef.current = null;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (touchIdRef.current !== null) return; // only track first touch
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    isDraggingRef.current = true;
    updateKnob(touch.clientX, touch.clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateKnob(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        resetKnob();
        break;
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="absolute bottom-6 left-6 z-50 select-none pointer-events-none"
      aria-label="Virtual joystick"
    >
      {/* Joystick Base */}
      <div
        ref={joystickBaseRef}
        className="w-28 h-28 rounded-full border-2 border-cyber-green/40 bg-black/40 backdrop-blur-sm flex items-center justify-center shadow-[0_0_20px_rgba(0,255,102,0.15)] pointer-events-auto"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      >
        {/* Crosshair guides */}
        <div className="absolute w-full h-px bg-cyber-green/10 top-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute h-full w-px bg-cyber-green/10 left-1/2 -translate-x-1/2 pointer-events-none" />

        {/* Knob */}
        <div
          ref={joystickKnobRef}
          className="w-10 h-10 rounded-full bg-cyber-green/70 border-2 border-cyber-green shadow-[0_0_12px_rgba(0,255,102,0.5)] transition-colors"
          style={{ transform: "translate(0px, 0px)", willChange: "transform" }}
        />
      </div>

      {/* Label */}
      <p className="text-center text-[9px] text-cyber-green/40 font-orbitron uppercase tracking-widest mt-1">
        Move
      </p>
    </div>
  );
}
