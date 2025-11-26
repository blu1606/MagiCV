'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
    children: ReactNode;
    /**
     * Fallback UI to show when error occurs
     */
    fallback?: ReactNode;
    /**
     * Callback when error occurs (for logging to Sentry, etc.)
     */
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    /**
     * Whether to show error details (only in development)
     */
    showDetails?: boolean;
    /**
     * Custom error message to display
     */
    errorMessage?: string;
    /**
     * Feature name for contextual error messages
     */
    featureName?: string;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * React Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Log error to external service (e.g., Sentry)
        console.error('Error Boundary caught an error:', error, errorInfo);

        this.setState({
            error,
            errorInfo,
        });

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // TODO: Send to Sentry when integrated
        // Sentry.captureException(error, {
        //     contexts: {
        //         react: {
        //             componentStack: errorInfo.componentStack,
        //         },
        //     },
        // });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            const { error, errorInfo } = this.state;
            const { errorMessage, featureName, showDetails } = this.props;
            const isDevelopment = process.env.NODE_ENV === 'development';

            return (
                <div className="flex min-h-[400px] w-full items-center justify-center p-6">
                    <div className="w-full max-w-md space-y-6 rounded-lg border border-red-200 bg-red-50 p-8 shadow-sm">
                        {/* Error Icon */}
                        <div className="flex justify-center">
                            <div className="rounded-full bg-red-100 p-3">
                                <AlertTriangle className="h-8 w-8 text-red-600" />
                            </div>
                        </div>

                        {/* Error Message */}
                        <div className="space-y-2 text-center">
                            <h2 className="text-2xl font-semibold text-gray-900">
                                {featureName ? `${featureName} Error` : 'Something went wrong'}
                            </h2>
                            <p className="text-sm text-gray-600">
                                {errorMessage ||
                                    'An unexpected error occurred. Please try again or contact support if the problem persists.'}
                            </p>
                        </div>

                        {/* Error Details (Development Only) */}
                        {(isDevelopment || showDetails) && error && (
                            <div className="space-y-2 rounded-md bg-gray-900 p-4 text-xs">
                                <div className="font-mono text-red-400">
                                    <strong>Error:</strong> {error.toString()}
                                </div>
                                {errorInfo && (
                                    <details className="cursor-pointer">
                                        <summary className="font-mono text-gray-400 hover:text-gray-300">
                                            Component Stack
                                        </summary>
                                        <pre className="mt-2 overflow-auto text-gray-500">
                                            {errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
                            <Button
                                onClick={this.handleReset}
                                className="w-full"
                                variant="default"
                            >
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Try Again
                            </Button>

                            <div className="flex gap-2">
                                <Button
                                    onClick={this.handleReload}
                                    className="flex-1"
                                    variant="outline"
                                >
                                    <RefreshCcw className="mr-2 h-4 w-4" />
                                    Reload Page
                                </Button>

                                <Button
                                    onClick={this.handleGoHome}
                                    className="flex-1"
                                    variant="outline"
                                >
                                    <Home className="mr-2 h-4 w-4" />
                                    Go Home
                                </Button>
                            </div>
                        </div>

                        {/* Support Link */}
                        <p className="text-center text-xs text-gray-500">
                            Need help?{' '}
                            <a
                                href="mailto:support@magicv.ai"
                                className="text-blue-600 hover:underline"
                            >
                                Contact Support
                            </a>
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary {...errorBoundaryProps}>
            <Component {...props} />
        </ErrorBoundary>
    );

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

    return WrappedComponent;
}
