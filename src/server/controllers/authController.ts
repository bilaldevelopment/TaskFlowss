import { Response } from 'express';
import { z } from 'zod';
import { dbStore } from '../db/store.js';
import {
  comparePassword,
  generateToken,
  hashPassword,
  sanitizeUser,
} from '../utils/auth.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { UserRole } from '../db/types.js';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().email('Valid email address is required').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['admin', 'project_manager', 'member']).optional().default('member'),
  title: z.string().max(80).optional(),
  department: z.string().max(80).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email address is required').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  title: z.string().max(80).optional(),
  department: z.string().max(80).optional(),
  avatar: z.string().url('Avatar must be a valid URL').optional().or(z.literal('')),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export async function register(req: AuthenticatedRequest, res: Response) {
  const { name, email, password, role, title, department } = req.body;

  const existingUser = dbStore.findUserByEmail(email);
  if (existingUser) {
    res.status(409).json({ error: 'An account with this email address already exists.' });
    return;
  }

  const passwordHash = await hashPassword(password);
  const newUser = dbStore.createUser({
    name,
    email,
    passwordHash,
    role: (role as UserRole) || 'member',
    title: title || 'Team Member',
    department: department || 'General',
    isActive: true,
  });

  const token = generateToken({
    id: newUser._id,
    email: newUser.email,
    role: newUser.role,
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    message: 'User registered successfully',
    user: sanitizeUser(newUser),
    token,
  });
}

export async function login(req: AuthenticatedRequest, res: Response) {
  const { email, password } = req.body;

  const user = dbStore.findUserByEmail(email);
  if (!user || !user.isActive) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = generateToken({
    id: user._id,
    email: user.email,
    role: user.role,
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    message: 'Logged in successfully',
    user: sanitizeUser(user),
    token,
  });
}

export function logout(_req: AuthenticatedRequest, res: Response) {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
}

export function getMe(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  res.status(200).json({ user: sanitizeUser(req.user) });
}

export function updateProfile(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const updated = dbStore.updateUser(req.user._id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.status(200).json({
    message: 'Profile updated successfully',
    user: sanitizeUser(updated),
  });
}

export async function changePassword(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const { currentPassword, newPassword } = req.body;
  const isMatch = await comparePassword(currentPassword, req.user.passwordHash);
  if (!isMatch) {
    res.status(400).json({ error: 'Incorrect current password' });
    return;
  }

  const newHash = await hashPassword(newPassword);
  dbStore.updateUser(req.user._id, { passwordHash: newHash });

  res.status(200).json({ message: 'Password changed successfully' });
}
