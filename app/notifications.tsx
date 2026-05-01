import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'order' | 'promo' | 'system';
  read: boolean;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslation();

  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(true);
  const [newRestaurants, setNewRestaurants] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  const [notifications] = useState<Notification[]>([
    {
      id: 'notif-001',
      title: 'Order Delivered',
      message: 'Your order from Green Garden Bistro has been delivered',
      time: '10 min ago',
      type: 'order',
      read: false,
    },
    {
      id: 'notif-002',
      title: '20% Off Today!',
      message: 'Get 20% off on your next order from Sakura Japanese Kitchen',
      time: '1 hour ago',
      type: 'promo',
      read: false,
    },
    {
      id: 'notif-003',
      title: 'Order Confirmed',
      message: 'Your order #12345 has been confirmed',
      time: '2 hours ago',
      type: 'order',
      read: true,
    },
    {
      id: 'notif-004',
      title: 'New Restaurant Alert',
      message: 'Check out the new Italian restaurant in your area',
      time: '1 day ago',
      type: 'system',
      read: true,
    },
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return 'receipt';
      case 'promo':
        return 'pricetag';
      case 'system':
        return 'information-circle';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order':
        return theme.primary;
      case 'promo':
        return '#f59e0b';
      case 'system':
        return '#3b82f6';
      default:
        return theme.textSecondary;
    }
  };

  const handleToggle = (setter: (value: boolean) => void, value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setter(!value);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Notifications</Text>
        <Pressable>
          <Ionicons name="settings-outline" size={24} color={theme.text} />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Notification Preferences</Text>

          <View style={[styles.settingCard, { backgroundColor: theme.backgroundSecondary }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="receipt-outline" size={22} color={theme.primary} />
                <Text style={[styles.settingLabel, { color: theme.text }]}>Order Updates</Text>
              </View>
              <Switch
                value={orderUpdates}
                onValueChange={() => handleToggle(setOrderUpdates, orderUpdates)}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: theme.border }]}>
              <View style={styles.settingInfo}>
                <Ionicons name="pricetag-outline" size={22} color={theme.primary} />
                <Text style={[styles.settingLabel, { color: theme.text }]}>Promotions & Offers</Text>
              </View>
              <Switch
                value={promotions}
                onValueChange={() => handleToggle(setPromotions, promotions)}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: theme.border }]}>
              <View style={styles.settingInfo}>
                <Ionicons name="restaurant-outline" size={22} color={theme.primary} />
                <Text style={[styles.settingLabel, { color: theme.text }]}>New Restaurants</Text>
              </View>
              <Switch
                value={newRestaurants}
                onValueChange={() => handleToggle(setNewRestaurants, newRestaurants)}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Delivery Methods */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Delivery Methods</Text>

          <View style={[styles.settingCard, { backgroundColor: theme.backgroundSecondary }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="phone-portrait-outline" size={22} color={theme.primary} />
                <Text style={[styles.settingLabel, { color: theme.text }]}>Push Notifications</Text>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={() => handleToggle(setPushNotifications, pushNotifications)}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: theme.border }]}>
              <View style={styles.settingInfo}>
                <Ionicons name="mail-outline" size={22} color={theme.primary} />
                <Text style={[styles.settingLabel, { color: theme.text }]}>Email</Text>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={() => handleToggle(setEmailNotifications, emailNotifications)}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: theme.border }]}>
              <View style={styles.settingInfo}>
                <Ionicons name="chatbubble-outline" size={22} color={theme.primary} />
                <Text style={[styles.settingLabel, { color: theme.text }]}>SMS</Text>
              </View>
              <Switch
                value={smsNotifications}
                onValueChange={() => handleToggle(setSmsNotifications, smsNotifications)}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Recent Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent</Text>

          <View style={styles.notificationsList}>
            {notifications.map((notification) => (
              <Pressable
                key={notification.id}
                style={[
                  styles.notificationCard,
                  {
                    backgroundColor: notification.read
                      ? theme.backgroundSecondary
                      : theme.primary + '10',
                  },
                ]}
              >
                <View
                  style={[
                    styles.notificationIcon,
                    { backgroundColor: getNotificationColor(notification.type) + '20' },
                  ]}
                >
                  <Ionicons
                    name={getNotificationIcon(notification.type)}
                    size={24}
                    color={getNotificationColor(notification.type)}
                  />
                </View>
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text style={[styles.notificationTitle, { color: theme.text }]}>
                      {notification.title}
                    </Text>
                    {!notification.read && (
                      <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />
                    )}
                  </View>
                  <Text style={[styles.notificationMessage, { color: theme.textSecondary }]}>
                    {notification.message}
                  </Text>
                  <Text style={[styles.notificationTime, { color: theme.textTertiary }]}>
                    {notification.time}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  settingCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  notificationsList: {
    gap: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
  },
});
