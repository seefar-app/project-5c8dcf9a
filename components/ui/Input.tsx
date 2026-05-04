import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  Pressable,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { BlurView } from 'expo-blur';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  secureTextEntry,
  ...props
}: InputProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  const borderColor = error
    ? 'rgba(239, 68, 68, 0.6)'
    : isFocused
    ? 'rgba(5, 150, 105, 0.6)'
    : 'rgba(255, 255, 255, 0.3)';

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          {
            borderColor,
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
          },
        ]}
      >
        <BlurView intensity={20} tint="light" style={styles.blurContainer}>
          <View style={styles.inputContainer}>
            {leftIcon && (
              <Ionicons
                name={leftIcon}
                size={20}
                color={isFocused ? theme.primary : theme.textTertiary}
                style={styles.leftIcon}
              />
            )}
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                },
              ]}
              placeholderTextColor={theme.textTertiary}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              secureTextEntry={isSecure}
              {...props}
            />
            {secureTextEntry && (
              <Pressable onPress={() => setIsSecure(!isSecure)} style={styles.rightIcon}>
                <Ionicons
                  name={isSecure ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={theme.textTertiary}
                />
              </Pressable>
            )}
            {rightIcon && !secureTextEntry && (
              <Pressable onPress={onRightIconPress} style={styles.rightIcon}>
                <Ionicons name={rightIcon} size={20} color={theme.textTertiary} />
              </Pressable>
            )}
          </View>
        </BlurView>
      </View>
      {error && (
        <Text style={[styles.error, { color: 'rgba(239, 68, 68, 0.9)' }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    borderWidth: 2,
    borderRadius: 20,
    overflow: 'hidden',
  },
  blurContainer: {
    overflow: 'hidden',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  leftIcon: {
    marginRight: 12,
  },
  rightIcon: {
    marginLeft: 12,
    padding: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  error: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
});
