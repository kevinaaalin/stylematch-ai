import React from 'react';
import { motion } from 'framer-motion';

export default function StyleRatingCard({ imageSrc }) {
  if (!imageSrc) return null;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="absolute w-full h-full max-w-sm mx-auto"
    >
      <div
        className="w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden bg-cover bg-center border-4 border-white"
        style={{ 
          backgroundImage: `url(${imageSrc})`,
        }}
      />
    </motion.div>
  );
}