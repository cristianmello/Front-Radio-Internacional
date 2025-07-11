// src/context/SectionEditContext.jsx
import { createContext, useContext } from 'react';

export const SectionEditContext = createContext({
    canEdit: false,
    onAddItem: null,
    onRemove: null,
    onEdit: null,
    onDeleteSection: null,
});

export const useSectionEdit = () => useContext(SectionEditContext);
