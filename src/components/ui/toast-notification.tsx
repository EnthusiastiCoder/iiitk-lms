"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, X } from "lucide-react";

export interface Toast {
  id: string;
  message: string;
  description?: string;
}

let toastListeners: Array<(toast: Toast) => void> = [];

export function showToast(message: string, description?: string) {
  const toast: Toast = {
    id: crypto.randomUUID(),
    message,
    description,
  };
  toastListeners.forEach((listener) => listener(toast));
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className="pointer-events-auto flex items-start gap-3 w-80 rounded-lg border bg-card p-4 shadow-lg"
    >
      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight">{toast.message}</p>
        {toast.description && (
          <p className="text-xs text-muted-foreground mt-1">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const handleDismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);
    };
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[90] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={handleDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
