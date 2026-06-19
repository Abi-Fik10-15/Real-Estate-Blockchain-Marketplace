"use client";

import * as React from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { WS_URL } from "@/lib/constants";
import { useAuthStore } from "@/store/auth-store";

interface NotificationsContextValue {
  count: number;
  clearCount: () => void;
}

const NotificationsContext = React.createContext<NotificationsContextValue>({
  count: 0,
  clearCount: () => {},
});

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const [count, setCount] = React.useState(0);
  const socketRef = React.useRef<Socket | null>(null);

  React.useEffect(() => {
    if (!token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setCount(0);
      return;
    }

    // Reuse existing socket if already connected with the same token
    if (socketRef.current?.connected) return;

    const socket = io(`${WS_URL}/notifications`, {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    const notify = (title: string, description?: string) => {
      toast(title, { description });
      setCount((c) => c + 1);
    };

    socket.on("visit_request", (payload: { message?: string; propertyTitle?: string }) => {
      notify("New inquiry", payload.message ?? payload.propertyTitle);
    });
    socket.on("escrow_deposited", (payload: { message?: string }) => {
      notify("Escrow update", payload.message);
    });
    socket.on("transaction_completed", (payload: { message?: string }) => {
      notify("Transaction complete", payload.message);
    });
    socket.on("property_verified", (payload: { message?: string; title?: string }) => {
      notify("Listing verified", payload.message ?? payload.title);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const clearCount = React.useCallback(() => setCount(0), []);

  return (
    <NotificationsContext.Provider value={{ count, clearCount }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsContext() {
  return React.useContext(NotificationsContext);
}
