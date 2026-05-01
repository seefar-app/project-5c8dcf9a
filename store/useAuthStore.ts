import { create } from 'zustand';
import * as Crypto from 'expo-crypto';
import type { User, Address, PaymentMethod } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, phone: string) => Promise<boolean>;
  logout: () => void;
  initializeAuth: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  removeAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => void;
  removePaymentMethod: (methodId: string) => void;
  setDefaultPaymentMethod: (methodId: string) => void;
}

const mockUser: User = {
  id: 'user-001',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  phone: '+1 555-0123',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  addresses: [
    {
      id: 'addr-001',
      label: 'Home',
      street: '123 Forest Lane',
      city: 'San Francisco',
      zipCode: '94102',
      lat: 37.7749,
      lng: -122.4194,
      isDefault: true,
    },
    {
      id: 'addr-002',
      label: 'Work',
      street: '456 Oak Street',
      city: 'San Francisco',
      zipCode: '94103',
      lat: 37.7849,
      lng: -122.4094,
      isDefault: false,
    },
  ],
  paymentMethods: [
    {
      id: 'pay-001',
      type: 'card',
      label: 'Visa ending in 4242',
      lastFour: '4242',
      expiryDate: '12/26',
      isDefault: true,
    },
    {
      id: 'pay-002',
      type: 'cash',
      label: 'Cash on Delivery',
      isDefault: false,
    },
  ],
  preferences: {
    dietaryRestrictions: ['vegetarian'],
    notificationsEnabled: true,
    defaultPaymentMethodId: 'pay-001',
    defaultAddressId: 'addr-001',
  },
  totalOrders: 47,
  joinedDate: new Date('2023-06-15'),
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  authError: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, authError: null });
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (email === 'test@test.com' && password === 'password') {
        set({ 
          user: mockUser, 
          isAuthenticated: true, 
          isLoading: false,
          authError: null,
        });
        return true;
      }
      
      if (email && password.length >= 6) {
        set({ 
          user: { ...mockUser, email, name: email.split('@')[0] }, 
          isAuthenticated: true, 
          isLoading: false,
          authError: null,
        });
        return true;
      }
      
      set({ 
        isLoading: false, 
        authError: 'Invalid email or password. Please try again.',
      });
      return false;
    } catch (error) {
      set({ 
        isLoading: false, 
        authError: 'An unexpected error occurred. Please try again.',
      });
      return false;
    }
  },

  signup: async (name: string, email: string, password: string, phone: string) => {
    set({ isLoading: true, authError: null });
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      
      if (!name || name.length < 2) {
        set({ isLoading: false, authError: 'Please enter a valid name.' });
        return false;
      }
      
      if (!email || !email.includes('@')) {
        set({ isLoading: false, authError: 'Please enter a valid email address.' });
        return false;
      }
      
      if (!password || password.length < 6) {
        set({ isLoading: false, authError: 'Password must be at least 6 characters.' });
        return false;
      }
      
      const newUser: User = {
        ...mockUser,
        id: Crypto.randomUUID(),
        name,
        email,
        phone,
        totalOrders: 0,
        joinedDate: new Date(),
      };
      
      set({ 
        user: newUser, 
        isAuthenticated: true, 
        isLoading: false,
        authError: null,
      });
      return true;
    } catch (error) {
      set({ 
        isLoading: false, 
        authError: 'Failed to create account. Please try again.',
      });
      return false;
    }
  },

  logout: () => {
    set({ 
      user: null, 
      isAuthenticated: false, 
      isLoading: false,
      authError: null,
    });
  },

  initializeAuth: async () => {
    set({ isLoading: true });
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  updateUser: (updates) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, ...updates } });
    }
  },

  addAddress: (address) => {
    const { user } = get();
    if (user) {
      const newAddress: Address = { ...address, id: Crypto.randomUUID() };
      set({ 
        user: { 
          ...user, 
          addresses: [...user.addresses, newAddress],
        },
      });
    }
  },

  removeAddress: (addressId) => {
    const { user } = get();
    if (user) {
      set({
        user: {
          ...user,
          addresses: user.addresses.filter((a) => a.id !== addressId),
        },
      });
    }
  },

  setDefaultAddress: (addressId) => {
    const { user } = get();
    if (user) {
      set({
        user: {
          ...user,
          addresses: user.addresses.map((a) => ({
            ...a,
            isDefault: a.id === addressId,
          })),
          preferences: {
            ...user.preferences,
            defaultAddressId: addressId,
          },
        },
      });
    }
  },

  addPaymentMethod: (method) => {
    const { user } = get();
    if (user) {
      const newMethod: PaymentMethod = { ...method, id: Crypto.randomUUID() };
      set({
        user: {
          ...user,
          paymentMethods: [...user.paymentMethods, newMethod],
        },
      });
    }
  },

  removePaymentMethod: (methodId) => {
    const { user } = get();
    if (user) {
      set({
        user: {
          ...user,
          paymentMethods: user.paymentMethods.filter((p) => p.id !== methodId),
        },
      });
    }
  },

  setDefaultPaymentMethod: (methodId) => {
    const { user } = get();
    if (user) {
      set({
        user: {
          ...user,
          paymentMethods: user.paymentMethods.map((p) => ({
            ...p,
            isDefault: p.id === methodId,
          })),
          preferences: {
            ...user.preferences,
            defaultPaymentMethodId: methodId,
          },
        },
      });
    }
  },
}));