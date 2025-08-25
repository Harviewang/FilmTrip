import React from 'react';
import logoSvg from '../assets/logo.svg';

const Logo = ({ className = "h-8 w-8" }) => {
  return (
    <img 
      src={logoSvg} 
      alt="FilmTrip Logo" 
      className={className}
    />
  );
};

export default Logo;