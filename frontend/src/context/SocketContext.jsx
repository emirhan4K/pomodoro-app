import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    console.log("🔍 SocketProvider: Başlatılıyor...");
    const token = localStorage.getItem("token");
    if (!token) return;
    const isLocalhost = window.location.hostname === "localhost";
    const SOCKET_URL = isLocalhost
      ? "http://localhost:3000"
      : "https://pomodoro-app-omxg.onrender.com";
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("⚡ Socket Tüneline Başarıyla Bağlanıldı! ID:", newSocket.id);
    });
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
