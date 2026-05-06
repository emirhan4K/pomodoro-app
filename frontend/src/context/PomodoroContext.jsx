import React, { createContext, useState, useEffect, useContext } from "react";
import { PomodoroService } from "../services/api.services";
import { useAuth } from "./AuthContext";

const PomodoroContext = createContext();

export const PomodoroProvider = ({ children }) => {
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // YENİ: Tebrikler Modalı için State ekledik!
  const [showCongrats, setShowCongrats] = useState(false);

  const { fetchProfile } = useAuth();

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      clearInterval(interval);
      setIsActive(false);

      // SÜRE BİTTİ: Ekrana kutlama modalını çıkart! 🚀
      setShowCongrats(true);

      // SÜRE BİTTİ: Arka planda backend'e bildir ve XP'yi güncelle
      if (sessionId) {
        PomodoroService.updateStatus(sessionId, "completed")
          .then(() => {
            setSessionId(null);
            if (fetchProfile) fetchProfile(); // XP'yi güncelle
          })
          .catch(console.error);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, sessionId, fetchProfile]);

  const handleDurationSelect = async (mins) => {
    if (sessionId) {
      try {
        await PomodoroService.updateStatus(sessionId, "cancelled");
      } catch (e) {}
      setSessionId(null);
    }
    setSelectedMinutes(mins);
    setTimeLeft(mins * 60);
    setIsActive(false);
  };

  const toggleTimer = async () => {
    if (!isActive) {
      setIsActive(true);
      if (!sessionId) {
        try {
          const res = await PomodoroService.startSession(
            selectedMinutes,
            "Genel",
          );
          // Güvenli ID yakalama (Mongoose veya Mapper'dan ne dönerse dönsün yakalar)
          const newId =
            res?.data?.newSession?._id ||
            res?.data?.newSession?.id ||
            res?.data?._id;
          if (newId) setSessionId(newId);
        } catch (e) {
          console.error(e);
        }
      } else {
        try {
          await PomodoroService.updateStatus(sessionId, "running");
        } catch (e) {}
      }
    } else {
      setIsActive(false);
      if (sessionId) {
        try {
          await PomodoroService.updateStatus(sessionId, "paused");
        } catch (e) {}
      }
    }
  };

  const handleReset = async () => {
    if (sessionId) {
      try {
        await PomodoroService.updateStatus(sessionId, "cancelled");
      } catch (e) {}
      setSessionId(null);
    }
    setTimeLeft(selectedMinutes * 60);
    setIsActive(false);
  };

  return (
    <PomodoroContext.Provider
      value={{
        timeLeft,
        isActive,
        selectedMinutes,
        toggleTimer,
        handleReset,
        handleDurationSelect,
        showCongrats,
        setShowCongrats,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoro = () => useContext(PomodoroContext);
