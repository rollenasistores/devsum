"use client"

import { Badge } from "@/components/ui/badge"
import { Terminal } from "lucide-react"
import { useState, useEffect } from "react"

interface VersionBadgeProps {
  className?: string;
}

export function VersionBadgeClient({ className }: VersionBadgeProps) {
  const [version, setVersion] = useState('1.6.0'); // Default fallback version
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const response = await fetch('/api/version');
        if (response.ok) {
          const data = await response.json();
          setVersion(data.version);
        }
      } catch (error) {
        console.error('Failed to fetch version:', error);
        // Keep the default version
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersion();
  }, []);

  return (
    <Badge variant="secondary" className={`gap-2 ${className}`}>
      <Terminal className="h-3 w-3" />
      <span className="font-mono text-xs">v{version}</span>
    </Badge>
  );
}
