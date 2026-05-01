import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store/useStore';
import { MenuItemCard } from '@/components/shared/MenuItemCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import type { MenuItem, MenuCategory } from '@/types';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 280;
const HEADER_SCROLL_DISTANCE = HEADER_HEIGHT - 100;

export default function RestaurantDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const {
    selectedRestaurant,
    fetchRestaurant,
    toggleFavorite,
    addToCart,
    cart,
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadRestaurant();
  }, [id]);

  const loadRestaurant = async () => {
    setIsLoading(true);
    if (id) {
      await fetchRestaurant(id);
      if (selectedRestaurant?.menu && selectedRestaurant.menu.length > 0) {
        setSelectedCategory(selectedRestaurant.menu[0].id);
      }
    }
    setIsLoading(false);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleFavorite = () => {
    if (selectedRestaurant) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      toggleFavorite(selectedRestaurant.id);
    }
  };

  const handleMenuItemPress = (item: MenuItem) => {
    if (!selectedRestaurant) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Simple add to cart (you can enhance this with a modal for customizations)
    addToCart(item, 1, [], undefined);
  };

  const handleViewCart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/checkout');
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  // Animated header
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -HEADER_SCROLL_DISTANCE],
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.3, 1],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  if (isLoading || !selectedRestaurant) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.loadingHeader, { paddingTop: insets.top }]}>
          <Skeleton width={width} height={HEADER_HEIGHT} />
        </View>
        <View style={styles.loadingContent}>
          <Skeleton width={width - 32} height={24} style={{ marginBottom: 12 }} />
          <Skeleton width={width - 100} height={16} style={{ marginBottom: 24 }} />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} width={width - 32} height={120} style={{ marginBottom: 12 }} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Animated Header Image */}
      <Animated.View
        style={[
          styles.header,
          {
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        <Animated.View
          style={{
            opacity: imageOpacity,
            transform: [{ scale: imageScale }],
          }}
        >
          <Image
            source={{ uri: selectedRestaurant.image }}
            style={styles.headerImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.headerGradient}
          />
        </Animated.View>
      </Animated.View>

      {/* Fixed Top Bar */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + 8,
            backgroundColor: 'transparent',
          },
        ]}
      >
        <Animated.View style={{ opacity: headerOpacity }}>
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        </Animated.View>
        
        <View style={styles.topBarContent}>
          <Pressable onPress={handleBack} style={styles.topBarButton}>
            <BlurView intensity={80} tint="dark" style={styles.topBarButtonBlur}>
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </BlurView>
          </Pressable>

          <Animated.Text
            style={[
              styles.topBarTitle,
              { opacity: headerOpacity, color: '#ffffff' },
            ]}
            numberOfLines={1}
          >
            {selectedRestaurant.name}
          </Animated.Text>

          <View style={styles.topBarActions}>
            <Pressable onPress={handleFavorite} style={styles.topBarButton}>
              <BlurView intensity={80} tint="dark" style={styles.topBarButtonBlur}>
                <Ionicons
                  name={selectedRestaurant.isFavorite ? 'heart' : 'heart-outline'}
                  size={24}
                  color={selectedRestaurant.isFavorite ? '#ef4444' : '#ffffff'}
                />
              </BlurView>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: HEADER_HEIGHT, paddingBottom: cartItemCount > 0 ? 100 : 20 },
        ]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Restaurant Info Card */}
        <Animated.View style={[styles.infoCard, { opacity: fadeAnim }]}>
          <View style={[styles.infoCardContent, { backgroundColor: theme.card }]}>
            <View style={styles.infoHeader}>
              <View style={styles.infoHeaderLeft}>
                <Text style={[styles.restaurantName, { color: theme.text }]}>
                  {selectedRestaurant.name}
                </Text>
                <Text style={[styles.cuisine, { color: theme.textSecondary }]}>
                  {selectedRestaurant.cuisine.join(' • ')}
                </Text>
              </View>
              {selectedRestaurant.promoText && (
                <Badge label={selectedRestaurant.promoText} variant="primary" size="sm" />
              )}
            </View>

            <View style={styles.infoStats}>
              <View style={styles.infoStat}>
                <Ionicons name="star" size={16} color="#f59e0b" />
                <Text style={[styles.infoStatText, { color: theme.text }]}>
                  {selectedRestaurant.rating}
                </Text>
                <Text style={[styles.infoStatLabel, { color: theme.textTertiary }]}>
                  ({selectedRestaurant.reviewCount})
                </Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoStat}>
                <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
                <Text style={[styles.infoStatText, { color: theme.text }]}>
                  {selectedRestaurant.deliveryTime}
                </Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoStat}>
                <Ionicons name="bicycle-outline" size={16} color={theme.textSecondary} />
                <Text style={[styles.infoStatText, { color: theme.text }]}>
                  ${selectedRestaurant.deliveryFee.toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={[styles.infoRow, { borderTopColor: theme.border, borderTopWidth: 1 }]}>
              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={18} color={theme.textSecondary} />
                <Text style={[styles.infoItemText, { color: theme.textSecondary }]}>
                  {selectedRestaurant.distance} away
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={18} color={theme.textSecondary} />
                <Text style={[styles.infoItemText, { color: theme.textSecondary }]}>
                  {selectedRestaurant.hours}
                </Text>
              </View>
            </View>

            {selectedRestaurant.minimumOrder > 0 && (
              <View style={[styles.minimumOrder, { backgroundColor: theme.secondary }]}>
                <Ionicons name="information-circle-outline" size={16} color={theme.primary} />
                <Text style={[styles.minimumOrderText, { color: theme.primary }]}>
                  Minimum order: ${selectedRestaurant.minimumOrder.toFixed(2)}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Menu Categories Tabs */}
        {selectedRestaurant.menu && selectedRestaurant.menu.length > 0 && (
          <View style={styles.categoriesContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              {selectedRestaurant.menu.map((category: MenuCategory) => (
                <Pressable
                  key={category.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedCategory(category.id);
                  }}
                  style={[
                    styles.categoryTab,
                    selectedCategory === category.id && {
                      backgroundColor: theme.primary,
                    },
                    selectedCategory !== category.id && {
                      backgroundColor: theme.card,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryTabText,
                      selectedCategory === category.id
                        ? { color: '#ffffff' }
                        : { color: theme.text },
                    ]}
                  >
                    {category.name}
                  </Text>
                  <Badge
                    label={category.items.length.toString()}
                    variant={selectedCategory === category.id ? 'secondary' : 'default'}
                    size="sm"
                    style={{ marginLeft: 8 }}
                  />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {selectedRestaurant.menu
            ?.filter((cat) => !selectedCategory || cat.id === selectedCategory)
            .map((category: MenuCategory) => (
              <View key={category.id} style={styles.menuSection}>
                <Text style={[styles.menuSectionTitle, { color: theme.text }]}>
                  {category.name}
                </Text>
                {category.items.map((item: MenuItem) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onPress={() => handleMenuItemPress(item)}
                  />
                ))}
              </View>
            ))}
        </View>

        {/* Restaurant Details Section */}
        <View style={[styles.detailsSection, { backgroundColor: theme.card }]}>
          <Text style={[styles.detailsSectionTitle, { color: theme.text }]}>
            Restaurant Information
          </Text>
          
          <View style={styles.detailRow}>
            <Ionicons name="location" size={20} color={theme.primary} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                Address
              </Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {selectedRestaurant.location.address}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="time" size={20} color={theme.primary} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                Hours
              </Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {selectedRestaurant.hours}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="call" size={20} color={theme.primary} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                Contact
              </Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                Call restaurant
              </Text>
            </View>
          </View>
        </View>

        {/* Reviews Section */}
        <View style={[styles.reviewsSection, { backgroundColor: theme.card }]}>
          <View style={styles.reviewsHeader}>
            <Text style={[styles.reviewsSectionTitle, { color: theme.text }]}>
              Reviews
            </Text>
            <Pressable>
              <Text style={[styles.seeAllText, { color: theme.primary }]}>
                See all
              </Text>
            </Pressable>
          </View>

          <View style={styles.reviewsStats}>
            <View style={styles.reviewsRating}>
              <Text style={[styles.reviewsRatingNumber, { color: theme.text }]}>
                {selectedRestaurant.rating}
              </Text>
              <View style={styles.reviewsStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= Math.floor(selectedRestaurant.rating) ? 'star' : 'star-outline'}
                    size={16}
                    color="#f59e0b"
                  />
                ))}
              </View>
              <Text style={[styles.reviewsCount, { color: theme.textSecondary }]}>
                {selectedRestaurant.reviewCount} reviews
              </Text>
            </View>
          </View>

          <View style={styles.reviewPlaceholder}>
            <Ionicons name="chatbubbles-outline" size={32} color={theme.textTertiary} />
            <Text style={[styles.reviewPlaceholderText, { color: theme.textSecondary }]}>
              Be the first to review this restaurant
            </Text>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <View
          style={[
            styles.cartButton,
            {
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <Pressable
            onPress={handleViewCart}
            style={[styles.cartButtonContent, { backgroundColor: theme.primary }]}
          >
            <View style={styles.cartButtonBadge}>
              <Text style={styles.cartButtonBadgeText}>{cartItemCount}</Text>
            </View>
            <Text style={styles.cartButtonText}>View Cart</Text>
            <Text style={styles.cartButtonPrice}>${cartTotal.toFixed(2)}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingHeader: {
    width: '100%',
    height: HEADER_HEIGHT,
  },
  loadingContent: {
    padding: 16,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 1,
  },
  headerImage: {
    width: '100%',
    height: HEADER_HEIGHT,
  },
  headerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  topBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  topBarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  topBarButtonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 16,
  },
  topBarActions: {
    flexDirection: 'row',
    gap: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  infoCard: {
    marginBottom: 20,
  },
  infoCardContent: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  cuisine: {
    fontSize: 15,
  },
  infoStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoStat: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoStatText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
  infoStatLabel: {
    fontSize: 14,
    marginLeft: 2,
  },
  infoDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 12,
  },
  infoRow: {
    paddingTop: 16,
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoItemText: {
    fontSize: 14,
    marginLeft: 8,
  },
  minimumOrder: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  minimumOrderText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesScroll: {
    paddingRight: 16,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
  },
  categoryTabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  menuContainer: {
    marginBottom: 20,
  },
  menuSection: {
    marginBottom: 24,
  },
  menuSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  detailsSection: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  detailsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 13,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  reviewsSection: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 15,
    fontWeight: '600',
  },
  reviewsStats: {
    marginBottom: 20,
  },
  reviewsRating: {
    alignItems: 'center',
  },
  reviewsRatingNumber: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 8,
  },
  reviewsStars: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  reviewsCount: {
    fontSize: 14,
  },
  reviewPlaceholder: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  reviewPlaceholderText: {
    fontSize: 14,
    marginTop: 12,
  },
  cartButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  cartButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cartButtonBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartButtonBadgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  cartButtonText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
  cartButtonPrice: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
