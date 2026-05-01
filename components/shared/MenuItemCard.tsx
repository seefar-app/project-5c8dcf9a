import React from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Shadows } from '@/constants/Colors';
import { Badge } from '@/components/ui/Badge';
import type { MenuItem } from '@/types';

interface MenuItemCardProps {
  item: MenuItem;
  onPress: () => void;
}

export function MenuItemCard({ item, onPress }: MenuItemCardProps) {
  const theme = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.container, { backgroundColor: theme.card }, Shadows.sm]}
      >
        <View style={styles.content}>
          <View style={styles.textContent}>
            <View style={styles.header}>
              <Text style={[styles.name, { color: theme.text }]} numberOfLines={2}>
                {item.name}
              </Text>
              {item.isPopular && (
                <Badge label="Popular" variant="primary" size="sm" style={styles.badge} />
              )}
            </View>
            <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.footer}>
              <Text style={[styles.price, { color: theme.primary }]}>
                ${item.price.toFixed(2)}
              </Text>
              {item.calories && (
                <Text style={[styles.calories, { color: theme.textTertiary }]}>
                  {item.calories} cal
                </Text>
              )}
            </View>
          </View>
          {item.image && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: item.image }}
                style={styles.image}
                contentFit="cover"
                transition={200}
              />
              <View style={[styles.addButton, { backgroundColor: theme.primary }]}>
                <Ionicons name="add" size={18} color="#ffffff" />
              </View>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
  },
  textContent: {
    flex: 1,
    paddingRight: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  badge: {
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
  },
  calories: {
    fontSize: 13,
    marginLeft: 12,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  addButton: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});