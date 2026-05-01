import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store/useStore';
import { useAuthStore } from '@/store/useAuthStore';
import { CartItem } from '@/components/shared/CartItem';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Shadows } from '@/constants/Colors';

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { user } = useAuthStore();
  const {
    cart,
    selectedRestaurant,
    getCartTotal,
    appliedPromo,
    applyPromo,
    removePromo,
    createOrder,
    clearCart,
  } = useStore();

  const [promoCode, setPromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    user?.paymentMethods.find((pm) => pm.isDefault)?.id || user?.paymentMethods[0]?.id || ''
  );
  const [selectedAddress, setSelectedAddress] = useState(
    user?.addresses.find((addr) => addr.isDefault) || user?.addresses[0]
  );

  const totals = getCartTotal();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedRestaurant) {
      router.push(`/restaurant/${selectedRestaurant.id}`);
    } else {
      router.push('/(tabs)');
    }
  };

  const handleApplyPromo = () => {
    setIsApplyingPromo(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const success = applyPromo(promoCode);
    
    if (success) {
      Alert.alert('Success', 'Promo code applied!');
      setPromoCode('');
    } else {
      Alert.alert('Error', 'Invalid or expired promo code');
    }
    
    setIsApplyingPromo(false);
  };

  const handleRemovePromo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    removePromo();
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    setIsPlacingOrder(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const order = await createOrder(selectedAddress, selectedPaymentMethod);
      clearCart();
      
      Alert.alert(
        'Order Placed!',
        'Your order has been placed successfully.',
        [
          {
            text: 'Track Order',
            onPress: () => router.replace(`/order/${order.id}`),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cart.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Checkout</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color={theme.textTertiary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Your cart is empty</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Add items to your cart to continue
          </Text>
          <Button
            title="Browse Restaurants"
            onPress={() => router.push('/(tabs)')}
            style={{ marginTop: 24 }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: theme.card }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Restaurant Info */}
        {selectedRestaurant && (
          <View style={[styles.section, { backgroundColor: theme.card }, Shadows.sm]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="restaurant" size={20} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {selectedRestaurant.name}
              </Text>
            </View>
            <Text style={[styles.restaurantCuisine, { color: theme.textSecondary }]}>
              {selectedRestaurant.cuisine.join(' • ')}
            </Text>
            <View style={styles.restaurantMeta}>
              <View style={styles.restaurantMetaItem}>
                <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
                <Text style={[styles.restaurantMetaText, { color: theme.textSecondary }]}>
                  {selectedRestaurant.deliveryTime}
                </Text>
              </View>
              <View style={styles.restaurantMetaItem}>
                <Ionicons name="location-outline" size={14} color={theme.textSecondary} />
                <Text style={[styles.restaurantMetaText, { color: theme.textSecondary }]}>
                  {selectedRestaurant.distance}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Cart Items */}
        <View style={[styles.section, { backgroundColor: theme.card }, Shadows.sm]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cart" size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Order</Text>
            <Badge label={cart.length.toString()} variant="primary" size="sm" />
          </View>
          {cart.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </View>

        {/* Delivery Address */}
        <View style={[styles.section, { backgroundColor: theme.card }, Shadows.sm]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Delivery Address</Text>
          </View>
          {selectedAddress ? (
            <View style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <Text style={[styles.addressLabel, { color: theme.text }]}>
                  {selectedAddress.label}
                </Text>
                {selectedAddress.isDefault && (
                  <Badge label="Default" variant="secondary" size="sm" />
                )}
              </View>
              <Text style={[styles.addressText, { color: theme.textSecondary }]}>
                {selectedAddress.street}
              </Text>
              <Text style={[styles.addressText, { color: theme.textSecondary }]}>
                {selectedAddress.city}, {selectedAddress.zipCode}
              </Text>
            </View>
          ) : (
            <Text style={[styles.noDataText, { color: theme.textSecondary }]}>
              No address selected
            </Text>
          )}
          <Pressable style={styles.changeButton}>
            <Text style={[styles.changeButtonText, { color: theme.primary }]}>
              Change Address
            </Text>
          </Pressable>
        </View>

        {/* Payment Method */}
        <View style={[styles.section, { backgroundColor: theme.card }, Shadows.sm]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card" size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Payment Method</Text>
          </View>
          {user?.paymentMethods.map((method) => (
            <Pressable
              key={method.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedPaymentMethod(method.id);
              }}
              style={[
                styles.paymentMethod,
                selectedPaymentMethod === method.id && {
                  borderColor: theme.primary,
                  borderWidth: 2,
                },
              ]}
            >
              <View style={styles.paymentMethodLeft}>
                <Ionicons
                  name={
                    method.type === 'card'
                      ? 'card'
                      : method.type === 'cash'
                      ? 'cash'
                      : 'wallet'
                  }
                  size={24}
                  color={theme.text}
                />
                <View style={styles.paymentMethodInfo}>
                  <Text style={[styles.paymentMethodLabel, { color: theme.text }]}>
                    {method.label}
                  </Text>
                  {method.lastFour && (
                    <Text style={[styles.paymentMethodDetails, { color: theme.textSecondary }]}>
                      •••• {method.lastFour}
                    </Text>
                  )}
                </View>
              </View>
              {selectedPaymentMethod === method.id && (
                <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
              )}
            </Pressable>
          ))}
        </View>

        {/* Promo Code */}
        <View style={[styles.section, { backgroundColor: theme.card }, Shadows.sm]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pricetag" size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Promo Code</Text>
          </View>
          {appliedPromo ? (
            <View style={[styles.appliedPromo, { backgroundColor: theme.secondary }]}>
              <View style={styles.appliedPromoLeft}>
                <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
                <View style={styles.appliedPromoInfo}>
                  <Text style={[styles.appliedPromoCode, { color: theme.text }]}>
                    {appliedPromo.code}
                  </Text>
                  <Text style={[styles.appliedPromoDesc, { color: theme.textSecondary }]}>
                    {appliedPromo.description}
                  </Text>
                </View>
              </View>
              <Pressable onPress={handleRemovePromo}>
                <Ionicons name="close-circle" size={24} color={theme.textSecondary} />
              </Pressable>
            </View>
          ) : (
            <View style={styles.promoInput}>
              <TextInput
                style={[
                  styles.promoInputField,
                  { color: theme.text, backgroundColor: theme.background },
                ]}
                placeholder="Enter promo code"
                placeholderTextColor={theme.textTertiary}
                value={promoCode}
                onChangeText={setPromoCode}
                autoCapitalize="characters"
              />
              <Button
                title="Apply"
                onPress={handleApplyPromo}
                size="sm"
                loading={isApplyingPromo}
                disabled={!promoCode.trim() || isApplyingPromo}
              />
            </View>
          )}
        </View>

        {/* Order Summary */}
        <View style={[styles.section, { backgroundColor: theme.card }, Shadows.sm]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt" size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Summary</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Subtotal</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>
              ${totals.subtotal.toFixed(2)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Delivery Fee</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>
              ${totals.deliveryFee.toFixed(2)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Tax</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>
              ${totals.tax.toFixed(2)}
            </Text>
          </View>

          {totals.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.primary }]}>Discount</Text>
              <Text style={[styles.summaryValue, { color: theme.primary }]}>
                -${totals.discount.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryTotal, { color: theme.text }]}>Total</Text>
            <Text style={[styles.summaryTotal, { color: theme.primary }]}>
              ${totals.total.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + 16, backgroundColor: theme.card },
        ]}
      >
        <Button
          title={`Place Order • $${totals.total.toFixed(2)}`}
          onPress={handlePlaceOrder}
          size="lg"
          fullWidth
          loading={isPlacingOrder}
          disabled={isPlacingOrder}
        />
      </View>
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
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  restaurantCuisine: {
    fontSize: 14,
    marginBottom: 8,
  },
  restaurantMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  restaurantMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  restaurantMetaText: {
    fontSize: 13,
  },
  addressCard: {
    marginBottom: 12,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
  },
  noDataText: {
    fontSize: 14,
    marginBottom: 12,
  },
  changeButton: {
    paddingVertical: 8,
  },
  changeButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentMethodInfo: {
    gap: 2,
  },
  paymentMethodLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  paymentMethodDetails: {
    fontSize: 13,
  },
  appliedPromo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
  },
  appliedPromoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  appliedPromoInfo: {
    flex: 1,
  },
  appliedPromoCode: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  appliedPromoDesc: {
    fontSize: 13,
  },
  promoInput: {
    flexDirection: 'row',
    gap: 8,
  },
  promoInputField: {
    flex: 1,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    marginVertical: 12,
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
});
