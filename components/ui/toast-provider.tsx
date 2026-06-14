"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#111827",
          color: "#fff",
          borderRadius: "12px",
        },
        success: {
          iconTheme: { primary: "#3B82F6", secondary: "#fff" },
        },
      }}
    />
  );
}
