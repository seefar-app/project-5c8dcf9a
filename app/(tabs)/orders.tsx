import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useStore } from '@/store/useStore';
import { OrderCard } from '@/components/shared/OrderCard';
import { SkeletonListItem } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import type { Order } from '@/types';

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslation();
  const { orders, isLoadingOrders, fetchOrders, cart } = useStore();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, []);

  const activeOrders = orders.filter((o) =>
    ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'on_the_way', 'arriving_soon'].includes(o.status)
  );
  const pastOrders = orders.filter((o) =>
    ['delivered', 'cancelled', 'refunded'].includes(o.status)
  );

  const handleOrderPress = (order: Order) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/order/${order.id}`);
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: theme.card }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t('orders.title')}</Text>
        {cartItemCount > 0 && (
          <Pressable
            onPress={() => router.push('/checkout')}
            style={[styles.cartButton, { backgroundColor: theme.primaryLightest }]}
          >
            <Ionicons name="cart" size={20} color={theme.primary} />
            <Text style={[styles.cartText, { color: theme.primary }]}>
              {cartItemCount} {t('cart.items')}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Tab Switcher */}
      <View style={[styles.tabContainer, { backgroundColor: theme.backgroundSecondary }]}>
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            setActiveTab('active');
          }}
          style={[
            styles.tab,
            activeTab === 'active' && { backgroundColor: theme.card },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'active' ? theme.primary : theme.textSecondary },
            ]}
          >
            {t('orders.active')}
          </Text>
          {activeOrders.length > 0 && (
            <Badge label={`${activeOrders.length}`} variant="primary" size="sm" />
          )}
        </Pressable>
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            setActiveTab('past');
          }}
          style={[
            styles.tab,
            activeTab === 'past' && { backgroundColor: theme.card },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'past' ? theme.primary : theme.textSecondary },
            ]}
          >
            {t('orders.history')}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {isLoadingOrders ? (
          <>
            <SkeletonListItem />
            <SkeletonListItem />
            <SkeletonListItem />
          </>
        ) : activeTab === 'active' ? (
          activeOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: theme.primaryLightest }]}>
                <Ionicons name="receipt-outline" size={48} color={theme.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>{t('orders.empty')}</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                {t('orders.emptyDescription')}
              </Text>
              <Pressable
                onPress={() => router.push('/(tabs)')}
                style={[styles.browseButton, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.browseButtonText}>Browse Restaurants</Text>
              </Pressable>
            </View>
          ) : (
            activeOrders.map((order) => (
              <OrderCard key={order.id} order={order} onPress={() => handleOrderPress(order)} />
            ))
          )
        ) : pastOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.backgroundTertiary }]}>
              <Ionicons name="time-outline" size={48} color={theme.textTertiary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>{t('orders.empty')}</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              {t('orders.emptyDescription')}
            </Text>
          </View>
        ) : (
          pastOrders.map((order) => (
            <OrderCard key={order.id} order={order} onPress={() => handleOrderPress(order)} />
          ))
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  cartText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
