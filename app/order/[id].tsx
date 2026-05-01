import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { StatusIndicator } from '@/components/shared/StatusIndicator';
import { Shadows } from '@/constants/Colors';
import type { Order, OrderStatus } from '@/types';

const { width } = Dimensions.get('window');

const ORDER_STATUS_STEPS: { status: OrderStatus; label: string; icon: string }[] = [
  { status: 'confirmed', label: 'Order Confirmed', icon: 'checkmark-circle' },
  { status: 'preparing', label: 'Preparing', icon: 'restaurant' },
  { status: 'ready_for_pickup', label: 'Ready for Pickup', icon: 'bag-check' },
  { status: 'on_the_way', label: 'On the Way', icon: 'bicycle' },
  { status: 'delivered', label: 'Delivered', icon: 'home' },
];

export default function OrderTrackingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { orders, setActiveOrder } = useStore();
  
  const [order, setOrder] = useState<Order | null>(null);
  const mapRef = useRef<MapView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (id) {
      const foundOrder = orders.find((o) => o.id === id);
      if (foundOrder) {
        setOrder(foundOrder);
        setActiveOrder(foundOrder);
      }
    }
  }, [id, orders]);

  useEffect(() => {
    // Pulse animation for active status
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/orders');
  };

  const handleCallDriver = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // In a real app, this would initiate a phone call
    console.log('Call driver');
  };

  const handleMessageDriver = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // In a real app, this would open a chat
    console.log('Message driver');
  };

  const handleCancelOrder = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // In a real app, this would show a confirmation dialog
    console.log('Cancel order');
  };

  if (!order) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Order Tracking</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color={theme.textTertiary} />
          <Text style={[styles.emptyText, { color: theme.text }]}>Order not found</Text>
        </View>
      </View>
    );
  }

  const currentStepIndex = ORDER_STATUS_STEPS.findIndex((step) => step.status === order.status);
  const isDelivered = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: theme.card }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Order #{order.id.slice(0, 8)}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Map */}
        {!isDelivered && !isCancelled && order.deliveryLocation && (
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={{
                latitude: order.deliveryLocation.latitude,
                longitude: order.deliveryLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              {/* Restaurant Marker */}
              <Marker
                coordinate={{
                  latitude: order.restaurant.location.latitude,
                  longitude: order.restaurant.location.longitude,
                }}
                title={order.restaurant.name}
              >
                <View style={[styles.markerContainer, { backgroundColor: theme.primary }]}>
                  <Ionicons name="restaurant" size={20} color="#ffffff" />
                </View>
              </Marker>

              {/* Delivery Location Marker */}
              <Marker
                coordinate={{
                  latitude: order.deliveryLocation.latitude,
                  longitude: order.deliveryLocation.longitude,
                }}
                title="Delivery Location"
              >
                <View style={[styles.markerContainer, { backgroundColor: '#ef4444' }]}>
                  <Ionicons name="home" size={20} color="#ffffff" />
                </View>
              </Marker>

              {/* Driver Marker (if on the way) */}
              {order.status === 'on_the_way' && order.driver && (
                <Marker
                  coordinate={{
                    latitude: order.deliveryLocation.latitude + 0.002,
                    longitude: order.deliveryLocation.longitude + 0.002,
                  }}
                  title={order.driver.name}
                >
                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <View style={[styles.driverMarker, { backgroundColor: theme.primary }]}>
                      <Ionicons name="bicycle" size={24} color="#ffffff" />
                    </View>
                  </Animated.View>
                </Marker>
              )}

              {/* Route Polyline */}
              <Polyline
                coordinates={[
                  {
                    latitude: order.restaurant.location.latitude,
                    longitude: order.restaurant.location.longitude,
                  },
                  {
                    latitude: order.deliveryLocation.latitude,
                    longitude: order.deliveryLocation.longitude,
                  },
                ]}
                strokeColor={theme.primary}
                strokeWidth={3}
                lineDashPattern={[10, 5]}
              />
            </MapView>
          </View>
        )}

        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: theme.card }, Shadows.md]}>
          <View style={styles.statusHeader}>
            <View style={styles.statusHeaderLeft}>
              <StatusIndicator status={order.status} />
              <View>
                <Text style={[styles.statusTitle, { color: theme.text }]}>
                  {isCancelled
                    ? 'Order Cancelled'
                    : isDelivered
                    ? 'Order Delivered'
                    : ORDER_STATUS_STEPS[currentStepIndex]?.label || 'Processing'}
                </Text>
                <Text style={[styles.statusTime, { color: theme.textSecondary }]}>
                  {order.estimatedDeliveryTime}
                </Text>
              </View>
            </View>
            <Badge
              label={order.status.replace('_', ' ')}
              variant={
                isCancelled
                  ? 'error'
                  : isDelivered
                  ? 'success'
                  : order.status === 'on_the_way'
                  ? 'warning'
                  : 'info'
              }
            />
          </View>

          {/* Progress Steps */}
          {!isCancelled && (
            <View style={styles.progressContainer}>
              {ORDER_STATUS_STEPS.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isLast = index === ORDER_STATUS_STEPS.length - 1;

                return (
                  <View key={step.status} style={styles.progressStep}>
                    <View style={styles.progressStepLeft}>
                      <View
                        style={[
                          styles.progressStepIcon,
                          isCompleted
                            ? { backgroundColor: theme.primary }
                            : { backgroundColor: theme.border },
                        ]}
                      >
                        <Ionicons
                          name={step.icon as any}
                          size={20}
                          color={isCompleted ? '#ffffff' : theme.textTertiary}
                        />
                      </View>
                      {!isLast && (
                        <View
                          style={[
                            styles.progressStepLine,
                            isCompleted
                              ? { backgroundColor: theme.primary }
                              : { backgroundColor: theme.border },
                          ]}
                        />
                      )}
                    </View>
                    <View style={styles.progressStepContent}>
                      <Text
                        style={[
                          styles.progressStepLabel,
                          isCompleted ? { color: theme.text } : { color: theme.textTertiary },
                          isCurrent && { fontWeight: '700' },
                        ]}
                      >
                        {step.label}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Driver Info */}
        {order.driver && order.status === 'on_the_way' && (
          <View style={[styles.driverCard, { backgroundColor: theme.card }, Shadows.sm]}>
            <View style={styles.driverInfo}>
              <Avatar source={order.driver.avatar} name={order.driver.name} size="lg" />
              <View style={styles.driverDetails}>
                <Text style={[styles.driverName, { color: theme.text }]}>{order.driver.name}</Text>
                <View style={styles.driverMeta}>
                  <Ionicons name="star" size={14} color="#f59e0b" />
                  <Text style={[styles.driverRating, { color: theme.textSecondary }]}>
                    {order.driver.rating}
                  </Text>
                  <Text style={[styles.driverVehicle, { color: theme.textTertiary }]}>
                    • {order.driver.vehicle}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.driverActions}>
              <Pressable
                onPress={handleCallDriver}
                style={[styles.driverActionButton, { backgroundColor: theme.primary }]}
              >
                <Ionicons name="call" size={20} color="#ffffff" />
              </Pressable>
              <Pressable
                onPress={handleMessageDriver}
                style={[styles.driverActionButton, { backgroundColor: theme.secondary }]}
              >
                <Ionicons name="chatbubble" size={20} color={theme.primary} />
              </Pressable>
            </View>
          </View>
        )}

        {/* Restaurant Info */}
        <View style={[styles.restaurantCard, { backgroundColor: theme.card }, Shadows.sm]}>
          <View style={styles.restaurantHeader}>
            <Image source={{ uri: order.restaurant.image }} style={styles.restaurantImage} />
            <View style={styles.restaurantInfo}>
              <Text style={[styles.restaurantName, { color: theme.text }]}>
                {order.restaurant.name}
              </Text>
              <Text style={[styles.restaurantCuisine, { color: theme.textSecondary }]}>
                {order.restaurant.cuisine.join(' • ')}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={[styles.itemsCard, { backgroundColor: theme.card }, Shadows.sm]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Items</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.orderItemLeft}>
                <Text style={[styles.orderItemQuantity, { color: theme.textSecondary }]}>
                  {item.quantity}x
                </Text>
                <View>
                  <Text style={[styles.orderItemName, { color: theme.text }]}>{item.name}</Text>
                  {item.customizations && item.customizations.length > 0 && (
                    <Text style={[styles.orderItemCustomizations, { color: theme.textTertiary }]}>
                      {item.customizations.join(', ')}
                    </Text>
                  )}
                </View>
              </View>
              <Text style={[styles.orderItemPrice, { color: theme.text }]}>
                ${item.totalPrice.toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={[styles.itemsDivider, { backgroundColor: theme.border }]} />

          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Subtotal</Text>
            <Text style={[styles.totalValue, { color: theme.text }]}>
              ${order.subtotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Delivery Fee</Text>
            <Text style={[styles.totalValue, { color: theme.text }]}>
              ${order.deliveryFee.toFixed(2)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Tax</Text>
            <Text style={[styles.totalValue, { color: theme.text }]}>
              ${order.tax.toFixed(2)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabelBold, { color: theme.text }]}>Total</Text>
            <Text style={[styles.totalValueBold, { color: theme.primary }]}>
              ${order.total.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={[styles.addressCard, { backgroundColor: theme.card }, Shadows.sm]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Delivery Address</Text>
          <View style={styles.addressContent}>
            <Ionicons name="location" size={20} color={theme.primary} />
            <View style={styles.addressText}>
              <Text style={[styles.addressLabel, { color: theme.text }]}>
                {order.deliveryAddress.label}
              </Text>
              <Text style={[styles.addressStreet, { color: theme.textSecondary }]}>
                {order.deliveryAddress.street}
              </Text>
              <Text style={[styles.addressCity, { color: theme.textSecondary }]}>
                {order.deliveryAddress.city}, {order.deliveryAddress.zipCode}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        {!isDelivered && !isCancelled && (
          <View style={styles.actions}>
            <Button
              title="Cancel Order"
              onPress={handleCancelOrder}
              variant="outline"
              fullWidth
            />
          </View>
        )}

        {isDelivered && (
          <View style={styles.actions}>
            <Button
              title="Reorder"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/restaurant/${order.restaurant.id}`);
              }}
              variant="primary"
              fullWidth
            />
          </View>
        )}
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
  },
  mapContainer: {
    height: 300,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  driverMarker: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  statusCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusTime: {
    fontSize: 14,
  },
  progressContainer: {
    gap: 0,
  },
  progressStep: {
    flexDirection: 'row',
    gap: 16,
  },
  progressStepLeft: {
    alignItems: 'center',
  },
  progressStepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStepLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  progressStepContent: {
    flex: 1,
    paddingVertical: 8,
  },
  progressStepLabel: {
    fontSize: 15,
  },
  driverCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  driverMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  driverRating: {
    fontSize: 14,
  },
  driverVehicle: {
    fontSize: 14,
  },
  driverActions: {
    flexDirection: 'row',
    gap: 8,
  },
  driverActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurantCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  restaurantHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  restaurantImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  restaurantInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 14,
  },
  itemsCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderItemLeft: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  orderItemQuantity: {
    fontSize: 15,
    fontWeight: '600',
    minWidth: 24,
  },
  orderItemName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  orderItemCustomizations: {
    fontSize: 13,
  },
  orderItemPrice: {
    fontSize: 15,
    fontWeight: '600',
  },
  itemsDivider: {
    height: 1,
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 15,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  totalLabelBold: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalValueBold: {
    fontSize: 16,
    fontWeight: '700',
  },
  addressCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  addressContent: {
    flexDirection: 'row',
    gap: 12,
  },
  addressText: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  addressStreet: {
    fontSize: 14,
    marginBottom: 2,
  },
  addressCity: {
    fontSize: 14,
  },
  actions: {
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
});
