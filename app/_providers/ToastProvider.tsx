"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastKind = "success" | "error" | "info";

type Toast = {
  id: string;
  kind: ToastKind;
  title: string;
  message?: string;
  createdAt: number;
};

type ToastContextValue = {
  show: (t: { kind?: ToastKind; title: string; message?: string }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

function toastColor(kind: ToastKind) {
  if (kind === "success") return { bg: "rgba(233,30,99,0.10)", border: "rgba(233,30,99,0.26)", text: "#C2185B" };
  if (kind === "error") return { bg: "rgba(194,24,91,0.10)", border: "rgba(194,24,91,0.28)", text: "#C2185B" };
  return { bg: "rgba(233,30,99,0.08)", border: "rgba(233,30,99,0.22)", text: "#C2185B" };
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (t: { kind?: ToastKind; title: string; message?: string }) => {
      const id = crypto.randomUUID();
      const toast: Toast = {
        id,
        kind: t.kind ?? "info",
        title: t.title,
        message: t.message,
        createdAt: Date.now(),
      };
      setToasts((prev) => [toast, ...prev].slice(0, 4));

      // auto-dismiss (respectful, not "hooky")
      window.setTimeout(() => remove(id), 3600);
    },
    [remove]
  );

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        aria-live="polite"
        aria-relevant="additions"
        style={{
          position: "fixed",
          right: 14,
          bottom: 14,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          width: "min(360px, calc(100vw - 28px))",
        }}
      >
        {toasts.map((t) => {
          const c = toastColor(t.kind);
          return (
            <div
              key={t.id}
              className="fadeInUp"
              style={{
                background: c.bg,
                border: `1px solid ${c.border}`,
                borderRadius: 16,
                padding: 12,
                boxShadow: "0 18px 45px rgba(194, 24, 91, 0.12)",
                backdropFilter: "blur(6px)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 900, color: c.text, lineHeight: 1.2 }}>{t.title}</div>
                  {t.message ? (
                    <div style={{ marginTop: 4, color: "rgba(27,27,27,0.80)", fontSize: 14 }}>
                      {t.message}
                    </div>
                  ) : null}
                </div>

                <button
                  onClick={() => remove(t.id)}
                  className="btn btnGhost"
                  style={{ padding: "8px 10px", borderRadius: 999, height: 36 }}
                  aria-label="Close notification"
                  type="button"
                >
                  Close
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}