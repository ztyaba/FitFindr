import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function ExerciseImageLightbox({ image, onClose }) {
    // Close on escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!image) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 sm:p-8"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative max-w-5xl w-full flex flex-col items-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white transition-colors"
                    >
                        <X className="h-8 w-8" />
                    </button>

                    {/* Image Container */}
                    <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-2xl">
                        <img
                            src={image.url}
                            alt={image.title}
                            className="w-full h-auto object-contain max-h-[75vh]"
                        />

                        {/* Overlay Info */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-6 pt-12">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1">
                                Reference
                            </p>
                            <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                                {image.title}
                            </h3>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
