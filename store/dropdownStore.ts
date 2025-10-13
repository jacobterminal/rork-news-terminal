import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo } from 'react';

export type DropdownId = string;

export const [DropdownProvider, useDropdown] = createContextHook(() => {
  const [activeDropdownId, setActiveDropdownId] = useState<DropdownId | null>(null);

  const registerDropdown = useCallback((dropdownId: DropdownId, isOpen: boolean) => {
    if (isOpen) {
      if (activeDropdownId !== dropdownId) {
        setActiveDropdownId(dropdownId);
      }
    } else {
      if (activeDropdownId === dropdownId) {
        setActiveDropdownId(null);
      }
    }
  }, [activeDropdownId]);

  const closeAllDropdowns = useCallback(() => {
    setActiveDropdownId(null);
  }, []);

  const isDropdownActive = useCallback((dropdownId: DropdownId) => {
    return activeDropdownId === dropdownId;
  }, [activeDropdownId]);

  const shouldCloseDropdown = useCallback((dropdownId: DropdownId) => {
    return activeDropdownId !== null && activeDropdownId !== dropdownId;
  }, [activeDropdownId]);

  return useMemo(() => ({
    activeDropdownId,
    registerDropdown,
    closeAllDropdowns,
    isDropdownActive,
    shouldCloseDropdown,
  }), [activeDropdownId, registerDropdown, closeAllDropdowns, isDropdownActive, shouldCloseDropdown]);
});
