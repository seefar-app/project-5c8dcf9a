import React from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useTheme } from '@/hooks/useTheme';
import { Shadows } from '@/constants/Colors';
import { Badge } from '@/components/ui/Badge';
import { StatusIndicator } from './StatusIndicator';
import type { Order, OrderStatus } from '@/types';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
}

const getStatusConfig = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return { label: 'Pending', variant: 'warning' as const, isActive: true };
    case 'confirmed':
      return { label: 'Confirmed', variant: 'info' as const, isActive: true };
    case 'preparing':
      return { label: 'Preparing', variant: 'info' as const, isActive: true };
    case 'ready_for_pickup':
      return { label: 'Ready', variant: 'primary' as const, isActive: true };
    case 'on_the_way':
      return { label: 'On the Way', variant: 'primary' as const, isActive: true };
    case 'arriving_soon':
      return { label: 'Arriving Soon', variant: 'success' as const, isActive: true };
    case 'delivered':
      return { label: 'Delivered', variant: 'success' as const, isActive: false };
    case 'cancelled':
      return { label: 'Cancelled', variant: 'error' as const, isActive: false };
    case 'refunded':
      return { label: 'Refunded', variant: 'error' as const, isActive: false };
    default:
      return { label: 'Unknown', variant: 'default' as const, isActive: false };
  }
};

export function OrderCard({ order, onPress }: OrderCardProps) {
  const theme = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const statusConfig = getStatusConfig(order.status);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  const isActive = ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'on_the_way', 'arriving_soon'].includes(order.status);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.container,
          { backgroundColor: theme.card },
          isActive && { borderColor: theme.primary, borderWidth: 2 },
          Shadows.md,
        ]}
      >
        <View style={styles.header}>
          <View style={styles.restaurantInfo}>
            <Image
              source={{ uri: order.restaurant.image }}
              style={styles.restaurantImage}
              contentFit="cover"
            />
            <View style={styles.restaurantText}>
              <Text style={[styles.restaurantName, { color: theme.text }]} numberOfLines={1}>
                {order.restaurant.name}
              </Text>
              <Text style={[styles.orderDate, { color: theme.textSecondary }]}>
                {format(new Date(order.createdAt), 'MMM d, h:mm a')}
              </Text>
            </View>
          </View>
          <View style={styles.statusContainer}>
            {statusConfig.isActive && (
              <StatusIndicator isActive size="sm" />
            )}
            <Badge label={statusConfig.label} variant={statusConfig.variant} size="sm" />
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.itemsPreview}>
          <Text style={[styles.itemsText, { color: theme.textSecondary }]} numberOfLines={1}>
            {order.items.map((item) => `${item.quantity}x ${item.menuItem.name}`).join(', ')}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.total, { color: theme.text }]}>
            ${order.total.toFixed(2)}
          </Text>
          <View style={styles.actionButton}>
            <Text style={[styles.actionText, { color: theme.primary }]}>
              {isActive ? 'Track Order' : 'View Details'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={theme.primary} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  restaurantInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  restaurantImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  restaurantText: {
    marginLeft: 12,
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 13,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  itemsPreview: {},
  itemsText: {
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  total: {
    fontSize: 18,
    fontWeight: '700',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
});