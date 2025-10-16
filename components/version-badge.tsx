import { Badge } from "@/components/ui/badge"
import { Terminal } from "lucide-react"
import { getLatestVersion } from "@/lib/github-api"

interface VersionBadgeProps {
  className?: string;
}

export async function VersionBadge({ className }: VersionBadgeProps) {
  let version: string;
  
  try {
    version = await getLatestVersion();
  } catch (error) {
    console.error('Failed to fetch version:', error);
    version = '1.6.0'; // Fallback version
  }

  return (
    <Badge variant="secondary" className={`gap-2 ${className}`}>
      <Terminal className="h-3 w-3" />
      <span className="font-mono text-xs">v{version}</span>
    </Badge>
  );
}
