import React from 'react';
import { View, Pressable, StyleSheet, ViewStyle, Animated } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { BlurView } from 'expo-blur';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  onPress?: () => void;
  style?: ViewStyle;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  intensity?: number;
}

export function Card({
  children,
  variant = 'glass',
  onPress,
  style,
  padding = 'md',
  intensity = 20,
}: CardProps) {
  const theme = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    }
  };

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.25)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 8,
        };
      case 'outlined':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.3)',
        };
      case 'default':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 2,
        };
      default: // glass
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.25)',
        };
    }
  };

  const getPaddingStyles = (): ViewStyle => {
    switch (padding) {
      case 'none':
        return {};
      case 'sm':
        return { padding: 12 };
      case 'lg':
        return { padding: 20 };
      default:
        return { padding: 16 };
    }
  };

  const containerStyle = [
    styles.container,
    getVariantStyles(),
    getPaddingStyles(),
    style,
  ];

  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={containerStyle}
        >
          <BlurView intensity={intensity} tint="light" style={styles.blur}>
            {children}
          </BlurView>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <View style={containerStyle}>
      <BlurView intensity={intensity} tint="light" style={styles.blur}>
        {children}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  blur: {
    overflow: 'hidden',
  },
});
