'use client';
import { useState, useCallback, useEffect } from 'react';
import type { CameraStatus } from './permissionStates';
import { isUnsupported } from './permissionStates';

export function useCamera() {
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (isUnsupported()) setStatus('unsupported');
  }, []);

  const request = useCallback(async () => {
    if (isUnsupported()) {
      setStatus('unsupported');
      return;
    }
    setStatus('requesting');
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      setStream(s);
      setStatus('granted');
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setStatus('denied');
    }
  }, []);

  return { status, stream, error, request };
}