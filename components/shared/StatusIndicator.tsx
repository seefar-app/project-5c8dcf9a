import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface StatusIndicatorProps {
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  style?: ViewStyle;
}

export function StatusIndicator({
  isActive = true,
  size = 'md',
  color,
  style,
}: StatusIndicatorProps) {
  const theme = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.4,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [isActive, pulseAnim]);

  const getSizeValue = () => {
    switch (size) {
      case 'sm':
        return 8;
      case 'lg':
        return 16;
      default:
        return 12;
    }
  };

  const sizeValue = getSizeValue();
  const dotColor = color || (isActive ? theme.success : theme.textTertiary);

  return (
    <View style={[styles.container, { width: sizeValue * 2, height: sizeValue * 2 }, style]}>
      {isActive && (
        <Animated.View
          style={[
            styles.pulse,
            {
              width: sizeValue,
              height: sizeValue,
              borderRadius: sizeValue / 2,
              backgroundColor: dotColor,
              opacity: 0.3,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
      )}
      <View
        style={[
          styles.dot,
          {
            width: sizeValue,
            height: sizeValue,
            borderRadius: sizeValue / 2,
            backgroundColor: dotColor,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
  },
  dot: {},
});