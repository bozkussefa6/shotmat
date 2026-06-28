import React, { createContext, useContext } from 'react';

export const AppContext = createContext({
  onDataReset: () => {},
});

export const useAppContext = () => useContext(AppContext);
