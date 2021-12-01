/**
 * Generates a unique random id string when called
 */
 export const uid = () => Math.random().toString(36).substr(2, 9);
