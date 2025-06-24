import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Code, LogIn, Plus, User } from 'lucide-react';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../Firebase/firebase';

import AnimatedBackground from '../Components/AnimatedBackground';
import AnimatedButton from '../Components/AnimatedButton';
import AnimatedInput from '../Components/AnimatedInput';
import SocialButton from '../Components/SocialButton'; // <-- IMPORT NEW COMPONENT

const Lobby = ({ onJoinRoom, userId }) => {
  const [newProjectObjective, setNewProjectObjective] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newProjectObjective.trim() || !userId) return;
    setIsCreating(true);

    try {
      const roomsCollection = collection(db, 'rooms');

      const newRoomData = {
        objective: newProjectObjective,
        ownerId: userId,
        createdAt: new Date().toISOString(),
        fileTree: {},
      };

      const newRoomRef = await addDoc(roomsCollection, newRoomData);

      toast.success("Room created successfully!");
      onJoinRoom(newRoomRef.id);

    } catch (err) {
      console.error("Firestore Write Error in handleCreateRoom:", err);
      toast.error("Failed to create room. See console for details.");
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!joinRoomId.trim()) {
      toast.error("Please enter a Room ID.");
      return;
    }
    setIsJoining(true);

    try {
      const roomRef = doc(db, 'rooms', joinRoomId.trim());
      const docSnap = await getDoc(roomRef);

      if (docSnap.exists()) {
        toast.success(`Joining room...`);
        onJoinRoom(joinRoomId.trim());
      } else {
        toast.error("Room not found. Please check the ID.");
        setIsJoining(false);
      }
    } catch (err) {
      console.error("Firestore Read Error in handleJoinRoom:", err);
      toast.error("An error occurred while joining the room.");
      setIsJoining(false);
    }
  };

  return (
    <motion.div
      key="lobby-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="relative min-h-screen w-full flex items-center justify-center font-sans overflow-hidden"
    >
      <AnimatedBackground />

      {/* --- ADDED SOCIAL BUTTONS --- */}
      <div className="absolute top-4 right-4 z-20">
        <SocialButton />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-5xl mx-auto p-4 z-10"
      >
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
            className="text-5xl md:text-7xl font-bold text-white mb-2 flex items-center justify-center gap-4"
          >
            <Code size={60} className="text-blue-400" />
            DevFusion IDE
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-gray-300 text-lg md:text-xl"
          >
            The future of collaborative coding is here.
          </motion.p>
          <motion.h4 className='text-sm text-gray-400'>
            ~developed by <span className="text-blue-400">AyushVerma@2025 | Project08</span>
          </motion.h4>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6, ease: "circOut" }}
            className="bg-black/30 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/10"
          >
            <h2 className="text-3xl font-semibold mb-6 text-white flex items-center gap-3">
              <Plus className="text-green-400" /> Create a Project
            </h2>
            <form onSubmit={handleCreateRoom} className="space-y-6">
              <AnimatedInput
                value={newProjectObjective}
                onChange={(e) => setNewProjectObjective(e.target.value)}
                placeholder="Enter your project objective..."
                required
              />
              <AnimatedButton
                text={isCreating ? "Creating..." : "Create & Start Coding"}
                type="submit"
                fullWidth
                disabled={isCreating}
              />
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6, ease: "circOut" }}
            className="bg-black/30 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/10"
          >
            <h2 className="text-3xl font-semibold mb-6 text-white flex items-center gap-3">
              <LogIn className="text-blue-400" /> Join a Room
            </h2>
            <form onSubmit={handleJoinRoom} className="space-y-6">
              <AnimatedInput
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                placeholder="Enter Room ID..."
                icon={LogIn}
                required
              />
              <AnimatedButton
                text={isJoining ? "Joining..." : "Join Room"}
                type="submit"
                fullWidth
                disabled={isJoining}
              />
            </form>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-center mt-12 text-gray-500 text-xs flex items-center justify-center gap-2"
        >
          <User size={14} /> <span>{userId ? `User ID: ${userId}` : "Connecting..."}</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Lobby;
