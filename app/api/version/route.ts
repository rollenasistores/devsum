import { getLatestVersion } from "@/lib/github-api"

export async function GET() {
  try {
    const version = await getLatestVersion();
    return Response.json({ version });
  } catch (error) {
    console.error('Failed to fetch version:', error);
    return Response.json({ version: '1.6.0' }); // Fallback version
  }
}
