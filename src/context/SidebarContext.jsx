import React from 'react';

export const SidebarContext = React.createContext(null);

export const useSidebar = () => React.useContext(SidebarContext);