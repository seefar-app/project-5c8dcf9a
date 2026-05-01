import React, { useEffect, useRef } from 'react';
import { View, Text, ImageBackground, Animated, Pressable, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from '@/hooks/useTranslation';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuthStore();
  const { t } = useTranslation();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.push('/(auth)/login');
    }
  };

  const handleSignUp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(auth)/signup');
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(5,150,105,0.3)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.95)']}
          style={styles.gradient}
        >
          <View style={[styles.content, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 }]}>
            {/* Logo and Brand */}
            <Animated.View 
              style={[
                styles.logoContainer,
                {
                  opacity: logoAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <View style={styles.logoCircle}>
                <Ionicons name="leaf" size={48} color="#ffffff" />
              </View>
              <Text style={styles.brandName}>Forest Eats</Text>
              <Text style={styles.tagline}>{t('onboarding.subtitle')}</Text>
            </Animated.View>

            {/* Features */}
            <Animated.View 
              style={[
                styles.featuresContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.featureRow}>
                <View style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="restaurant" size={24} color="#10b981" />
                  </View>
                  <Text style={styles.featureText}>500+ {t('home.nearbyRestaurants')}</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="time" size={24} color="#10b981" />
                  </View>
                  <Text style={styles.featureText}>{t('home.fastDelivery')}</Text>
                </View>
              </View>
              <View style={styles.featureRow}>
                <View style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="location" size={24} color="#10b981" />
                  </View>
                  <Text style={styles.featureText}>Live Tracking</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="heart" size={24} color="#10b981" />
                  </View>
                  <Text style={styles.featureText}>Eco-Friendly</Text>
                </View>
              </View>
            </Animated.View>

            {/* CTA Buttons */}
            <Animated.View 
              style={[
                styles.ctaContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Button
                title={t('onboarding.getStarted')}
                onPress={handleGetStarted}
                variant="primary"
                size="lg"
                fullWidth
                icon="arrow-forward"
                iconPosition="right"
              />
              
              <Pressable onPress={handleSignUp} style={styles.signupLink}>
                <Text style={styles.signupText}>
                  {t('auth.dontHaveAccount')} <Text style={styles.signupTextBold}>{t('auth.signup')}</Text>
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  brandName: {
    fontSize: 42,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -1,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    textAlign: 'center',
  },
  featuresContainer: {
    marginVertical: 40,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  featureItem: {
    alignItems: 'center',
    width: width * 0.35,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    textAlign: 'center',
  },
  ctaContainer: {
    alignItems: 'center',
  },
  signupLink: {
    marginTop: 20,
    padding: 8,
  },
  signupText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
  },
  signupTextBold: {
    color: '#10b981',
    fontWeight: '700',
  },
});
