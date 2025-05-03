// Legacy file that re-exports the modular storage API for backward compatibility
// This allows existing code to keep using imports from localStorage.ts

import * as Storage from './storage';

// Re-export everything from the modular storage system
export * from './storage';

// Generate sample data on first load
Storage.generateSampleData();
