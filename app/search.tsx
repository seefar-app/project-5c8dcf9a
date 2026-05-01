import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/hooks/useTranslation';
import { RestaurantCard } from '@/components/shared/RestaurantCard';
import type { Restaurant } from '@/types';

const CUISINES = ['All', 'Healthy', 'Japanese', 'Italian', 'Indian', 'Mexican', 'Asian', 'American', 'Chinese', 'Thai'];
const PRICE_RANGES = ['$', '$$', '$$$', '$$$$'];
const DELIVERY_TIMES = ['Under 20 min', '20-30 min', '30-45 min', '45+ min'];

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslation();
  const {
    restaurants,
    searchQuery,
    setSearchQuery,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    toggleFavorite,
  } = useStore();

  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(['All']);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string[]>([]);
  const [selectedDeliveryTime, setSelectedDeliveryTime] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'rating' | 'deliveryTime' | 'deliveryFee'>('rating');

  useEffect(() => {
    setSearchQuery(localQuery);
    if (localQuery.length > 0) {
      addRecentSearch(localQuery);
    }
  }, [localQuery]);

  const filteredRestaurants = restaurants.filter((r) => {
    const matchesQuery =
      !localQuery ||
      r.name.toLowerCase().includes(localQuery.toLowerCase()) ||
      r.cuisine.some((c) => c.toLowerCase().includes(localQuery.toLowerCase()));

    const matchesCuisine =
      selectedCuisines.includes('All') ||
      r.cuisine.some((c) => selectedCuisines.includes(c));

    // Simple price range matching (you can enhance this based on your data)
    const matchesPriceRange =
      selectedPriceRange.length === 0 || selectedPriceRange.includes('$$');

    return matchesQuery && matchesCuisine && matchesPriceRange;
  });

  const sortedRestaurants = [...filteredRestaurants].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'deliveryFee') return a.deliveryFee - b.deliveryFee;
    // For deliveryTime, extract the first number
    const aTime = parseInt(a.deliveryTime.split('-')[0]);
    const bTime = parseInt(b.deliveryTime.split('-')[0]);
    return aTime - bTime;
  });

  const toggleCuisine = (cuisine: string) => {
    Haptics.selectionAsync();
    if (cuisine === 'All') {
      setSelectedCuisines(['All']);
    } else {
      const newSelection = selectedCuisines.includes(cuisine)
        ? selectedCuisines.filter((c) => c !== cuisine)
        : [...selectedCuisines.filter((c) => c !== 'All'), cuisine];
      setSelectedCuisines(newSelection.length === 0 ? ['All'] : newSelection);
    }
  };

  const togglePriceRange = (price: string) => {
    Haptics.selectionAsync();
    setSelectedPriceRange((prev) =>
      prev.includes(price) ? prev.filter((p) => p !== price) : [...prev, price]
    );
  };

  const handleRecentSearchPress = (query: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocalQuery(query);
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/restaurant/${restaurant.id}`);
  };

  const handleFavoritePress = (restaurantId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite(restaurantId);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: theme.background }]}>
        <View style={styles.headerContent}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <View style={[styles.searchBar, { backgroundColor: theme.backgroundSecondary }]}>
            <Ionicons name="search" size={20} color={theme.textTertiary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder={t('home.searchPlaceholder')}
              placeholderTextColor={theme.textTertiary}
              value={localQuery}
              onChangeText={setLocalQuery}
              autoFocus
            />
            {localQuery.length > 0 && (
              <Pressable onPress={() => setLocalQuery('')}>
                <Ionicons name="close-circle" size={20} color={theme.textTertiary} />
              </Pressable>
            )}
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Recent Searches */}
        {localQuery.length === 0 && recentSearches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Searches</Text>
              <Pressable onPress={clearRecentSearches}>
                <Text style={[styles.clearText, { color: theme.primary }]}>Clear</Text>
              </Pressable>
            </View>
            {recentSearches.map((search, index) => (
              <Pressable
                key={index}
                onPress={() => handleRecentSearchPress(search)}
                style={[styles.recentItem, { borderBottomColor: theme.border }]}
              >
                <Ionicons name="time-outline" size={20} color={theme.textSecondary} />
                <Text style={[styles.recentText, { color: theme.text }]}>{search}</Text>
                <Ionicons name="arrow-up-outline" size={20} color={theme.textTertiary} />
              </Pressable>
            ))}
          </View>
        )}

        {/* Filters */}
        {localQuery.length > 0 && (
          <>
            {/* Sort By */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Sort By</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                {(['rating', 'deliveryTime', 'deliveryFee'] as const).map((sort) => (
                  <Pressable
                    key={sort}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSortBy(sort);
                    }}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: sortBy === sort ? theme.primary : theme.backgroundSecondary,
                        borderColor: sortBy === sort ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.filterText, { color: sortBy === sort ? '#fff' : theme.text }]}>
                      {sort === 'rating' ? 'Rating' : sort === 'deliveryTime' ? 'Delivery Time' : 'Delivery Fee'}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Cuisines */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Cuisines</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                {CUISINES.map((cuisine) => (
                  <Pressable
                    key={cuisine}
                    onPress={() => toggleCuisine(cuisine)}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: selectedCuisines.includes(cuisine)
                          ? theme.primary
                          : theme.backgroundSecondary,
                        borderColor: selectedCuisines.includes(cuisine) ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        { color: selectedCuisines.includes(cuisine) ? '#fff' : theme.text },
                      ]}
                    >
                      {cuisine}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Price Range */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Price Range</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                {PRICE_RANGES.map((price) => (
                  <Pressable
                    key={price}
                    onPress={() => togglePriceRange(price)}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: selectedPriceRange.includes(price)
                          ? theme.primary
                          : theme.backgroundSecondary,
                        borderColor: selectedPriceRange.includes(price) ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        { color: selectedPriceRange.includes(price) ? '#fff' : theme.text },
                      ]}
                    >
                      {price}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Results */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {sortedRestaurants.length} Results
              </Text>
              {sortedRestaurants.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={64} color={theme.textTertiary} />
                  <Text style={[styles.emptyTitle, { color: theme.text }]}>No results found</Text>
                  <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                    Try adjusting your search or filters
                  </Text>
                </View>
              ) : (
                sortedRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    onPress={() => handleRestaurantPress(restaurant)}
                    onFavoritePress={() => handleFavoritePress(restaurant.id)}
                  />
                ))
              )}
            </View>
          </>
        )}
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  recentText: {
    flex: 1,
    fontSize: 15,
  },
  filterRow: {
    gap: 10,
    paddingRight: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
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
