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
import { useTranslation } from '@/hooks/useTranslation';

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslation();

  const [paymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'pm-001',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    },
    {
      id: 'pm-002',
      type: 'card',
      last4: '5555',
      brand: 'Mastercard',
      expiryMonth: 8,
      expiryYear: 2026,
      isDefault: false,
    },
  ]);

  const handleAddCard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Add Card', 'This will open a card input form');
  };

  const handleDeleteCard = (method: PaymentMethod) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Delete Card',
      `Are you sure you want to delete ${method.brand} ending in ${method.last4}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Card deleted');
          },
        },
      ]
    );
  };

  const handleSetDefault = (method: PaymentMethod) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Success', `${method.brand} ending in ${method.last4} set as default`);
  };

  const getCardIcon = (brand?: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return 'card';
      case 'mastercard':
        return 'card';
      case 'amex':
        return 'card';
      default:
        return 'card-outline';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Payment Methods</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Add New Card Button */}
        <Pressable
          onPress={handleAddCard}
          style={[styles.addButton, { backgroundColor: theme.primary }]}
        >
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add New Card</Text>
        </Pressable>

        {/* Payment Methods List */}
        <View style={styles.methodsList}>
          {paymentMethods.map((method) => (
            <View
              key={method.id}
              style={[
                styles.methodCard,
                {
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: method.isDefault ? theme.primary : theme.border,
                  borderWidth: method.isDefault ? 2 : 1,
                },
              ]}
            >
              <View style={styles.methodHeader}>
                <View style={styles.methodInfo}>
                  <View style={[styles.cardIcon, { backgroundColor: theme.primary + '20' }]}>
                    <Ionicons name={getCardIcon(method.brand)} size={24} color={theme.primary} />
                  </View>
                  <View>
                    <Text style={[styles.methodBrand, { color: theme.text }]}>
                      {method.brand}
                    </Text>
                    <Text style={[styles.methodNumber, { color: theme.textSecondary }]}>
                      •••• {method.last4}
                    </Text>
                  </View>
                </View>
                {method.isDefault && (
                  <View style={[styles.defaultBadge, { backgroundColor: theme.primary }]}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
              </View>

              <Text style={[styles.expiryText, { color: theme.textSecondary }]}>
                Expires {method.expiryMonth}/{method.expiryYear}
              </Text>

              <View style={styles.methodActions}>
                {!method.isDefault && (
                  <Pressable
                    onPress={() => handleSetDefault(method)}
                    style={[styles.actionButton, { borderColor: theme.border }]}
                  >
                    <Text style={[styles.actionButtonText, { color: theme.primary }]}>
                      Set as Default
                    </Text>
                  </Pressable>
                )}
                <Pressable
                  onPress={() => handleDeleteCard(method)}
                  style={[styles.actionButton, { borderColor: theme.border }]}
                >
                  <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Remove</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {/* Other Payment Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Other Payment Options</Text>
          
          <Pressable
            style={[styles.optionCard, { backgroundColor: theme.backgroundSecondary }]}
            onPress={() => Alert.alert('PayPal', 'Link PayPal account')}
          >
            <View style={styles.optionInfo}>
              <View style={[styles.optionIcon, { backgroundColor: '#0070ba20' }]}>
                <Ionicons name="logo-paypal" size={24} color="#0070ba" />
              </View>
              <Text style={[styles.optionText, { color: theme.text }]}>PayPal</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
          </Pressable>

          <Pressable
            style={[styles.optionCard, { backgroundColor: theme.backgroundSecondary }]}
            onPress={() => Alert.alert('Apple Pay', 'Set up Apple Pay')}
          >
            <View style={styles.optionInfo}>
              <View style={[styles.optionIcon, { backgroundColor: '#00000020' }]}>
                <Ionicons name="logo-apple" size={24} color="#000" />
              </View>
              <Text style={[styles.optionText, { color: theme.text }]}>Apple Pay</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
          </Pressable>

          <Pressable
            style={[styles.optionCard, { backgroundColor: theme.backgroundSecondary }]}
            onPress={() => Alert.alert('Google Pay', 'Set up Google Pay')}
          >
            <View style={styles.optionInfo}>
              <View style={[styles.optionIcon, { backgroundColor: '#4285f420' }]}>
                <Ionicons name="logo-google" size={24} color="#4285f4" />
              </View>
              <Text style={[styles.optionText, { color: theme.text }]}>Google Pay</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
          </Pressable>
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
  methodsList: {
    gap: 16,
    marginBottom: 32,
  },
  methodCard: {
    padding: 16,
    borderRadius: 12,
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodBrand: {
    fontSize: 16,
    fontWeight: '600',
  },
  methodNumber: {
    fontSize: 14,
    marginTop: 2,
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
  expiryText: {
    fontSize: 13,
    marginBottom: 16,
  },
  methodActions: {
    flexDirection: 'row',
    gap: 12,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
