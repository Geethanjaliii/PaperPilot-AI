import axios, { AxiosError } from "axios";

export const API_BASE_URL = "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // 60s timeout for heavy LLM operations
});

// A simple global state/subscribers hook for rate limiting (fallback if Zustand isn't loaded)
export interface RateLimitState {
  isRateLimited: boolean;
  retryAfter: number; // in seconds
  message: string;
}

let rateLimitState: RateLimitState = {
  isRateLimited: false,
  retryAfter: 0,
  message: "",
};

const listeners = new Set<(state: RateLimitState) => void>();

export const getRateLimitState = () => rateLimitState;

export const subscribeToRateLimit = (listener: (state: RateLimitState) => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const updateRateLimitState = (newState: RateLimitState) => {
  rateLimitState = newState;
  listeners.forEach((listener) => listener(rateLimitState));
};

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;

      if (status === 429) {
        // Quota Exceeded / Rate Limit
        let retryAfter = 10; // default fallback

        // Check header first
        const retryHeader = error.response.headers["retry-after"];
        if (retryHeader) {
          const parsedHeader = parseInt(retryHeader, 10);
          if (!isNaN(parsedHeader)) {
            retryAfter = parsedHeader;
          }
        } else if (data?.detail?.retry_after_seconds) {
          // Check response body
          retryAfter = data.detail.retry_after_seconds;
        }

        updateRateLimitState({
          isRateLimited: true,
          retryAfter,
          message: data?.detail?.message || "Rate limit exceeded. Please try again later.",
        });

        // Set a timer to automatically clear rate limit state
        setTimeout(() => {
          updateRateLimitState({
            isRateLimited: false,
            retryAfter: 0,
            message: "",
          });
        }, retryAfter * 1000);
      }
    }
    return Promise.reject(error);
  }
);
