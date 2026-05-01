import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface LocationInputProps {
  label?: string;
  value: string;
  placeholder?: string;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
}

export function LocationInput({
  label,
  value,
  placeholder = 'Enter location',
  onPress,
  icon = 'location',
  iconColor,
}: LocationInputProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      )}
      <Pressable
        onPress={onPress}
        style={[
          styles.inputContainer,
          { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: theme.primaryLightest }]}>
          <Ionicons
            name={icon}
            size={18}
            color={iconColor || theme.primary}
          />
        </View>
        <Text
          style={[
            styles.value,
            { color: value ? theme.text : theme.textTertiary },
          ]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  value: {
    flex: 1,
    fontSize: 15,
  },
});