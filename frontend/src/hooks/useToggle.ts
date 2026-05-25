import { useState, useCallback } from 'react';

export function useToggle(initialState = false): [boolean, () => void, (val: boolean) => void] {
  const [state, setState] = useState(initialState);
  
  const toggle = useCallback(() => setState(s => !s), []);
  const set = useCallback((value: boolean) => setState(value), []);
  
  return [state, toggle, set];
}
