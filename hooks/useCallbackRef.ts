import { useRef, useCallback } from 'react';
import useSafeLayoutEffect from './useSafeLayoutEffect';

/**
 * React hook to persist any value between renders,
 * but keeps it up-to-date if it changes.
 */
function useCallbackRef<T extends (...args: any[]) => any>(fn: T | undefined): T {
  const ref = useRef(fn);

  useSafeLayoutEffect(() => {
    ref.current = fn;
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(((...args) => ref.current?.(...args)) as T, []);
}

export default useCallbackRef;
