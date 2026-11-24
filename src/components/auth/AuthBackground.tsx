import React from 'react';

export const AuthBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/background_image.jpg)',
        }}
      />
      
      {/* Optional overlay for better text readability (can be adjusted or removed) */}
      <div className="absolute inset-0 bg-black/10" />
      
      {/* Logo as background element */}
      <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-0">
        <img 
          src="/darahaul-logo-icon-black.png" 
          alt="Darahaul Logo" 
          className="h-12 w-auto drop-shadow-lg opacity-80"
          onError={(e) => {
            // Fallback to logo.png if logo.svg doesn't exist
            const target = e.target as HTMLImageElement;
            target.src = '/darahaul-logo-icon-black.png';
            target.onerror = () => {
              target.style.display = 'none';
            };
          }}
        />
      </div>
    </div>
  );
};
