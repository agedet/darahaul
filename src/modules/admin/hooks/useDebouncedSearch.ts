import { useState, useEffect } from 'react';

export const useDebouncedSearch = (searchTerm: string, delay: number = 500) => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay]);

  return debouncedSearchTerm;
}; 