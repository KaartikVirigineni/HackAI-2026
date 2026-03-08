"use client";

import { useEffect, useState, useCallback } from "react";

// Global singletons so music persists across page transitions
let globalAudioCtx: AudioContext | null = null;
let globalBgAudio: HTMLAudioElement | null = null;
let globalIsPlaying = false;
const subscribers = new Set<(playing: boolean) => void>();

export function useCyberAudio() {
  const [isPlaying, setIsPlaying] = useState(globalIsPlaying);

  useEffect(() => {
    const handler = (playing: boolean) => setIsPlaying(playing);
    subscribers.add(handler);
    return () => {
      subscribers.delete(handler);
    };
  }, []);

  const setGlobalIsPlaying = (playing: boolean) => {
    globalIsPlaying = playing;
    subscribers.forEach(cb => cb(playing));
  };

  const initAudio = useCallback(() => {
    if (!globalAudioCtx) {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (Ctx) {
        globalAudioCtx = new Ctx();
      }
    }

    if (globalAudioCtx && globalAudioCtx.state === "suspended") {
      globalAudioCtx.resume();
    }
  }, []);

  const stopBgMusic = useCallback(() => {
    if (globalBgAudio) {
      globalBgAudio.pause();
      globalBgAudio.currentTime = 0;
    }
    setGlobalIsPlaying(false);
  }, []);

  const fadeOutMusic = useCallback(() => {
    if (globalBgAudio && globalIsPlaying) {
      const fadeAudio = setInterval(() => {
        if (globalBgAudio && globalBgAudio.volume > 0.05) {
          globalBgAudio.volume -= 0.05;
        } else {
          clearInterval(fadeAudio);
          if (globalBgAudio) {
            globalBgAudio.pause();
            globalBgAudio.volume = 0.3; // reset for next time
          }
          setGlobalIsPlaying(false);
        }
      }, 200);
    }
  }, []);

  const startBgMusic = useCallback(() => {
    if (!globalBgAudio) {
      globalBgAudio = new Audio("/sounds/delosound-lofi-background-music-2-480214.mp3");
      globalBgAudio.loop = true;
      globalBgAudio.volume = 0.3;
    }
    // ensure volume is correct in case it was fading out
    globalBgAudio.volume = 0.3;
    globalBgAudio.play().catch(e => console.error("Audio play failed:", e));
    setGlobalIsPlaying(true);
  }, []);

  const toggleMusic = useCallback(() => {
    if (globalIsPlaying) {
      stopBgMusic();
    } else {
      startBgMusic();
    }
  }, [startBgMusic, stopBgMusic]);

  const playHover = useCallback(() => {
    initAudio();
    const ctx = globalAudioCtx;
    if (!ctx) return;

    // Create a short, high-tech "blip"
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05); // Pitch up fast

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01); // Quick attack
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1); // Quick decay

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1); // Short duration

    // Second layer for more "click"
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "square";
    osc2.frequency.setValueAtTime(2000, ctx.currentTime);

    gain2.gain.setValueAtTime(0, ctx.currentTime);
    gain2.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.005);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.03);

  }, [initAudio]);

  return {
    isPlaying,
    toggleMusic,
    playHover,
    fadeOutMusic
  };
}
