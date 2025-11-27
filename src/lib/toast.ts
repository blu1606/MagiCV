/**
 * Toast notification utilities using Sonner
 * Provides consistent toast messaging across the application
 */

import { toast as sonnerToast, ExternalToast } from 'sonner';

/**
 * Toast configuration with appropriate durations and options
 */
const TOAST_DURATIONS = {
  success: 3000,
  error: 5000,
  info: 4000,
  warning: 4000,
  loading: Infinity,
} as const;

/**
 * Max number of concurrent toasts to prevent overwhelming the UI
 */
const MAX_TOASTS = 3;

/**
 * Success toast for completed actions
 */
export const showSuccess = (message: string, data?: ExternalToast) => {
  return sonnerToast.success(message, {
    duration: TOAST_DURATIONS.success,
    ...data,
  });
};

/**
 * Error toast for failed operations
 */
export const showError = (message: string, data?: ExternalToast) => {
  return sonnerToast.error(message, {
    duration: TOAST_DURATIONS.error,
    ...data,
  });
};

/**
 * Info toast for important updates
 */
export const showInfo = (message: string, data?: ExternalToast) => {
  return sonnerToast.info(message, {
    duration: TOAST_DURATIONS.info,
    ...data,
  });
};

/**
 * Warning toast for cautionary messages
 */
export const showWarning = (message: string, data?: ExternalToast) => {
  return sonnerToast.warning(message, {
    duration: TOAST_DURATIONS.warning,
    ...data,
  });
};

/**
 * Loading toast for async operations
 */
export const showLoading = (message: string, data?: ExternalToast) => {
  return sonnerToast.loading(message, {
    duration: TOAST_DURATIONS.loading,
    ...data,
  });
};

/**
 * Promise toast for handling async operations with automatic state management
 */
export const showPromise = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: unknown) => string);
  },
  data?: ExternalToast
) => {
  return sonnerToast.promise(promise, messages, data);
};

/**
 * Action toast with a button for undo/retry actions
 */
export const showActionToast = (
  message: string,
  actionLabel: string,
  onAction: () => void,
  type: 'success' | 'error' | 'info' | 'warning' = 'info',
  data?: ExternalToast
) => {
  const toastFn = {
    success: showSuccess,
    error: showError,
    info: showInfo,
    warning: showWarning,
  }[type];

  return toastFn(message, {
    action: {
      label: actionLabel,
      onClick: onAction,
    },
    ...data,
  });
};

/**
 * Dismiss a specific toast by ID
 */
export const dismissToast = (toastId: string | number) => {
  sonnerToast.dismiss(toastId);
};

/**
 * Dismiss all toasts
 */
export const dismissAllToasts = () => {
  sonnerToast.dismiss();
};

/**
 * Custom toast for advanced use cases
 */
export const showCustomToast = (
  message: string | React.ReactNode,
  data?: ExternalToast
) => {
  return sonnerToast(message, data);
};

/**
 * Re-export the base toast function for flexibility
 */
export const toast = {
  success: showSuccess,
  error: showError,
  info: showInfo,
  warning: showWarning,
  loading: showLoading,
  promise: showPromise,
  custom: showCustomToast,
  dismiss: dismissToast,
  dismissAll: dismissAllToasts,
  action: showActionToast,
};

export default toast;
