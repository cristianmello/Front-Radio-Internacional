// src/context/ProfileSidebarContext.jsx
import React, { createContext, useState, useContext } from 'react';

const ProfileSidebarContext = createContext();

export const ProfileSidebarProvider = ({ children }) => {
    const [targetUserId, setTargetUserId] = useState(null);

    const openSidebar = (userId) => setTargetUserId(userId);
    const closeSidebar = () => setTargetUserId(null);

    return (
        <ProfileSidebarContext.Provider value={{ targetUserId, openSidebar, closeSidebar }}>
            {children}
        </ProfileSidebarContext.Provider>
    );
};

export const useProfileSidebar = () => useContext(ProfileSidebarContext);