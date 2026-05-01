import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslation();

  const [darkMode, setDarkMode] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  const handleToggle = (setter: (value: boolean) => void, value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setter(!value);
  };

  const handleClearCache = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear all cached data?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const handleResetSettings = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Reset Settings',
      'This will reset all settings to default values. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setDarkMode(false);
            setAutoPlay(true);
            setSoundEffects(true);
            setHapticFeedback(true);
            setLocationServices(true);
            setAnalytics(true);
            setMarketing(false);
            Alert.alert('Success', 'Settings reset to defaults');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>

          <View style={[styles.settingCard, { backgroundColor: theme.backgroundSecondary }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="moon-outline" size={22} color={theme.primary} />
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
                  <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                    Use dark theme
                  </Text>
                </View>
              </View>
              <Switch
                value={darkMode}
                onValueChange={() => handleToggle(setDarkMode, darkMode)}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* App Behavior */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>App Behavior</Text>

          <View style={[styles.settingCard, { backgroundColor: theme.backgroundSecondary }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="play-circle-outline" size={22} color={theme.primary} />
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>Auto-play Videos</Text>
                  <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                    Automatically play restaurant videos
                  </Text>
                </View>
              </View>
              <Switch
                value={autoPlay}
                onValueChange={() => handleToggle(setAutoPlay, autoPlay)}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: theme.border }]}>
              <View style={styles.settingInfo}>
                <Ionicons name="volume-high-outline" size={22} color={theme.primary} />
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>Sound Effects</Text>
                  <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                    Play sounds for actions
                  </Text>
                </View>
              </View>
              <Switch
                value={soundEffects}
                onValueChange={() => handleToggle(setSoundEffects, soundEffects)}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: theme.border }]}>
              <View style={styles.settingInfo}>
                <Ionicons name="phone-portrait-outline" size={22} color={theme.primary} />
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>Haptic Feedback</Text>
                  <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                    Vibrate on interactions
                  </Text>
                </View>
              </View>
              <Switch
                value={hapticFeedback}
                onValueChange={() => handleToggle(setHapticFeedback, hapticFeedback)}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Privacy & Security */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Privacy & Security</Text>

          <View style={[styles.settingCard, { backgroundColor: theme.backgroundSecondary }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="location-outline" size={22} color={theme.primary} />
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>Location Services</Text>
                  <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                    Allow app to access your location
                  </Text>
                </View>
              </View>
              <Switch
                value={locationServices}
                onValueChange={() => handleToggle(setLocationServices, locationServices)}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: theme.border }]}>
              <View style={styles.settingInfo}>
                <Ionicons name="analytics-outline" size={22} color={theme.primary} />
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>Analytics</Text>
                  <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                    Help improve the app
                  </Text>
                </View>
              </View>
              <Switch
                value={analytics}
                onValueChange={() => handleToggle(setAnalytics, analytics)}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: theme.border }]}>
              <View style={styles.settingInfo}>
                <Ionicons name="megaphone-outline" size={22} color={theme.primary} />
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>Marketing</Text>
                  <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                    Receive promotional content
                  </Text>
                </View>
              </View>
              <Switch
                value={marketing}
                onValueChange={() => handleToggle(setMarketing, marketing)}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Storage */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Storage</Text>

          <Pressable
            onPress={handleClearCache}
            style={[styles.actionCard, { backgroundColor: theme.backgroundSecondary }]}
          >
            <View style={styles.actionInfo}>
              <Ionicons name="trash-outline" size={22} color={theme.primary} />
              <View style={styles.actionTextContainer}>
                <Text style={[styles.actionLabel, { color: theme.text }]}>Clear Cache</Text>
                <Text style={[styles.actionDescription, { color: theme.textSecondary }]}>
                  Free up space (156 MB)
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
          </Pressable>
        </View>

        {/* Advanced */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Advanced</Text>

          <Pressable
            onPress={handleResetSettings}
            style={[styles.actionCard, { backgroundColor: theme.backgroundSecondary }]}
          >
            <View style={styles.actionInfo}>
              <Ionicons name="refresh-outline" size={22} color="#ef4444" />
              <View style={styles.actionTextContainer}>
                <Text style={[styles.actionLabel, { color: '#ef4444' }]}>Reset Settings</Text>
                <Text style={[styles.actionDescription, { color: theme.textSecondary }]}>
                  Restore default settings
                </Text>
              </View>
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
    flex: 1,
    gap: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 13,
  },
});
