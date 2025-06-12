// frontend/componnts/useCountdown.js
import { useEffect, useState } from "react";

export function useCountdown(expiryTime) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!expiryTime) return;
    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(expiryTime) - Date.now()) / 1000)
      );
      setSecondsLeft(remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiryTime]);

  return secondsLeft;
}
