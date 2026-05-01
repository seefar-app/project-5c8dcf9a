import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

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
        return { backgroundColor: theme.successLight, color: theme.success };
      case 'warning':
        return { backgroundColor: theme.warningLight, color: theme.warning };
      case 'error':
        return { backgroundColor: theme.errorLight, color: theme.error };
      case 'info':
        return { backgroundColor: theme.infoLight, color: theme.info };
      case 'primary':
        return { backgroundColor: theme.primaryLightest, color: theme.primary };
      default:
        return { backgroundColor: theme.backgroundTertiary, color: theme.textSecondary };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: variantStyles.backgroundColor },
        size === 'sm' ? styles.sm : styles.md,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: variantStyles.color },
          size === 'sm' ? styles.labelSm : styles.labelMd,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    alignSelf: 'flex-start',
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