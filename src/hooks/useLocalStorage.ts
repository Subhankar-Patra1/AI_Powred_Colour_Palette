
"use client";

import { useState, useEffect } from 'react';

function tryParse<T>(value: string | null): T | null {
  if (value === null) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn(`Failed to parse localStorage key "${key}" with value "${value}":`, error);
    return null; 
  }
}

// Overload for initialValue not being a function
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>];

// Overload for initialValue being a function
export function useLocalStorage<T>(
  key: string,
  initialValue: () => T
): [T, React.Dispatch<React.SetStateAction<T>>];

// Implementation
export function useLocalStorage<T>(
  key: string,
  initialValueInput: T | (() => T)
): [T, React.Dispatch<React.SetStateAction<T>>] {
  
  const [storedValue, setStoredValue] = useState<T>(() => {
    // This function is for useState's lazy initialization.
    // It runs ONLY once on initial render.
    // We return initialValueInput directly here to ensure server and client first render are identical.
    // Actual localStorage reading will happen in useEffect.
    if (typeof initialValueInput === 'function') {
      return (initialValueInput as () => T)();
    }
    return initialValueInput;
  });

  // Effect to load from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let valueToSet: T;
    try {
      const item = window.localStorage.getItem(key);
      const parsedItem = tryParse<T>(item);

      if (parsedItem !== null) {
        valueToSet = parsedItem;
      } else {
        valueToSet = typeof initialValueInput === 'function'
          ? (initialValueInput as () => T)()
          : initialValueInput;
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      valueToSet = typeof initialValueInput === 'function'
        ? (initialValueInput as () => T)()
        : initialValueInput;
    }
    setStoredValue(valueToSet);
  // Only depend on key. initialValueInput is for the *initial* state or if storage is empty/invalid.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]); 

  // Effect to save to localStorage whenever storedValue changes (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    // This effect runs after the initial render where storedValue is initialValueInput,
    // and after the load effect updates storedValue.
    // So, it will correctly save the loaded value or subsequent updates.
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
