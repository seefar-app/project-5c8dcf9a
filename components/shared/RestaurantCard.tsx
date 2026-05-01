import React from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Shadows } from '@/constants/Colors';
import { Badge } from '@/components/ui/Badge';
import type { Restaurant } from '@/types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
  onFavoritePress?: () => void;
  variant?: 'default' | 'compact' | 'featured';
}

export function RestaurantCard({
  restaurant,
  onPress,
  onFavoritePress,
  variant = 'default',
}: RestaurantCardProps) {
  const theme = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  if (variant === 'compact') {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.compactContainer, { backgroundColor: theme.card }, Shadows.sm]}
        >
          <Image
            source={{ uri: restaurant.image }}
            style={styles.compactImage}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.compactContent}>
            <Text style={[styles.compactName, { color: theme.text }]} numberOfLines={1}>
              {restaurant.name}
            </Text>
            <View style={styles.compactMeta}>
              <Ionicons name="star" size={12} color="#f59e0b" />
              <Text style={[styles.compactRating, { color: theme.text }]}>
                {restaurant.rating}
              </Text>
              <Text style={[styles.compactDot, { color: theme.textTertiary }]}>•</Text>
              <Text style={[styles.compactTime, { color: theme.textSecondary }]}>
                {restaurant.deliveryTime}
              </Text>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  if (variant === 'featured') {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.featuredContainer, Shadows.lg]}
        >
          <Image
            source={{ uri: restaurant.image }}
            style={styles.featuredImage}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.featuredOverlay}>
            {restaurant.promoText && (
              <Badge label={restaurant.promoText} variant="primary" size="sm" />
            )}
            <View style={styles.featuredContent}>
              <Text style={styles.featuredName} numberOfLines={1}>
                {restaurant.name}
              </Text>
              <View style={styles.featuredMeta}>
                <Ionicons name="star" size={14} color="#f59e0b" />
                <Text style={styles.featuredRating}>{restaurant.rating}</Text>
                <Text style={styles.featuredDot}>•</Text>
                <Text style={styles.featuredTime}>{restaurant.deliveryTime}</Text>
              </View>
            </View>
          </View>
          {onFavoritePress && (
            <Pressable onPress={onFavoritePress} style={styles.favoriteButton}>
              <Ionicons
                name={restaurant.isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={restaurant.isFavorite ? '#ef4444' : '#ffffff'}
              />
            </Pressable>
          )}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.container, { backgroundColor: theme.card }, Shadows.md]}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: restaurant.image }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
          {restaurant.promoText && (
            <View style={styles.promoBadge}>
              <Badge label={restaurant.promoText} variant="primary" size="sm" />
            </View>
          )}
          {onFavoritePress && (
            <Pressable onPress={onFavoritePress} style={styles.favoriteButtonCard}>
              <View style={[styles.favoriteButtonBg, { backgroundColor: theme.card }]}>
                <Ionicons
                  name={restaurant.isFavorite ? 'heart' : 'heart-outline'}
                  size={20}
                  color={restaurant.isFavorite ? '#ef4444' : theme.textSecondary}
                />
              </View>
            </Pressable>
          )}
        </View>
        <View style={styles.content}>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <Text style={[styles.cuisine, { color: theme.textSecondary }]} numberOfLines={1}>
            {restaurant.cuisine.join(' • ')}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#f59e0b" />
              <Text style={[styles.rating, { color: theme.text }]}>
                {restaurant.rating}
              </Text>
              <Text style={[styles.reviewCount, { color: theme.textTertiary }]}>
                ({restaurant.reviewCount})
              </Text>
            </View>
            <Text style={[styles.dot, { color: theme.textTertiary }]}>•</Text>
            <Text style={[styles.deliveryTime, { color: theme.textSecondary }]}>
              {restaurant.deliveryTime}
            </Text>
            <Text style={[styles.dot, { color: theme.textTertiary }]}>•</Text>
            <Text style={[styles.deliveryFee, { color: theme.textSecondary }]}>
              ${restaurant.deliveryFee.toFixed(2)} delivery
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 160,
  },
  promoBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  favoriteButtonCard: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  favoriteButtonBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  cuisine: {
    fontSize: 14,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 13,
    marginLeft: 2,
  },
  dot: {
    marginHorizontal: 6,
  },
  deliveryTime: {
    fontSize: 13,
  },
  deliveryFee: {
    fontSize: 13,
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    width: 220,
  },
  compactImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  compactContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  compactName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactRating: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },
  compactDot: {
    marginHorizontal: 4,
  },
  compactTime: {
    fontSize: 13,
  },
  // Featured styles
  featuredContainer: {
    width: 280,
    height: 180,
    borderRadius: 20,
    marginRight: 16,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 16,
    justifyContent: 'space-between',
  },
  featuredContent: {},
  featuredName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredRating: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 4,
  },
  featuredDot: {
    color: '#ffffff',
    opacity: 0.7,
    marginHorizontal: 6,
  },
  featuredTime: {
    color: '#ffffff',
    opacity: 0.9,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});