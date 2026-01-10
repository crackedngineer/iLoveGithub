// app/api/healthz/route.ts
import {NextResponse} from "next/server";

/**
 * Liveness probe - checks if the application process is alive
 * This should be lightweight and always return 200 unless the process is dead
 * Used by Kubernetes to determine if the pod should be restarted
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      message: "Application is alive",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: "MB",
      },
    },
    {status: 200},
  );
}
