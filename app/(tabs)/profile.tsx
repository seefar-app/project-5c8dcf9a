import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/useAuthStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Language } from '@/i18n/translations';

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

function LanguageModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const theme = useTheme();
  const { language, setLanguage } = useLanguageStore();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const languages: { code: Language; name: string; nativeName: string }[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
  ];

  const handleSelectLanguage = (lang: Language) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLanguage(lang);
    setTimeout(() => {
      onClose();
      Alert.alert(
        t('common.done'),
        'Language changed. Please restart the app for full effect.',
        [{ text: 'OK' }]
      );
    }, 300);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.background, paddingBottom: insets.bottom + 20 },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {t('profile.language')}
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.languageList}>
            {languages.map((lang) => (
              <Pressable
                key={lang.code}
                onPress={() => handleSelectLanguage(lang.code)}
                style={({ pressed }) => [
                  styles.languageItem,
                  {
                    backgroundColor: pressed ? theme.backgroundSecondary : 'transparent',
                  },
                ]}
              >
                <View style={styles.languageInfo}>
                  <Text style={[styles.languageName, { color: theme.text }]}>
                    {lang.nativeName}
                  </Text>
                  <Text style={[styles.languageSubname, { color: theme.textSecondary }]}>
                    {lang.name}
                  </Text>
                </View>
                {language === lang.code && (
                  <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { user, logout } = useAuthStore();
  const { language } = useLanguageStore();
  const { t } = useTranslation();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const getLanguageName = () => {
    switch (language) {
      case 'ar':
        return 'العربية';
      case 'fr':
        return 'Français';
      default:
        return 'English';
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('profile.logout'),
      t('profile.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.logout'),
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
      case 'addresses':
        router.push('/addresses');
        break;
      case 'payments':
        router.push('/payment-methods');
        break;
      case 'favorites':
        router.push('/favorites');
        break;
      case 'history':
        router.push('/(tabs)/orders');
        break;
      case 'notifications':
        router.push('/notifications');
        break;
      case 'language':
        setShowLanguageModal(true);
        break;
      case 'appearance':
        router.push('/settings');
        break;
      case 'help':
        router.push('/help');
        break;
      default:
        Alert.alert('Coming Soon', `${item} feature is under development`);
        break;
    }
  };

  return (
    <>
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
                <Text style={styles.statLabel}>{t('orders.title')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>⭐ 4.9</Text>
                <Text style={styles.statLabel}>{t('home.rating')}</Text>
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
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              {t('profile.myAccount')}
            </Text>
            <MenuItem
              icon="person-outline"
              label={t('profile.editProfile')}
              onPress={() => handleMenuPress('edit-profile')}
            />
            <MenuItem
              icon="location-outline"
              label={t('profile.addresses')}
              value={`${user?.addresses.length || 0} saved`}
              onPress={() => handleMenuPress('addresses')}
            />
            <MenuItem
              icon="card-outline"
              label={t('profile.paymentMethods')}
              value={`${user?.paymentMethods.length || 0} cards`}
              onPress={() => handleMenuPress('payments')}
            />
          </Card>

          {/* Orders Section */}
          <Card variant="default" padding="none" style={styles.menuCard}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              {t('orders.title')}
            </Text>
            <MenuItem
              icon="heart-outline"
              label={t('profile.favorites')}
              badge="12"
              onPress={() => handleMenuPress('favorites')}
            />
            <MenuItem
              icon="receipt-outline"
              label={t('orders.history')}
              onPress={() => handleMenuPress('history')}
            />
            <MenuItem
              icon="gift-outline"
              label={t('cart.promoCode')}
              badge="2"
              onPress={() => handleMenuPress('promos')}
            />
          </Card>

          {/* Settings Section */}
          <Card variant="default" padding="none" style={styles.menuCard}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              {t('profile.settings')}
            </Text>
            <MenuItem
              icon="notifications-outline"
              label={t('profile.notifications')}
              onPress={() => handleMenuPress('notifications')}
            />
            <MenuItem
              icon="language-outline"
              label={t('profile.language')}
              value={getLanguageName()}
              onPress={() => handleMenuPress('language')}
            />
            <MenuItem
              icon="settings-outline"
              label="App Settings"
              onPress={() => handleMenuPress('appearance')}
            />
          </Card>

          {/* Support Section */}
          <Card variant="default" padding="none" style={styles.menuCard}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              {t('profile.helpSupport')}
            </Text>
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
              label={t('profile.logout')}
              onPress={handleLogout}
              destructive
            />
          </Card>

          {/* App Version */}
          <Text style={[styles.version, { color: theme.textTertiary }]}>
            Forest Eats {t('profile.version')} 1.0.0
          </Text>
        </View>
      </ScrollView>

      <LanguageModal visible={showLanguageModal} onClose={() => setShowLanguageModal(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
  },
  userEmail: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  languageList: {
    paddingHorizontal: 20,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  languageSubname: {
    fontSize: 14,
  },
});
