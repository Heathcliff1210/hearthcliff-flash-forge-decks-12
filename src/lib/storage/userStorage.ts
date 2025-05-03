
// User management functionality
import { User } from './types';
import { getLocalStorageItem, setLocalStorageItem } from './utils';
import { generateId } from './types';

/**
 * Create a new user account
 */
export function createUser(username: string, email: string, password: string): User {
  const users = getLocalStorageItem('users') || {};
  
  const id = generateId();
  const newUser: User = {
    id,
    username,
    email,
    password,
    createdAt: Date.now(),
  };
  
  users[id] = newUser;
  setLocalStorageItem('users', users);
  
  return newUser;
}

/**
 * Get the currently logged in user
 */
export function getUser(): User | null {
  const sessionId = getLocalStorageItem('sessionId');
  if (!sessionId) return null;
  
  const users = getLocalStorageItem('users') || {};
  return users[sessionId] || null;
}

/**
 * Set a user and create a session
 */
export function setUser(user: User): void {
  const users = getLocalStorageItem('users') || {};
  users[user.id] = user;
  setLocalStorageItem('users', users);
  setLocalStorageItem('sessionId', user.id);
}

/**
 * Check if there is an active session
 */
export function hasSession(): boolean {
  const sessionId = getLocalStorageItem('sessionId');
  if (!sessionId) return false;
  
  const users = getLocalStorageItem('users') || {};
  return !!users[sessionId];
}

/**
 * Log in a user with email and password
 */
export function login(email: string, password: string): User | null {
  const users = getLocalStorageItem('users') || {};
  
  const user = Object.values(users).find(
    (u: any) => u.email === email && u.password === password
  ) as User | undefined;
  
  if (user) {
    setLocalStorageItem('sessionId', user.id);
    return user;
  }
  
  return null;
}

/**
 * Log out the current user
 */
export function logout(): boolean {
  localStorage.removeItem('sessionId');
  return true;
}
