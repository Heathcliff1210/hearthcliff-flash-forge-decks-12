
// Legacy file that re-exports the modular storage API for backward compatibility
// This allows existing code to keep using imports from localStorage.ts

import * as Storage from './storage';
import { User } from './storage/types';
import { getUser, updateUser } from './storage/userStorage';
import { hasSession, clearSessionKey } from './sessionManager';

// Re-export everything from the modular storage system
export * from './storage';

// Generate sample data on first load
Storage.generateSampleData();

// Profile management functions
export function getProfile() {
  return getUser();
}

export function updateProfile(user: User) {
  return updateUser(user);
}

export function resetUserData() {
  // Clear user-related data
  localStorage.removeItem('users');
  localStorage.removeItem('sessionId');
  localStorage.removeItem('decks');
  localStorage.removeItem('flashcards');
  localStorage.removeItem('themes');
  return true;
}

// Export logout function for backward compatibility
export function logout() {
  return clearSessionKey();
}
