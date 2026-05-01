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
    router.back();
  };

  const handleCallDriver = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Implement call functionality
  };

  const handleMessageDriver = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Implement messaging functionality
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed':
        return '#3b82f6';
      case 'preparing':
        return '#f59e0b';
      case 'ready_for_pickup':
        return '#8b5cf6';
      case 'on_the_way':
        return theme.primary;
      case 'delivered':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      default:
        return theme.textTertiary;
    }
  };

  const getCurrentStepIndex = () => {
    if (!order) return -1;
    return ORDER_STATUS_STEPS.findIndex((step) => step.status === order.status);
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
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Order not found
          </Text>
        </View>
      </View>
    );
  }

  const currentStepIndex = getCurrentStepIndex();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 16, backgroundColor: theme.card },
          Shadows.sm,
        ]}
      >
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Order Tracking</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Order #{order.id.slice(0, 8)}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Map */}
        {order.status === 'on_the_way' && order.deliveryPartner && (
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={{
                latitude: order.deliveryAddress.lat,
                longitude: order.deliveryAddress.lng,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
            >
              {/* Delivery Address Marker */}
              <Marker
                coordinate={{
                  latitude: order.deliveryAddress.lat,
                  longitude: order.deliveryAddress.lng,
                }}
              >
                <View style={styles.markerContainer}>
                  <Ionicons name="home" size={24} color={theme.primary} />
                </View>
              </Marker>

              {/* Driver Location Marker */}
              <Marker
                coordinate={{
                  latitude: order.deliveryPartner.currentLocation.lat,
                  longitude: order.deliveryPartner.currentLocation.lng,
                }}
              >
                <View style={styles.driverMarker}>
                  <Ionicons name="bicycle" size={20} color="#ffffff" />
                </View>
              </Marker>

              {/* Route Polyline */}
              <Polyline
                coordinates={[
                  {
                    latitude: order.deliveryPartner.currentLocation.lat,
                    longitude: order.deliveryPartner.currentLocation.lng,
                  },
                  {
                    latitude: order.deliveryAddress.lat,
                    longitude: order.deliveryAddress.lng,
                  },
                ]}
                strokeColor={theme.primary}
                strokeWidth={3}
                lineDashPattern={[5, 5]}
              />
            </MapView>
          </View>
        )}

        {/* Status Timeline */}
        <View style={[styles.section, { backgroundColor: theme.card }, Shadows.sm]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Status</Text>
            <Badge
              label={order.status.replace(/_/g, ' ')}
              variant="primary"
              size="sm"
            />
          </View>

          <View style={styles.timeline}>
            {ORDER_STATUS_STEPS.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isActive = index === currentStepIndex;
              const statusColor = getStatusColor(step.status);

              return (
                <View key={step.status} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <Animated.View
                      style={[
                        styles.timelineIcon,
                        {
                          backgroundColor: isCompleted ? statusColor : theme.border,
                          transform: isActive ? [{ scale: pulseAnim }] : [],
                        },
                      ]}
                    >
                      <Ionicons
                        name={step.icon as any}
                        size={20}
                        color={isCompleted ? '#ffffff' : theme.textTertiary}
                      />
                    </Animated.View>
                    {index < ORDER_STATUS_STEPS.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          {
                            backgroundColor: isCompleted ? statusColor : theme.border,
                          },
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text
                      style={[
                        styles.timelineLabel,
                        {
                          color: isCompleted ? theme.text : theme.textSecondary,
                          fontWeight: isActive ? '700' : '500',
                        },
                      ]}
                    >
                      {step.label}
                    </Text>
                    {isActive && (
                      <View style={styles.timelineActive}>
                        <StatusIndicator />
                        <Text style={[styles.timelineActiveText, { color: theme.textSecondary }]}>
                          In progress
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Delivery Partner Info */}
        {order.deliveryPartner && order.status === 'on_the_way' && (
          <View style={[styles.section, { backgroundColor: theme.card }, Shadows.sm]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Your Delivery Partner
              </Text>
            </View>

            <View style={styles.driverCard}>
              <Avatar
                source={{ uri: order.deliveryPartner.avatar }}
                name={order.deliveryPartner.name}
                size={60}
              />
              <View style={styles.driverInfo}>
                <Text style={[styles.driverName, { color: theme.text }]}>
                  {order.deliveryPartner.name}
                </Text>
                <View style={styles.driverMeta}>
                  <Ionicons name="star" size={14} color="#f59e0b" />
                  <Text style={[styles.driverRating, { color: theme.text }]}>
                    {order.deliveryPartner.rating}
                  </Text>
                  <Text style={[styles.driverDeliveries, { color: theme.textSecondary }]}>
                    • {order.deliveryPartner.totalDeliveries} deliveries
                  </Text>
                </View>
                <Text style={[styles.driverVehicle, { color: theme.textSecondary }]}>
                  {order.deliveryPartner.vehicle}
                </Text>
              </View>
            </View>

            <View style={styles.driverActions}>
              <Button
                label="Call"
                onPress={handleCallDriver}
                variant="outline"
                icon="call"
                style={{ flex: 1 }}
              />
              <Button
                label="Message"
                onPress={handleMessageDriver}
                variant="outline"
                icon="chatbubble"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}

        {/* Delivery Address */}
        <View style={[styles.section, { backgroundColor: theme.card }, Shadows.sm]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Delivery Address
            </Text>
          </View>
          <View style={styles.addressCard}>
            <Text style={[styles.addressLabel, { color: theme.text }]}>
              {order.deliveryAddress.label}
            </Text>
            <Text style={[styles.addressText, { color: theme.textSecondary }]}>
              {order.deliveryAddress.street}
            </Text>
            <Text style={[styles.addressText, { color: theme.textSecondary }]}>
              {order.deliveryAddress.city}, {order.deliveryAddress.zipCode}
            </Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={[styles.section, { backgroundColor: theme.card }, Shadows.sm]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt" size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Items</Text>
            <Badge label={order.items.length.toString()} variant="secondary" size="sm" />
          </View>

          {order.items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Image
                source={{ uri: item.menuItem.image }}
                style={styles.orderItemImage}
                contentFit="cover"
              />
              <View style={styles.orderItemInfo}>
                <Text style={[styles.orderItemName, { color: theme.text }]}>
                  {item.menuItem.name}
                </Text>
                <Text style={[styles.orderItemQuantity, { color: theme.textSecondary }]}>
                  Qty: {item.quantity}
                </Text>
              </View>
              <Text style={[styles.orderItemPrice, { color: theme.text }]}>
                ${item.totalPrice.toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={[styles.orderDivider, { backgroundColor: theme.border }]} />

          <View style={styles.orderSummary}>
            <View style={styles.orderSummaryRow}>
              <Text style={[styles.orderSummaryLabel, { color: theme.textSecondary }]}>
                Subtotal
              </Text>
              <Text style={[styles.orderSummaryValue, { color: theme.text }]}>
                ${order.subtotal.toFixed(2)}
              </Text>
            </View>
            <View style={styles.orderSummaryRow}>
              <Text style={[styles.orderSummaryLabel, { color: theme.textSecondary }]}>
                Delivery Fee
              </Text>
              <Text style={[styles.orderSummaryValue, { color: theme.text }]}>
                ${order.deliveryFee.toFixed(2)}
              </Text>
            </View>
            <View style={styles.orderSummaryRow}>
              <Text style={[styles.orderSummaryLabel, { color: theme.textSecondary }]}>
                Tax
              </Text>
              <Text style={[styles.orderSummaryValue, { color: theme.text }]}>
                ${order.tax.toFixed(2)}
              </Text>
            </View>
            {order.discount > 0 && (
              <View style={styles.orderSummaryRow}>
                <Text style={[styles.orderSummaryLabel, { color: theme.primary }]}>
                  Discount
                </Text>
                <Text style={[styles.orderSummaryValue, { color: theme.primary }]}>
                  -${order.discount.toFixed(2)}
                </Text>
              </View>
            )}
            <View style={[styles.orderDivider, { backgroundColor: theme.border }]} />
            <View style={styles.orderSummaryRow}>
              <Text style={[styles.orderSummaryTotal, { color: theme.text }]}>Total</Text>
              <Text style={[styles.orderSummaryTotal, { color: theme.text }]}>
                ${order.total.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Help Section */}
        <View style={[styles.section, { backgroundColor: theme.card }, Shadows.sm]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="help-circle" size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Need Help?</Text>
          </View>
          <Pressable style={styles.helpButton}>
            <Ionicons name="chatbubbles" size={20} color={theme.text} />
            <Text style={[styles.helpButtonText, { color: theme.text }]}>
              Contact Support
            </Text>
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
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  mapContainer: {
    height: 250,
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
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  driverMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    marginBottom: 4,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 16,
  },
  timelineLabel: {
    fontSize: 15,
    marginBottom: 4,
  },
  timelineActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  timelineActiveText: {
    fontSize: 13,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  driverInfo: {
    flex: 1,
    marginLeft: 12,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  driverMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  driverRating: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  driverDeliveries: {
    fontSize: 13,
    marginLeft: 4,
  },
  driverVehicle: {
    fontSize: 13,
  },
  driverActions: {
    flexDirection: 'row',
    gap: 12,
  },
  addressCard: {
    gap: 4,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderItemImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  orderItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  orderItemName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  orderItemQuantity: {
    fontSize: 13,
  },
  orderItemPrice: {
    fontSize: 15,
    fontWeight: '700',
  },
  orderDivider: {
    height: 1,
    marginVertical: 12,
  },
  orderSummary: {
    gap: 8,
  },
  orderSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderSummaryLabel: {
    fontSize: 15,
  },
  orderSummaryValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  orderSummaryTotal: {
    fontSize: 18,
    fontWeight: '700',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  helpButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});
