import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  StyleSheet,
  Animated,
  FlatList,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store/useStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocation } from '@/hooks/useLocation';
import { useTranslation } from '@/hooks/useTranslation';
import { RestaurantCard } from '@/components/shared/RestaurantCard';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import type { Restaurant } from '@/types';

const { width } = Dimensions.get('window');

const CUISINES = ['All', 'Healthy', 'Japanese', 'Italian', 'Indian', 'Mexican', 'Asian'];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const {
    restaurants,
    featuredRestaurants,
    isLoadingRestaurants,
    fetchRestaurants,
    toggleFavorite,
    searchQuery,
    setSearchQuery,
    cart,
  } = useStore();
  const { location } = useLocation();

  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    fetchRestaurants();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRestaurants();
    setRefreshing(false);
  }, []);

  const filteredRestaurants = restaurants.filter((r) => {
    const matchesCuisine = selectedCuisine === 'All' || r.cuisine.includes(selectedCuisine);
    const matchesSearch =
      !searchQuery ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cuisine.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCuisine && matchesSearch;
  });

  const handleRestaurantPress = (restaurant: Restaurant) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/restaurant/${restaurant.id}`);
  };

  const handleFavoritePress = (restaurantId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite(restaurantId);
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#059669', '#10b981']}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable
              onPress={() => router.push('/checkout')}
              style={styles.cartButton}
            >
              <Ionicons name="cart-outline" size={24} color="#fff" />
              {cartItemCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
                </View>
              )}
            </Pressable>
            <Avatar source={user?.avatar} name={user?.name} size="md" />
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Pressable
            onPress={() => router.push('/search')}
            style={[styles.searchBar, { backgroundColor: 'rgba(255,255,255,0.95)' }]}
          >
            <Ionicons name="search" size={20} color={theme.textTertiary} />
            <Text style={[styles.searchPlaceholder, { color: theme.textTertiary }]}>
              {t('home.searchPlaceholder')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setShowMap(!showMap)}
            style={[styles.mapToggle, { backgroundColor: showMap ? '#fff' : 'rgba(255,255,255,0.3)' }]}
          >
            <Ionicons name="map" size={22} color={showMap ? theme.primary : '#fff'} />
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {/* Map Section */}
        {showMap && location && (
          <Animated.View style={[styles.mapContainer, { opacity: fadeAnim }]}>
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
              showsUserLocation
              showsMyLocationButton={false}
            >
              {filteredRestaurants.map((restaurant) => (
                <Marker
                  key={restaurant.id}
                  coordinate={{
                    latitude: restaurant.location.lat,
                    longitude: restaurant.location.lng,
                  }}
                  title={restaurant.name}
                  description={restaurant.cuisine.join(', ')}
                  onCalloutPress={() => handleRestaurantPress(restaurant)}
                />
              ))}
            </MapView>
          </Animated.View>
        )}

        {/* Cuisine Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cuisineContainer}
        >
          {CUISINES.map((cuisine) => (
            <Pressable
              key={cuisine}
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedCuisine(cuisine);
              }}
              style={[
                styles.cuisineChip,
                {
                  backgroundColor: selectedCuisine === cuisine ? theme.primary : theme.backgroundSecondary,
                  borderColor: selectedCuisine === cuisine ? theme.primary : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.cuisineText,
                  { color: selectedCuisine === cuisine ? '#fff' : theme.text },
                ]}
              >
                {cuisine}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Featured Section */}
        {featuredRestaurants.length > 0 && (
          <Animated.View
            style={[
              styles.section,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                🔥 Featured Deals
              </Text>
              <Pressable>
                <Text style={[styles.seeAll, { color: theme.primary }]}>{t('common.viewAll')}</Text>
              </Pressable>
            </View>
            <FlatList
              horizontal
              data={featuredRestaurants}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <RestaurantCard
                  restaurant={item}
                  variant="featured"
                  onPress={() => handleRestaurantPress(item)}
                  onFavoritePress={() => handleFavoritePress(item.id)}
                />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
            />
          </Animated.View>
        )}

        {/* All Restaurants */}
        <Animated.View
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {searchQuery ? 'Search Results' : t('home.nearbyRestaurants')}
            </Text>
            <Badge label={`${filteredRestaurants.length}`} variant="primary" size="sm" />
          </View>

          {isLoadingRestaurants ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : filteredRestaurants.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="restaurant-outline" size={64} color={theme.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No restaurants found</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Try adjusting your search or filters
              </Text>
            </View>
          ) : (
            filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onPress={() => handleRestaurantPress(restaurant)}
                onFavoritePress={() => handleFavoritePress(restaurant.id)}
              />
            ))
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {},
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cartButton: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 16,
    gap: 12,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
  },
  mapToggle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  mapContainer: {
    height: 200,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  cuisineContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
  },
  cuisineChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  cuisineText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  featuredList: {
    paddingRight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
