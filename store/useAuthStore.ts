import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { User, Address, PaymentMethod } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: { name: string; email: string; password: string; phone: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  removeAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => Promise<void>;
  removePaymentMethod: (methodId: string) => Promise<void>;
  setDefaultPaymentMethod: (methodId: string) => Promise<void>;
}

const mapDatabaseUserToUser = (dbUser: any): User => {
  return {
    id: dbUser.id,
    name: dbUser.name || '',
    email: dbUser.email || '',
    phone: dbUser.phone || '',
    avatar: dbUser.avatar || '',
    addresses: [],
    paymentMethods: [],
    preferences: {
      dietaryRestrictions: [],
      notificationsEnabled: true,
      defaultPaymentMethodId: undefined,
      defaultAddressId: undefined,
    },
    totalOrders: dbUser.totalOrders || 0,
    joinedDate: dbUser.joinedDate ? new Date(dbUser.joinedDate) : new Date(),
  };
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  authError: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, authError: null });

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        let friendlyMessage = 'Incorrect email or password. Please try again.';
        if (authError.message.includes('Invalid login credentials')) {
          friendlyMessage = 'Incorrect email or password. Please try again.';
        } else if (authError.message.includes('Email not confirmed')) {
          friendlyMessage = 'Please verify your email address.';
        }
        set({ isLoading: false, authError: friendlyMessage });
        return false;
      }

      if (!authData.user) {
        set({ isLoading: false, authError: 'Login failed. Please try again.' });
        return false;
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        set({ isLoading: false, authError: 'Failed to load user profile.' });
        return false;
      }

      const { data: addresses } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', authData.user.id);

      const { data: paymentMethods } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', authData.user.id);

      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      const user: User = {
        id: profile.id,
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        avatar: profile.avatar || '',
        addresses: addresses || [],
        paymentMethods: paymentMethods || [],
        preferences: preferences || {
          dietaryRestrictions: [],
          notificationsEnabled: true,
          defaultPaymentMethodId: undefined,
          defaultAddressId: undefined,
        },
        totalOrders: profile.totalOrders || 0,
        joinedDate: profile.joinedDate ? new Date(profile.joinedDate) : new Date(),
      };

      set({ user, isAuthenticated: true, isLoading: false, authError: null });
      return true;
    } catch (error) {
      set({ isLoading: false, authError: 'An unexpected error occurred. Please try again.' });
      return false;
    }
  },

  signup: async (data: { name: string; email: string; password: string; phone: string }) => {
    set({ isLoading: true, authError: null });

    try {
      if (!data.name || data.name.length < 2) {
        set({ isLoading: false, authError: 'Please enter a valid name.' });
        return false;
      }

      if (!data.email || !data.email.includes('@')) {
        set({ isLoading: false, authError: 'Please enter a valid email address.' });
        return false;
      }

      if (!data.password || data.password.length < 6) {
        set({ isLoading: false, authError: 'Password must be at least 6 characters.' });
        return false;
      }

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            phone: data.phone,
          },
        },
      });

      if (error) {
        let friendlyMessage = 'Failed to create account. Please try again.';
        if (error.message.includes('already registered')) {
          friendlyMessage = 'An account with this email already exists.';
        } else if (error.message.includes('Password')) {
          friendlyMessage = 'Password must be at least 6 characters.';
        }
        set({ isLoading: false, authError: friendlyMessage });
        return false;
      }

      if (!authData.user) {
        set({ isLoading: false, authError: 'Failed to create account. Please try again.' });
        return false;
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        set({ isLoading: false, authError: 'Failed to load user profile.' });
        return false;
      }

      const user: User = mapDatabaseUserToUser(profile);
      user.addresses = [];
      user.paymentMethods = [];

      set({ user, isAuthenticated: true, isLoading: false, authError: null });
      return true;
    } catch (error) {
      set({ isLoading: false, authError: 'Failed to create account. Please try again.' });
      return false;
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
      set({ user: null, isAuthenticated: false, isLoading: false, authError: null });
    } catch (error) {
      set({ authError: 'Failed to logout. Please try again.' });
    }
  },

  initializeAuth: async () => {
    set({ isLoading: true });

    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData.session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', sessionData.session.user.id)
          .single();

        if (profile) {
          const { data: addresses } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', sessionData.session.user.id);

          const { data: paymentMethods } = await supabase
            .from('payment_methods')
            .select('*')
            .eq('user_id', sessionData.session.user.id);

          const { data: preferences } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', sessionData.session.user.id)
            .single();

          const user: User = {
            id: profile.id,
            name: profile.name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            avatar: profile.avatar || '',
            addresses: addresses || [],
            paymentMethods: paymentMethods || [],
            preferences: preferences || {
              dietaryRestrictions: [],
              notificationsEnabled: true,
              defaultPaymentMethodId: undefined,
              defaultAddressId: undefined,
            },
            totalOrders: profile.totalOrders || 0,
            joinedDate: profile.joinedDate ? new Date(profile.joinedDate) : new Date(),
          };

          set({ user, isAuthenticated: true, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }

      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          set({ user: null, isAuthenticated: false });
        } else if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            const { data: addresses } = await supabase
              .from('addresses')
              .select('*')
              .eq('user_id', session.user.id);

            const { data: paymentMethods } = await supabase
              .from('payment_methods')
              .select('*')
              .eq('user_id', session.user.id);

            const { data: preferences } = await supabase
              .from('user_preferences')
              .select('*')
              .eq('user_id', session.user.id)
              .single();

            const user: User = {
              id: profile.id,
              name: profile.name || '',
              email: profile.email || '',
              phone: profile.phone || '',
              avatar: profile.avatar || '',
              addresses: addresses || [],
              paymentMethods: paymentMethods || [],
              preferences: preferences || {
                dietaryRestrictions: [],
                notificationsEnabled: true,
                defaultPaymentMethodId: undefined,
                defaultAddressId: undefined,
              },
              totalOrders: profile.totalOrders || 0,
              joinedDate: profile.joinedDate ? new Date(profile.joinedDate) : new Date(),
            };

            set({ user, isAuthenticated: true });
          }
        }
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  updateUser: async (updates) => {
    const { user } = get();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      set({ user: { ...user, ...updates } });
    } catch (error) {
      set({ authError: 'Failed to update profile. Please try again.' });
    }
  },

  addAddress: async (address) => {
    const { user } = get();
    if (!user) return;

    try {
      const { data: newAddress, error } = await supabase
        .from('addresses')
        .insert({
          user_id: user.id,
          label: address.label,
          street: address.street,
          city: address.city,
          zipCode: address.zipCode,
          lat: address.lat,
          lng: address.lng,
          isDefault: address.isDefault || false,
        })
        .select()
        .single();

      if (error) throw error;

      set({
        user: {
          ...user,
          addresses: [...user.addresses, newAddress],
        },
      });
    } catch (error) {
      set({ authError: 'Failed to add address. Please try again.' });
    }
  },

  removeAddress: async (addressId) => {
    const { user } = get();
    if (!user) return;

    try {
      const { error } = await supabase.from('addresses').delete().eq('id', addressId);

      if (error) throw error;

      set({
        user: {
          ...user,
          addresses: user.addresses.filter((a) => a.id !== addressId),
        },
      });
    } catch (error) {
      set({ authError: 'Failed to remove address. Please try again.' });
    }
  },

  setDefaultAddress: async (addressId) => {
    const { user } = get();
    if (!user) return;

    try {
      const { error: updateError } = await supabase
        .from('addresses')
        .update({ isDefault: true })
        .eq('id', addressId);

      if (updateError) throw updateError;

      const { error: resetError } = await supabase
        .from('addresses')
        .update({ isDefault: false })
        .eq('user_id', user.id)
        .neq('id', addressId);

      if (resetError) throw resetError;

      const { error: prefError } = await supabase
        .from('user_preferences')
        .update({ defaultAddressId: addressId })
        .eq('user_id', user.id);

      if (prefError) throw prefError;

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
    } catch (error) {
      set({ authError: 'Failed to set default address. Please try again.' });
    }
  },

  addPaymentMethod: async (method) => {
    const { user } = get();
    if (!user) return;

    try {
      const { data: newMethod, error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: user.id,
          type: method.type,
          label: method.label,
          lastFour: method.lastFour,
          expiryDate: method.expiryDate,
          isDefault: method.isDefault || false,
        })
        .select()
        .single();

      if (error) throw error;

      set({
        user: {
          ...user,
          paymentMethods: [...user.paymentMethods, newMethod],
        },
      });
    } catch (error) {
      set({ authError: 'Failed to add payment method. Please try again.' });
    }
  },

  removePaymentMethod: async (methodId) => {
    const { user } = get();
    if (!user) return;

    try {
      const { error } = await supabase.from('payment_methods').delete().eq('id', methodId);

      if (error) throw error;

      set({
        user: {
          ...user,
          paymentMethods: user.paymentMethods.filter((p) => p.id !== methodId),
        },
      });
    } catch (error) {
      set({ authError: 'Failed to remove payment method. Please try again.' });
    }
  },

  setDefaultPaymentMethod: async (methodId) => {
    const { user } = get();
    if (!user) return;

    try {
      const { error: updateError } = await supabase
        .from('payment_methods')
        .update({ isDefault: true })
        .eq('id', methodId);

      if (updateError) throw updateError;

      const { error: resetError } = await supabase
        .from('payment_methods')
        .update({ isDefault: false })
        .eq('user_id', user.id)
        .neq('id', methodId);

      if (resetError) throw resetError;

      const { error: prefError } = await supabase
        .from('user_preferences')
        .update({ defaultPaymentMethodId: methodId })
        .eq('user_id', user.id);

      if (prefError) throw prefError;

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
    } catch (error) {
      set({ authError: 'Failed to set default payment method. Please try again.' });
    }
  },
}));