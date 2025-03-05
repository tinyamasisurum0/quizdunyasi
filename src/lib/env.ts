/**
 * Utility functions for handling environment variables
 */

/**
 * Gets an environment variable and throws an error if it's not defined
 * @param key The environment variable key
 * @returns The environment variable value
 */
export function getEnvVariable(key: string): string {
  const value = process.env[key];
  
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  
  return value;
}

/**
 * Gets an environment variable with a fallback value if it's not defined
 * @param key The environment variable key
 * @param fallback The fallback value
 * @returns The environment variable value or the fallback
 */
export function getEnvVariableWithFallback(key: string, fallback: string): string {
  const value = process.env[key];
  return value || fallback;
}

/**
 * Checks if an environment variable is defined and equals a specific value
 * @param key The environment variable key
 * @param expectedValue The expected value
 * @returns True if the environment variable equals the expected value
 */
export function isEnvVariableEqual(key: string, expectedValue: string): boolean {
  const value = process.env[key];
  return value === expectedValue;
}

/**
 * Checks if the current environment is production
 * @returns True if NODE_ENV is 'production'
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Checks if the current environment is development
 * @returns True if NODE_ENV is 'development'
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Checks if the current environment is test
 * @returns True if NODE_ENV is 'test'
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
} 