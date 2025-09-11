import { useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext"; // adjust path

const AutoLogout = ({ children }) => {
  const { logout } = useAuth(); 
  const timeoutRef = useRef(null);
  const INACTIVITY_LIMIT = 13 * 60 * 1000;  // 15 minutes

  // Reset timer kapag may activity
  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(logout, INACTIVITY_LIMIT);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); 

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [logout]);

  return children;
};

export default AutoLogout;
