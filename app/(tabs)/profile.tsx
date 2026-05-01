import React from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/useAuthStore';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  badge?: string;
  onPress: () => void;
  destructive?: boolean;
}

function MenuItem({ icon, label, value, badge, onPress, destructive }: MenuItemProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        { backgroundColor: pressed ? theme.backgroundSecondary : 'transparent' },
      ]}
    >
      <View style={[styles.menuIcon, { backgroundColor: destructive ? theme.errorLight : theme.primaryLightest }]}>
        <Ionicons name={icon} size={20} color={destructive ? theme.error : theme.primary} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuLabel, { color: destructive ? theme.error : theme.text }]}>
          {label}
        </Text>
        {value && <Text style={[styles.menuValue, { color: theme.textSecondary }]}>{value}</Text>}
      </View>
      {badge && <Badge label={badge} variant="primary" size="sm" />}
      <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleMenuPress = (item: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    switch (item) {
      case 'edit-profile':
        router.push('/edit-profile');
        break;
      default:
        // Navigation would go here for other items
        console.log(`Navigate to ${item}`);
        break;
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <LinearGradient
        colors={['#059669', '#10b981', '#34d399']}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.profileSection}>
          <Avatar source={user?.avatar} name={user?.name} size="xl" />
          <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'guest@example.com'}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.totalOrders || 0}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>⭐ 4.9</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>${(user?.totalOrders || 0) * 25}</Text>
              <Text style={styles.statLabel}>Spent</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Menu Sections */}
      <View style={styles.menuContainer}>
        {/* Account Section */}
        <Card variant="default" padding="none" style={styles.menuCard}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Account</Text>
          <MenuItem
            icon="person-outline"
            label="Edit Profile"
            onPress={() => handleMenuPress('edit-profile')}
          />
          <MenuItem
            icon="location-outline"
            label="Delivery Addresses"
            value={`${user?.addresses.length || 0} saved`}
            onPress={() => handleMenuPress('addresses')}
          />
          <MenuItem
            icon="card-outline"
            label="Payment Methods"
            value={`${user?.paymentMethods.length || 0} cards`}
            onPress={() => handleMenuPress('payments')}
          />
        </Card>

        {/* Orders Section */}
        <Card variant="default" padding="none" style={styles.menuCard}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Orders</Text>
          <MenuItem
            icon="heart-outline"
            label="Favorites"
            badge="12"
            onPress={() => handleMenuPress('favorites')}
          />
          <MenuItem
            icon="receipt-outline"
            label="Order History"
            onPress={() => handleMenuPress('history')}
          />
          <MenuItem
            icon="gift-outline"
            label="Promo Codes"
            badge="2"
            onPress={() => handleMenuPress('promos')}
          />
        </Card>

        {/* Settings Section */}
        <Card variant="default" padding="none" style={styles.menuCard}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Settings</Text>
          <MenuItem
            icon="notifications-outline"
            label="Notifications"
            onPress={() => handleMenuPress('notifications')}
          />
          <MenuItem
            icon="language-outline"
            label="Language"
            value="English"
            onPress={() => handleMenuPress('language')}
          />
          <MenuItem
            icon="moon-outline"
            label="Appearance"
            value="System"
            onPress={() => handleMenuPress('appearance')}
          />
        </Card>

        {/* Support Section */}
        <Card variant="default" padding="none" style={styles.menuCard}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Support</Text>
          <MenuItem
            icon="help-circle-outline"
            label="Help Center"
            onPress={() => handleMenuPress('help')}
          />
          <MenuItem
            icon="chatbubble-outline"
            label="Contact Us"
            onPress={() => handleMenuPress('contact')}
          />
          <MenuItem
            icon="document-text-outline"
            label="Terms & Privacy"
            onPress={() => handleMenuPress('terms')}
          />
        </Card>

        {/* Logout */}
        <Card variant="default" padding="none" style={styles.menuCard}>
          <MenuItem
            icon="log-out-outline"
            label="Sign Out"
            onPress={handleLogout}
            destructive
          />
        </Card>

        {/* App Version */}
        <Text style={[styles.version, { color: theme.textTertiary }]}>
          Forest Eats v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginTop: 16,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 16,
  },
  menuContainer: {
    padding: 20,
  },
  menuCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuValue: {
    fontSize: 13,
    marginTop: 2,
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 8,
  },
});
