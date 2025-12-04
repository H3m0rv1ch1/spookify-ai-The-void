import React, { useEffect, useState } from 'react';

export const GeneratingView: React.FC = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative w-full bg-void z-20">
      
      {/* Clean Minimal Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-50"></div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Minimal Pulse Loader */}
        <div className="relative mb-12">
           <div className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-neon-red/20 animate-pulse flex items-center justify-center">
                  <div className="w-2 h-2 bg-neon-red rounded-full shadow-[0_0_20px_rgba(255,42,42,1)]"></div>
              </div>
           </div>
           {/* Rotating ring */}
           <div className="absolute inset-0 border-t border-neon-red rounded-full animate-spin"></div>
        </div>

        <h2 className="font-display font-bold text-3xl md:text-4xl text-white tracking-widest uppercase mb-2">
          Generating
        </h2>
        
        <p className="font-tech text-ash/50 text-xs tracking-[0.5em] uppercase">
          Applying Neural Filters{dots}
        </p>
      </div>
    </div>
  );
};