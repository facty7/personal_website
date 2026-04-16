'use client';

import { useState, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let listeners: Set<(toasts: Toast[]) => void> = new Set();
let toasts: Toast[] = [];

function notify() {
  listeners.forEach(fn => fn([...toasts]));
}

function addToast(message: string, type: ToastType, duration = 4000) {
  const id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
  toasts = [...toasts, { id, message, type }];
  notify();
  if (duration > 0) {
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
      notify();
    }, duration);
  }
}

function removeToast(id: string) {
  toasts = toasts.filter(t => t.id !== id);
  notify();
}

export const toast = {
  success: (msg: string) => addToast(msg, 'success'),
  error: (msg: string) => addToast(msg, 'error'),
  info: (msg: string) => addToast(msg, 'info'),
};

// Hook for ToastContainer to subscribe
export function useToastStore() {
  const [current, setCurrent] = useState<Toast[]>(toasts);
  useEffect(() => {
    listeners.add(setCurrent);
    return () => { listeners.delete(setCurrent); };
  }, []);
  return { toasts: current, removeToast };
}
