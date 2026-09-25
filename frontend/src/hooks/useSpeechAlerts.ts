import { useState, useRef, useCallback, useEffect } from 'react';

interface SpeechOptions {
  debounceSec?: number;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export function useSpeechAlerts(options: SpeechOptions = {}) {
  const {
    debounceSec = 5.0,
    rate = 1.05,
    pitch = 1.0,
    volume = 0.9,
  } = options;

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [lastSpokenText, setLastSpokenText] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  
  // Track last spoken timestamp per distinct alert message
  const lastSpokenMap = useRef<Map<string, number>>(new Map());

  const speak = useCallback((text: string, force: boolean = false) => {
    if (isMuted || !('speechSynthesis' in window) || !text) {
      return false;
    }

    const now = Date.now();
    const lastTime = lastSpokenMap.current.get(text) || 0;
    const elapsedSec = (now - lastTime) / 1000;

    // Debounce suppression
    if (!force && elapsedSec < debounceSec) {
      return false;
    }

    try {
      window.speechSynthesis.cancel(); // Cancel ongoing utterance for high-priority driver safety alerts

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setLastSpokenText(text);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      lastSpokenMap.current.set(text, now);
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      setIsSpeaking(false);
      return false;
    }
  }, [isMuted, debounceSec, rate, pitch, volume]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      if (!prev && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return !prev;
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    speak,
    isMuted,
    toggleMute,
    lastSpokenText,
    isSpeaking,
  };
}
