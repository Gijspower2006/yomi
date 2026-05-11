import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { AuthUser } from '../types';

const USERS_KEY = 'yomi_users';

interface StoredUser {
  id: string;
  identifier: string; // normalised email or phone
  displayName: string;
  salt: string;
  hash: string;
}

async function loadUsers(): Promise<StoredUser[]> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveUsers(users: StoredUser[]): Promise<void> {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

async function hashPassword(password: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    salt + password,
  );
}

function normalise(identifier: string): string {
  const s = identifier.trim();
  return s.includes('@') ? s.toLowerCase() : s.replace(/\s/g, '');
}

function makeId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function register(
  identifier: string,
  password: string,
  displayName: string,
): Promise<AuthUser> {
  const norm = normalise(identifier);
  const users = await loadUsers();

  if (users.find(u => u.identifier === norm)) {
    throw new Error('An account with this email or phone already exists');
  }

  const salt = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    makeId(),
  );
  const hash = await hashPassword(password, salt);
  const id = makeId();

  const newUser: StoredUser = { id, identifier: norm, displayName: displayName.trim(), salt, hash };
  await saveUsers([...users, newUser]);

  return { id: parseInt(id, 36) || 1, identifier: norm, displayName: newUser.displayName, token: id };
}

export async function login(identifier: string, password: string): Promise<AuthUser> {
  const norm = normalise(identifier);
  const users = await loadUsers();
  const user = users.find(u => u.identifier === norm);

  if (!user) {
    throw new Error('No account found with that email or phone number');
  }

  const hash = await hashPassword(password, user.salt);
  if (hash !== user.hash) {
    throw new Error('Incorrect password');
  }

  return { id: parseInt(user.id, 36) || 1, identifier: norm, displayName: user.displayName, token: user.id };
}

// Kept for future backend sync — not used in local mode
export async function verifyToken(_token: string): Promise<AuthUser | null> {
  return null;
}
