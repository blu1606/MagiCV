'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application Error:', error);
    }, [error]);

    return (
        <div className="flex min-h-screen w-full items-center justify-center p-6">
            <div className="w-full max-w-md space-y-6 rounded-lg border border-red-200 bg-red-50 p-8 shadow-sm dark:border-red-900 dark:bg-red-950">
                {/* Error Icon */}
                <div className="flex justify-center">
                    <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
                        <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                </div>

                {/* Error Message */}
                <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        Something went wrong
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        An unexpected error occurred. Please try again or contact support if the problem persists.
                    </p>
                </div>

                {/* Error Details (Development Only) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="space-y-2 rounded-md bg-gray-900 p-4 text-xs">
                        <div className="font-mono text-red-400">
                            <strong>Error:</strong> {error.message}
                        </div>
                        {error.digest && (
                            <div className="font-mono text-gray-500">
                                <strong>Digest:</strong> {error.digest}
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                    <Button onClick={reset} className="w-full" variant="default">
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Try Again
                    </Button>

                    <Button
                        onClick={() => (window.location.href = '/')}
                        className="w-full"
                        variant="outline"
                    >
                        <Home className="mr-2 h-4 w-4" />
                        Go Home
                    </Button>
                </div>

                {/* Support Link */}
                <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                    Need help?{' '}
                    <a
                        href="mailto:support@magicv.ai"
                        className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                        Contact Support
                    </a>
                </p>
            </div>
        </div>
    );
}
