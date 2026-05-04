import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { BlurView } from 'expo-blur';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function Badge({ label, variant = 'default', size = 'md', style }: BadgeProps) {
  const theme = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return { 
          backgroundColor: 'rgba(34, 197, 94, 0.2)', 
          borderColor: 'rgba(34, 197, 94, 0.4)',
          color: theme.success 
        };
      case 'warning':
        return { 
          backgroundColor: 'rgba(245, 158, 11, 0.2)', 
          borderColor: 'rgba(245, 158, 11, 0.4)',
          color: theme.warning 
        };
      case 'error':
        return { 
          backgroundColor: 'rgba(239, 68, 68, 0.2)', 
          borderColor: 'rgba(239, 68, 68, 0.4)',
          color: theme.error 
        };
      case 'info':
        return { 
          backgroundColor: 'rgba(59, 130, 246, 0.2)', 
          borderColor: 'rgba(59, 130, 246, 0.4)',
          color: theme.info 
        };
      case 'primary':
        return { 
          backgroundColor: 'rgba(5, 150, 105, 0.2)', 
          borderColor: 'rgba(5, 150, 105, 0.4)',
          color: theme.primary 
        };
      default:
        return { 
          backgroundColor: 'rgba(255, 255, 255, 0.2)', 
          borderColor: 'rgba(255, 255, 255, 0.3)',
          color: theme.textSecondary 
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View
      style={[
        styles.container,
        { 
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
        },
        size === 'sm' ? styles.sm : styles.md,
        style,
      ]}
    >
      <BlurView intensity={15} tint="light" style={styles.blur}>
        <Text
          style={[
            styles.label,
            { color: variantStyles.color },
            size === 'sm' ? styles.labelSm : styles.labelMd,
          ]}
        >
          {label}
        </Text>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderWidth: 1,
  },
  blur: {
    overflow: 'hidden',
  },
  sm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  md: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  label: {
    fontWeight: '600',
  },
  labelSm: {
    fontSize: 11,
  },
  labelMd: {
    fontSize: 13,
  },
});
