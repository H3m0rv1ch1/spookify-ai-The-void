import React from 'react';

interface SpookyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'ritual';
  isLoading?: boolean;
}

export const SpookyButton: React.FC<SpookyButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  disabled,
  ...props 
}) => {
  
  // Base style updated to rounded-xl to match the "Initialize" button aesthetic
  // Added whitespace-nowrap to prevent text stacking
  const baseStyle = "relative group overflow-hidden font-tech font-bold uppercase tracking-widest text-sm transition-all duration-300 transform active:scale-95 rounded-xl whitespace-nowrap";
  
  const variants = {
    // Primary: White button (Save to Reality)
    primary: "bg-white text-black hover:bg-neon-red hover:text-white px-8 py-4 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,42,42,0.5)]",
    
    // Ghost: Dark button with border (secondary actions)
    ghost: "bg-black/50 border border-white/20 text-white hover:border-white hover:text-black hover:bg-white px-8 py-4 hover:bg-white/5 shadow-lg",
    
    // Ritual: The original high-emphasis button (Red)
    ritual: "bg-neon-red text-black hover:bg-white hover:text-neon-red px-10 py-5 shadow-[0_0_30px_rgba(255,42,42,0.4)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)]"
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Shining Wipe Effect */}
      <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent z-20 skew-x-12"></div>
      
      <div className="relative z-10 flex items-center justify-center gap-3">
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            <span>PROCESSING...</span>
          </>
        ) : (
          <>
             <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs transform -translate-x-2 text-current">[</span>
             {children}
             <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs transform translate-x-2 text-current">]</span>
          </>
        )}
      </div>
    </button>
  );
};