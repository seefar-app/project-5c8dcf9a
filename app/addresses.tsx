import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { Address } from '@/types';

export default function AddressesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslation();
  const { user, updateUser } = useAuthStore();

  const addresses: Address[] = [
    {
      id: 'addr-001',
      label: 'Home',
      street: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA',
      isDefault: true,
      coordinates: { lat: 37.7749, lng: -122.4194 },
    },
    {
      id: 'addr-002',
      label: 'Work',
      street: '456 Market Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94103',
      country: 'USA',
      isDefault: false,
      coordinates: { lat: 37.7849, lng: -122.4094 },
    },
  ];

  const handleAddAddress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Add Address', 'This feature will open an address form');
  };

  const handleEditAddress = (address: Address) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Edit Address', `Edit ${address.label}`);
  };

  const handleDeleteAddress = (address: Address) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete ${address.label}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Delete logic here
            Alert.alert('Success', 'Address deleted');
          },
        },
      ]
    );
  };

  const handleSetDefault = (address: Address) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Success', `${address.label} set as default address`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Delivery Addresses</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Add New Address Button */}
        <Pressable
          onPress={handleAddAddress}
          style={[styles.addButton, { backgroundColor: theme.primary }]}
        >
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add New Address</Text>
        </Pressable>

        {/* Address List */}
        <View style={styles.addressList}>
          {addresses.map((address) => (
            <View
              key={address.id}
              style={[
                styles.addressCard,
                {
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: address.isDefault ? theme.primary : theme.border,
                  borderWidth: address.isDefault ? 2 : 1,
                },
              ]}
            >
              <View style={styles.addressHeader}>
                <View style={styles.addressLabelContainer}>
                  <Ionicons
                    name={address.label === 'Home' ? 'home' : 'briefcase'}
                    size={20}
                    color={theme.primary}
                  />
                  <Text style={[styles.addressLabel, { color: theme.text }]}>{address.label}</Text>
                  {address.isDefault && (
                    <View style={[styles.defaultBadge, { backgroundColor: theme.primary }]}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                </View>
                <Pressable onPress={() => handleEditAddress(address)}>
                  <Ionicons name="pencil" size={20} color={theme.textSecondary} />
                </Pressable>
              </View>

              <Text style={[styles.addressText, { color: theme.textSecondary }]}>
                {address.street}
              </Text>
              <Text style={[styles.addressText, { color: theme.textSecondary }]}>
                {address.city}, {address.state} {address.zipCode}
              </Text>
              <Text style={[styles.addressText, { color: theme.textSecondary }]}>
                {address.country}
              </Text>

              <View style={styles.addressActions}>
                {!address.isDefault && (
                  <Pressable
                    onPress={() => handleSetDefault(address)}
                    style={[styles.actionButton, { borderColor: theme.border }]}
                  >
                    <Text style={[styles.actionButtonText, { color: theme.primary }]}>
                      Set as Default
                    </Text>
                  </Pressable>
                )}
                <Pressable
                  onPress={() => handleDeleteAddress(address)}
                  style={[styles.actionButton, { borderColor: theme.border }]}
                >
                  <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addressList: {
    gap: 16,
  },
  addressCard: {
    padding: 16,
    borderRadius: 12,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  defaultBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
