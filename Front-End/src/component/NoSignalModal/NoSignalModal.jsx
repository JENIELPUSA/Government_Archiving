import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NoSignalModal = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: "-100%" }}
          animate={{ opacity: 1, y: "0%" }}
          exit={{ opacity: 0, y: "-100%" }}
          transition={{ duration: 0.5 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.9)",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            flexDirection: "column",
            textAlign: "center",
            padding: "20px",
          }}
        >
          <div style={{ marginBottom: "2rem" }}>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                <path 
                  d="M1 1L23 23M16.72 11.72C17.55 10.88 18 9.71 18 8.5C18 6.02 15.98 4 13.5 4M8.28 3.55C6.07 2.47 3.46 2.72 1.61 4.44M22 8.5C22 12.64 18.64 16 14.5 16H14M10.76 6.06L17.7 13M3 3L21 21M6.12 6.12C4.49 7.75 3.5 10.06 3.5 12.5C3.5 16.64 6.86 20 11 20H12.5" 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>
          </div>
          
          <h2 style={{ fontSize: "2.5rem", marginBottom: "1rem", fontWeight: 600 }}>
            🚫 Connection Lost
          </h2>
          <p style={{ fontSize: "1.2rem", maxWidth: "500px", lineHeight: 1.6 }}>
            Your internet connection appears to be offline. Please check your network settings.
          </p>
          
          <motion.div
            style={{ marginTop: "2rem" }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "#ff4d4d",
                marginRight: "10px",
                animation: "pulse 1.5s infinite"
              }} />
              <span style={{ fontSize: "1rem" }}>Attempting to reconnect...</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NoSignalModal;