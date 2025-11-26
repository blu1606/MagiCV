import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Structured Logger Configuration
 */
export const logger = pino({
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),

    // In development, use pino-pretty for readable logs
    // In production, use JSON for structured logging
    transport: isProduction
        ? undefined
        : {
            target: 'pino-pretty',
            options: {
                colorize: true,
                ignore: 'pid,hostname',
                translateTime: 'SYS:standard',
            },
        },

    // Redact sensitive keys
    redact: {
        paths: [
            'password',
            'token',
            'apiKey',
            'api_key',
            'secret',
            'authorization',
            'cookie',
            'session',
            'user.email',
            'user.phone',
            'headers.authorization',
            'headers.cookie',
            'body.password',
            'body.token',
        ],
        remove: true,
    },

    // Add base bindings
    base: {
        env: process.env.NODE_ENV,
        version: process.env.npm_package_version,
    },
});

/**
 * Create a child logger with context
 */
export function createLogger(context: string | object) {
    return logger.child(
        typeof context === 'string' ? { context } : context
    );
}

// Log unhandled rejections
process.on('unhandledRejection', (err) => {
    logger.fatal({ err }, 'Unhandled Rejection');
    // Don't exit in production, just log
    if (!isProduction) {
        process.exit(1);
    }
});

// Log uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Uncaught Exception');
    // Always exit on uncaught exception to prevent undefined state
    process.exit(1);
});
