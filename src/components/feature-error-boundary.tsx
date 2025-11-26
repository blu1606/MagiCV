'use client';

import { ErrorBoundary } from './error-boundary';
import { ReactNode } from 'react';

/**
 * Error boundary for CV generation features
 */
export function CVGeneratorErrorBoundary({ children }: { children: ReactNode }) {
    return (
        <ErrorBoundary
            featureName="CV Generator"
            errorMessage="We couldn't generate your CV at this time. Please check your input and try again."
            onError={(error, errorInfo) => {
                console.error('CV Generator Error:', error, errorInfo);
                // TODO: Send to analytics/Sentry
            }}
        >
            {children}
        </ErrorBoundary>
    );
}

/**
 * Error boundary for job description matching
 */
export function JDMatchingErrorBoundary({ children }: { children: ReactNode }) {
    return (
        <ErrorBoundary
            featureName="Job Description Matching"
            errorMessage="We couldn't match your CV to the job description. Please try again or use a different job description."
            onError={(error, errorInfo) => {
                console.error('JD Matching Error:', error, errorInfo);
                // TODO: Send to analytics/Sentry
            }}
        >
            {children}
        </ErrorBoundary>
    );
}

/**
 * Error boundary for component library
 */
export function ComponentLibraryErrorBoundary({ children }: { children: ReactNode }) {
    return (
        <ErrorBoundary
            featureName="Component Library"
            errorMessage="We couldn't load your component library. Please refresh the page."
            onError={(error, errorInfo) => {
                console.error('Component Library Error:', error, errorInfo);
                // TODO: Send to analytics/Sentry
            }}
        >
            {children}
        </ErrorBoundary>
    );
}

/**
 * Error boundary for data source integration
 */
export function DataSourceErrorBoundary({ children }: { children: ReactNode }) {
    return (
        <ErrorBoundary
            featureName="Data Source Integration"
            errorMessage="We couldn't connect to your data source. Please check your connection and try again."
            onError={(error, errorInfo) => {
                console.error('Data Source Error:', error, errorInfo);
                // TODO: Send to analytics/Sentry
            }}
        >
            {children}
        </ErrorBoundary>
    );
}

/**
 * Error boundary for dashboard/analytics
 */
export function DashboardErrorBoundary({ children }: { children: ReactNode }) {
    return (
        <ErrorBoundary
            featureName="Dashboard"
            errorMessage="We couldn't load your dashboard. Please refresh the page to try again."
            onError={(error, errorInfo) => {
                console.error('Dashboard Error:', error, errorInfo);
                // TODO: Send to analytics/Sentry
            }}
        >
            {children}
        </ErrorBoundary>
    );
}

/**
 * Error boundary for authentication flows
 */
export function AuthErrorBoundary({ children }: { children: ReactNode }) {
    return (
        <ErrorBoundary
            featureName="Authentication"
            errorMessage="We encountered an authentication error. Please try logging in again."
            onError={(error, errorInfo) => {
                console.error('Auth Error:', error, errorInfo);
                // TODO: Send to analytics/Sentry
            }}
        >
            {children}
        </ErrorBoundary>
    );
}
