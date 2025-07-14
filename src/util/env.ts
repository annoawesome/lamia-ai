/**
 * Get variable from .env
 * @param {string} variableName Name of variable
 */
export function getEnvVar(variableName: string) {
    return process.env[variableName];
}