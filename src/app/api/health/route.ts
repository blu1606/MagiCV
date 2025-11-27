import { NextResponse } from 'next/server';
import { checkDatabaseHealth, getConnectionPoolMetrics } from '@/lib/supabase';

/**
 * GET /api/health - Health check endpoint with database and connection pool monitoring
 */
export async function GET() {
  const startTime = Date.now();

  // Check database health
  const dbHealth = await checkDatabaseHealth();

  // Get connection pool metrics
  const poolMetrics = getConnectionPoolMetrics();

  const responseTime = Date.now() - startTime;
  const isHealthy = dbHealth.healthy;

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'MagicCV API',
      responseTime: `${responseTime}ms`,
      database: {
        healthy: dbHealth.healthy,
        latency: `${dbHealth.latency}ms`,
        error: dbHealth.error,
      },
      connectionPool: {
        poolSize: poolMetrics.poolSize,
        timeout: `${poolMetrics.timeout}ms`,
        statementTimeout: `${poolMetrics.statementTimeout}ms`,
        idleTimeout: `${poolMetrics.idleTimeout}ms`,
      },
    },
    { status: isHealthy ? 200 : 503 }
  );
}

