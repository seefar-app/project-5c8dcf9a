import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { BlurView } from 'expo-blur';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'glass',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle; useBlur: boolean } => {
    const isDisabled = disabled || loading;
    
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: isDisabled ? 'rgba(5, 150, 105, 0.5)' : 'rgba(5, 150, 105, 0.8)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.3)',
          },
          text: { color: '#ffffff' },
          useBlur: true,
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: isDisabled ? 'rgba(247, 254, 231, 0.3)' : 'rgba(247, 254, 231, 0.5)',
            borderWidth: 1,
            borderColor: 'rgba(5, 150, 105, 0.2)',
          },
          text: { color: isDisabled ? theme.textTertiary : theme.primary },
          useBlur: true,
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 2,
            borderColor: isDisabled ? 'rgba(255, 255, 255, 0.2)' : 'rgba(5, 150, 105, 0.6)',
          },
          text: { color: isDisabled ? theme.textTertiary : theme.primary },
          useBlur: true,
        };
      case 'ghost':
        return {
          container: { 
            backgroundColor: 'transparent',
            borderWidth: 0,
          },
          text: { color: isDisabled ? theme.textTertiary : theme.primary },
          useBlur: false,
        };
      case 'destructive':
        return {
          container: {
            backgroundColor: isDisabled ? 'rgba(239, 68, 68, 0.5)' : 'rgba(239, 68, 68, 0.8)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.3)',
          },
          text: { color: '#ffffff' },
          useBlur: true,
        };
      case 'glass':
      default:
        return {
          container: { 
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.3)',
          },
          text: { color: theme.text },
          useBlur: true,
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle; iconSize: number } => {
    switch (size) {
      case 'sm':
        return {
          container: { paddingVertical: 8, paddingHorizontal: 16 },
          text: { fontSize: 14 },
          iconSize: 16,
        };
      case 'lg':
        return {
          container: { paddingVertical: 16, paddingHorizontal: 28 },
          text: { fontSize: 18 },
          iconSize: 22,
        };
      default:
        return {
          container: { paddingVertical: 12, paddingHorizontal: 24 },
          text: { fontSize: 16 },
          iconSize: 20,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const content = (
    <>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.text.color}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={sizeStyles.iconSize}
              color={variantStyles.text.color as string}
              style={styles.iconLeft}
            />
          )}
          <Text style={[styles.text, variantStyles.text, sizeStyles.text]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={sizeStyles.iconSize}
              color={variantStyles.text.color as string}
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </>
  );

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], width: fullWidth ? '100%' : undefined }}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.container,
          variantStyles.container,
          sizeStyles.container,
          fullWidth && styles.fullWidth,
          style,
        ]}
      >
        {variantStyles.useBlur ? (
          <BlurView intensity={15} tint="light" style={styles.blurContent}>
            {content}
          </BlurView>
        ) : (
          content
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: '600',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  blurContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});
