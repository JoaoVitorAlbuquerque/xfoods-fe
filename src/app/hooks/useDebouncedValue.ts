import { useEffect, useState } from "react";

/** Evita disparar uma consulta por tecla digitada na busca. */
export function useDebouncedValue<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
}
