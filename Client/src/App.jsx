import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Toaster, toast } from "sonner";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { auth } from "./Firebase/firebase";

import AnimatedBackground from "./Components/AnimatedBackground";
import Lobby from "./Pages/Lobby";
import Editor from "./Pages/Editor";

function App() {
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [page, setPage] = useState("lobby");
  const [roomId, setRoomId] = useState(null);

  // Effect to handle user authentication on initial load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        try {
          const userCredential = await signInAnonymously(auth);
          setUserId(userCredential.user.uid);
        } catch (error) {
          console.error("Anonymous sign-in failed:", error);
          toast.error("Authentication failed. Please refresh the page.");
        }
      }
      setIsAuthReady(true);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const navigateToEditor = (id) => {
    setRoomId(id);
    setPage("editor");
  };

  const navigateToLobby = () => {
    setRoomId(null);
    setPage("lobby");
  };

  // Display a loading indicator while auth is being checked
  if (!isAuthReady) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center font-sans overflow-hidden">
        <AnimatedBackground />
        <p className="text-white text-xl">Authenticating...</p>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" richColors theme="dark" />
      <AnimatePresence mode="wait">
        {page === "lobby" && (
          <Lobby key="lobby" onJoinRoom={navigateToEditor} userId={userId} />
        )}
        {page === "editor" && (
          <Editor
            key="editor"
            onExit={navigateToLobby}
            roomId={roomId}
            userId={userId}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
