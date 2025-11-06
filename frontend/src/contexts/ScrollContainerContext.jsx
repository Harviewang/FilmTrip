import React, { createContext, useContext } from 'react';

const ScrollContainerContext = createContext({ scrollContainerRef: null, authRef: { isAdmin: false } });

export const ScrollContainerProvider = ({ children, scrollContainerRef, authRef }) => {
  return (
    <ScrollContainerContext.Provider value={{ scrollContainerRef, authRef }}>
      {children}
    </ScrollContainerContext.Provider>
  );
};

export const useScrollContainer = () => {
  return useContext(ScrollContainerContext);
};
