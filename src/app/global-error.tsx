'use client';

import { useEffect } from 'react';

/**
 * Global Error Boundary
 * This catches errors in the root layout
 */
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Global Error:', error);
    }, [error]);

    return (
        <html lang="en">
            <body>
                <div style={{
                    display: 'flex',
                    minHeight: '100vh',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    backgroundColor: '#fef2f2',
                }}>
                    <div style={{
                        maxWidth: '448px',
                        width: '100%',
                        padding: '32px',
                        borderRadius: '8px',
                        border: '1px solid #fecaca',
                        backgroundColor: 'white',
                        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '24px',
                        }}>
                            {/* Error Icon */}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    display: 'inline-flex',
                                    padding: '12px',
                                    borderRadius: '9999px',
                                    backgroundColor: '#fee2e2',
                                }}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="32"
                                        height="32"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#dc2626"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                                        <line x1="12" y1="9" x2="12" y2="13" />
                                        <line x1="12" y1="17" x2="12.01" y2="17" />
                                    </svg>
                                </div>
                            </div>

                            {/* Error Message */}
                            <div style={{ textAlign: 'center' }}>
                                <h2 style={{
                                    fontSize: '24px',
                                    fontWeight: '600',
                                    color: '#111827',
                                    marginBottom: '8px',
                                }}>
                                    Application Error
                                </h2>
                                <p style={{
                                    fontSize: '14px',
                                    color: '#6b7280',
                                }}>
                                    A critical error occurred. Please reload the page or contact support.
                                </p>
                            </div>

                            {/* Error Details (Development Only) */}
                            {process.env.NODE_ENV === 'development' && (
                                <div style={{
                                    padding: '16px',
                                    borderRadius: '6px',
                                    backgroundColor: '#1f2937',
                                    fontSize: '12px',
                                    fontFamily: 'monospace',
                                }}>
                                    <div style={{ color: '#f87171' }}>
                                        <strong>Error:</strong> {error.message}
                                    </div>
                                    {error.digest && (
                                        <div style={{ color: '#6b7280', marginTop: '8px' }}>
                                            <strong>Digest:</strong> {error.digest}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                            }}>
                                <button
                                    onClick={reset}
                                    style={{
                                        width: '100%',
                                        padding: '10px 16px',
                                        borderRadius: '6px',
                                        backgroundColor: '#2563eb',
                                        color: 'white',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Try Again
                                </button>

                                <button
                                    onClick={() => window.location.reload()}
                                    style={{
                                        width: '100%',
                                        padding: '10px 16px',
                                        borderRadius: '6px',
                                        backgroundColor: 'white',
                                        color: '#374151',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        border: '1px solid #d1d5db',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Reload Page
                                </button>
                            </div>

                            {/* Support Link */}
                            <p style={{
                                textAlign: 'center',
                                fontSize: '12px',
                                color: '#6b7280',
                            }}>
                                Need help?{' '}
                                <a
                                    href="mailto:support@magicv.ai"
                                    style={{
                                        color: '#2563eb',
                                        textDecoration: 'none',
                                    }}
                                >
                                    Contact Support
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
