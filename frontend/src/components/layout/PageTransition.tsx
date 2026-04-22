import React from 'react'
import { motion } from 'framer-motion'

export const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="w-full h-full min-h-screen"
    >
      {children}
    </motion.div>
  )
}
