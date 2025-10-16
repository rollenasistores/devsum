import { useState, useEffect } from 'react';
import { getLatestVersion } from '@/lib/github-api';

export function useVersion() {
  const [version, setVersion] = useState<string>('1.6.0'); // Default fallback
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const latestVersion = await getLatestVersion();
        setVersion(latestVersion);
      } catch (err) {
        console.error('Failed to fetch version:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch version');
        // Keep the default version on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersion();
  }, []);

  return { version, isLoading, error };
}
