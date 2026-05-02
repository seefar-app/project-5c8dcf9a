import { create } from 'zustand';
import * as Crypto from 'expo-crypto';
import { supabase } from '@/lib/supabase';
import type { 
  Restaurant, 
  MenuItem, 
  CartItem, 
  Order, 
  OrderStatus, 
  DeliveryPartner,
  Promo,
  SearchFilters,
  Address,
} from '@/types';
import type { Database } from '@/lib/database.types';

type DbRestaurant = Database['public']['Tables']['restaurants']['Row'];
type DbMenuItem = Database['public']['Tables']['menu_items']['Row'];
type DbOrder = Database['public']['Tables']['orders']['Row'];
type DbOrderItem = Database['public']['Tables']['order_items']['Row'];
type DbPromo = Database['public']['Tables']['promos']['Row'];
type DbDeliveryPartner = Database['public']['Tables']['delivery_partners']['Row'];
type DbAddress = Database['public']['Tables']['addresses']['Row'];

interface StoreState {
  // Restaurants
  restaurants: Restaurant[];
  featuredRestaurants: Restaurant[];
  favorites: string[];
  selectedRestaurant: Restaurant | null;
  
  // Cart
  cart: CartItem[];
  cartRestaurantId: string | null;
  
  // Orders
  orders: Order[];
  activeOrder: Order | null;
  
  // Search & Filters
  searchQuery: string;
  filters: SearchFilters;
  recentSearches: string[];
  
  // Promos
  promos: Promo[];
  appliedPromo: Promo | null;
  
  // Loading states
  isLoadingRestaurants: boolean;
  isLoadingOrders: boolean;
  
  // Actions
  fetchRestaurants: () => Promise<void>;
  fetchRestaurant: (id: string) => Promise<Restaurant | null>;
  setSelectedRestaurant: (restaurant: Restaurant | null) => void;
  toggleFavorite: (restaurantId: string) => void;
  
  // Cart actions
  addToCart: (item: MenuItem, quantity: number, customizations?: any[], instructions?: string) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  getCartTotal: () => { subtotal: number; deliveryFee: number; tax: number; discount: number; total: number };
  
  // Order actions
  fetchOrders: () => Promise<void>;
  createOrder: (deliveryAddress: Address, paymentMethodId: string, scheduledTime?: Date) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  setActiveOrder: (order: Order | null) => void;
  rateOrder: (orderId: string, rating: number) => void;
  
  // Search & Filter actions
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  
  // Promo actions
  applyPromo: (code: string) => boolean;
  removePromo: () => void;
}

// Helper functions to map database rows to app types
const mapDbRestaurantToRestaurant = (dbRestaurant: DbRestaurant, isFavorite: boolean = false): Restaurant => ({
  id: dbRestaurant.id,
  name: dbRestaurant.name || '',
  cuisine: dbRestaurant.cuisine || [],
  rating: Number(dbRestaurant.rating) || 5.0,
  reviewCount: dbRestaurant.reviewCount || 0,
  deliveryTime: dbRestaurant.deliveryTime || '30-40 min',
  deliveryFee: Number(dbRestaurant.deliveryFee) || 0,
  minimumOrder: Number(dbRestaurant.minimumOrder) || 0,
  image: dbRestaurant.image || '',
  isOpen: dbRestaurant.isOpen !== false,
  hours: dbRestaurant.hours || '',
  location: {
    address: dbRestaurant.location_address || '',
    lat: Number(dbRestaurant.location_lat) || 0,
    lng: Number(dbRestaurant.location_lng) || 0,
  },
  isFavorite,
  distance: dbRestaurant.distance || '0 mi',
  promoText: dbRestaurant.promoText || '',
  menu: [],
});

const mapDbMenuItemToMenuItem = (dbMenuItem: DbMenuItem): MenuItem => ({
  id: dbMenuItem.id,
  name: dbMenuItem.name || '',
  description: dbMenuItem.description || '',
  price: Number(dbMenuItem.price) || 0,
  image: dbMenuItem.image || '',
  category: dbMenuItem.category || '',
  customizations: [],
  availability: dbMenuItem.availability !== false,
  rating: Number(dbMenuItem.rating) || 5.0,
  isPopular: dbMenuItem.isPopular || false,
  calories: dbMenuItem.calories || 0,
});

const mapDbPromoToPromo = (dbPromo: DbPromo): Promo => ({
  id: dbPromo.id,
  code: dbPromo.code || '',
  discount: Number(dbPromo.discount) || 0,
  discountType: dbPromo.discountType || 'percentage',
  minOrderValue: Number(dbPromo.minOrderValue) || 0,
  expiryDate: dbPromo.expiryDate ? new Date(dbPromo.expiryDate) : new Date(),
  usageLimit: dbPromo.usageLimit || 0,
  description: dbPromo.description || '',
});

const mapDbDeliveryPartnerToDeliveryPartner = (dbPartner: DbDeliveryPartner): DeliveryPartner => ({
  id: dbPartner.id,
  name: dbPartner.name || '',
  rating: Number(dbPartner.rating) || 5.0,
  avatar: dbPartner.avatar || '',
  vehicle: dbPartner.vehicle || '',
  currentLocation: {
    lat: Number(dbPartner.currentLocation_lat) || 0,
    lng: Number(dbPartner.currentLocation_lng) || 0,
  },
  phone: dbPartner.phone || '',
  totalDeliveries: dbPartner.totalDeliveries || 0,
});

const mapDbAddressToAddress = (dbAddress: DbAddress): Address => ({
  id: dbAddress.id,
  label: dbAddress.label || '',
  street: dbAddress.street || '',
  city: dbAddress.city || '',
  zipCode: dbAddress.zipCode || '',
  lat: Number(dbAddress.lat) || 0,
  lng: Number(dbAddress.lng) || 0,
  isDefault: dbAddress.isDefault || false,
});

export const useStore = create<StoreState>((set, get) => ({
  // Initial state
  restaurants: [],
  featuredRestaurants: [],
  favorites: [],
  selectedRestaurant: null,
  cart: [],
  cartRestaurantId: null,
  orders: [],
  activeOrder: null,
  searchQuery: '',
  filters: {
    cuisine: [],
    rating: 0,
    deliveryTime: '',
    priceRange: '',
    sortBy: 'recommended',
  },
  recentSearches: [],
  promos: [],
  appliedPromo: null,
  isLoadingRestaurants: false,
  isLoadingOrders: false,

  // Restaurant actions
  fetchRestaurants: async () => {
    set({ isLoadingRestaurants: true });
    try {
      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select('*');
      
      if (error) throw error;

      const { data: favorites, error: favError } = await supabase
        .from('favorites')
        .select('restaurant_id');
      
      if (favError) throw favError;

      const favoriteIds = favorites?.map(f => f.restaurant_id) || [];
      
      const restaurantsWithFavorites = (restaurants || []).map(r => 
        mapDbRestaurantToRestaurant(r, favoriteIds.includes(r.id))
      );

      set({ 
        restaurants: restaurantsWithFavorites,
        favorites: favoriteIds,
        featuredRestaurants: restaurantsWithFavorites.filter((r) => r.promoText),
        isLoadingRestaurants: false,
      });
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      set({ isLoadingRestaurants: false });
    }
  },

  fetchRestaurant: async (id: string) => {
    try {
      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;

      const { data: favorites, error: favError } = await supabase
        .from('favorites')
        .select('restaurant_id')
        .eq('restaurant_id', id);
      
      if (favError) throw favError;

      const isFavorite = (favorites?.length || 0) > 0;
      const restaurantWithFavorite = mapDbRestaurantToRestaurant(restaurant, isFavorite);

      // Fetch menu categories and items
      const { data: categories, error: catError } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', id);
      
      if (catError) throw catError;

      const menuWithItems = [];
      for (const category of categories || []) {
        const { data: items, error: itemError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('category_id', category.id);
        
        if (itemError) throw itemError;

        menuWithItems.push({
          id: category.id,
          name: category.name || '',
          items: (items || []).map(mapDbMenuItemToMenuItem),
        });
      }

      restaurantWithFavorite.menu = menuWithItems;
      set({ selectedRestaurant: restaurantWithFavorite });
      return restaurantWithFavorite;
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      return null;
    }
  },

  setSelectedRestaurant: (restaurant) => {
    set({ selectedRestaurant: restaurant });
  },

  toggleFavorite: async (restaurantId) => {
    try {
      const { favorites } = get();
      const isFavorite = favorites.includes(restaurantId);
      
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('restaurant_id', restaurantId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ restaurant_id: restaurantId });
        
        if (error) throw error;
      }

      const newFavorites = isFavorite
        ? favorites.filter((id) => id !== restaurantId)
        : [...favorites, restaurantId];
      
      set({
        favorites: newFavorites,
        restaurants: get().restaurants.map((r) => ({
          ...r,
          isFavorite: newFavorites.includes(r.id),
        })),
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  },

  // Cart actions
  addToCart: (item, quantity, customizations = [], instructions) => {
    const { cart, cartRestaurantId, selectedRestaurant } = get();
    
    if (cartRestaurantId && selectedRestaurant && cartRestaurantId !== selectedRestaurant.id) {
      set({ cart: [], cartRestaurantId: selectedRestaurant.id });
    }
    
    const basePrice = item.price;
    const customizationPrice = 0;
    const totalPrice = (basePrice + customizationPrice) * quantity;
    
    const newCartItem: CartItem = {
      id: Crypto.randomUUID(),
      menuItem: item,
      quantity,
      selectedCustomizations: [],
      specialInstructions: instructions,
      totalPrice,
    };
    
    set({
      cart: [...cart, newCartItem],
      cartRestaurantId: selectedRestaurant?.id || cartRestaurantId,
    });
  },

  updateCartItemQuantity: (itemId, quantity) => {
    const { cart } = get();
    if (quantity <= 0) {
      set({ cart: cart.filter((item) => item.id !== itemId) });
    } else {
      set({
        cart: cart.map((item) =>
          item.id === itemId
            ? { ...item, quantity, totalPrice: item.menuItem.price * quantity }
            : item
        ),
      });
    }
  },

  removeFromCart: (itemId) => {
    const { cart } = get();
    const newCart = cart.filter((item) => item.id !== itemId);
    set({
      cart: newCart,
      cartRestaurantId: newCart.length === 0 ? null : get().cartRestaurantId,
    });
  },

  clearCart: () => {
    set({ cart: [], cartRestaurantId: null, appliedPromo: null });
  },

  getCartTotal: () => {
    const { cart, cartRestaurantId, restaurants, appliedPromo } = get();
    const restaurant = restaurants.find((r) => r.id === cartRestaurantId);
    
    const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const deliveryFee = restaurant?.deliveryFee || 0;
    const tax = subtotal * 0.0875;
    
    let discount = 0;
    if (appliedPromo && subtotal >= appliedPromo.minOrderValue) {
      discount = appliedPromo.discountType === 'percentage'
        ? subtotal * (appliedPromo.discount / 100)
        : appliedPromo.discount;
    }
    
    const total = subtotal + deliveryFee + tax - discount;
    
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      deliveryFee: Math.round(deliveryFee * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  },

  // Order actions
  fetchOrders: async () => {
    set({ isLoadingOrders: true });
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw authError || new Error('Not authenticated');

      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('userId', user.id)
        .order('createdAt', { ascending: false });
      
      if (error) throw error;

      const ordersWithDetails = [];
      for (const order of orders || []) {
        const { data: restaurant } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', order.restaurant_id)
          .single();

        const { data: items } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);

        const { data: address } = await supabase
          .from('addresses')
          .select('*')
          .eq('id', order.deliveryAddress_id)
          .single();

        const { data: deliveryPartner } = order.deliveryPartner_id
          ? await supabase
              .from('delivery_partners')
              .select('*')
              .eq('id', order.deliveryPartner_id)
              .single()
          : { data: null };

        const mappedOrder: Order = {
          id: order.id,
          userId: order.userId,
          restaurant: restaurant ? mapDbRestaurantToRestaurant(restaurant) : {} as Restaurant,
          items: (items || []).map(item => ({
            id: item.id,
            menuItem: {} as MenuItem,
            quantity: item.quantity,
            selectedCustomizations: [],
            totalPrice: Number(item.totalPrice),
          })),
          status: order.status as OrderStatus,
          subtotal: Number(order.subtotal),
          deliveryFee: Number(order.deliveryFee),
          tax: Number(order.tax),
          discount: Number(order.discount),
          total: Number(order.total),
          deliveryAddress: address ? mapDbAddressToAddress(address) : {} as Address,
          scheduledTime: order.scheduledTime ? new Date(order.scheduledTime) : undefined,
          createdAt: new Date(order.createdAt || order.created_at),
          estimatedDeliveryTime: order.estimatedDeliveryTime ? new Date(order.estimatedDeliveryTime) : undefined,
          deliveryPartner: deliveryPartner ? mapDbDeliveryPartnerToDeliveryPartner(deliveryPartner) : undefined,
          rating: order.rating || undefined,
          promoCode: order.promoCode || undefined,
        };

        ordersWithDetails.push(mappedOrder);
      }

      set({ orders: ordersWithDetails, isLoadingOrders: false });
    } catch (error) {
      console.error('Error fetching orders:', error);
      set({ isLoadingOrders: false });
    }
  },

  createOrder: async (deliveryAddress, paymentMethodId, scheduledTime) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw authError || new Error('Not authenticated');

      const { cart, cartRestaurantId, restaurants, getCartTotal, appliedPromo } = get();
      const restaurant = restaurants.find((r) => r.id === cartRestaurantId);
      
      if (!restaurant || cart.length === 0) {
        throw new Error('Invalid order');
      }
      
      const totals = getCartTotal();
      
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          userId: user.id,
          restaurant_id: restaurant.id,
          status: 'pending',
          subtotal: totals.subtotal,
          deliveryFee: totals.deliveryFee,
          tax: totals.tax,
          discount: totals.discount,
          total: totals.total,
          deliveryAddress_id: deliveryAddress.id,
          scheduledTime: scheduledTime?.toISOString(),
          estimatedDeliveryTime: new Date(Date.now() + 35 * 60 * 1000).toISOString(),
          promoCode: appliedPromo?.code,
        })
        .select()
        .single();
      
      if (orderError) throw orderError;

      // Insert order items
      for (const cartItem of cart) {
        const { error: itemError } = await supabase
          .from('order_items')
          .insert({
            order_id: newOrder.id,
            menu_item_id: cartItem.menuItem.id,
            quantity: cartItem.quantity,
            totalPrice: cartItem.totalPrice,
            specialInstructions: cartItem.specialInstructions,
          });
        
        if (itemError) throw itemError;
      }

      // Add to recent searches if search query exists
      if (get().searchQuery) {
        await supabase
          .from('recent_searches')
          .insert({
            user_id: user.id,
            query: get().searchQuery,
          });
      }

      const mappedOrder: Order = {
        id: newOrder.id,
        userId: newOrder.userId,
        restaurant,
        items: cart,
        status: 'pending' as OrderStatus,
        subtotal: totals.subtotal,
        deliveryFee: totals.deliveryFee,
        tax: totals.tax,
        discount: totals.discount,
        total: totals.total,
        deliveryAddress,
        scheduledTime,
        createdAt: new Date(newOrder.createdAt || newOrder.created_at),
        estimatedDeliveryTime: new Date(Date.now() + 35 * 60 * 1000),
        promoCode: appliedPromo?.code,
      };
      
      set((state) => ({
        orders: [mappedOrder, ...state.orders],
        activeOrder: mappedOrder,
        cart: [],
        cartRestaurantId: null,
        appliedPromo: null,
      }));

      // Simulate status updates
      setTimeout(() => {
        get().updateOrderStatus(newOrder.id, 'confirmed');
      }, 3000);
      
      setTimeout(() => {
        get().updateOrderStatus(newOrder.id, 'preparing');
      }, 8000);

      return mappedOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      
      if (error) throw error;

      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId
            ? { ...order, status }
            : order
        ),
        activeOrder: state.activeOrder?.id === orderId
          ? { ...state.activeOrder, status }
          : state.activeOrder,
      }));
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  },

  setActiveOrder: (order) => {
    set({ activeOrder: order });
  },

  rateOrder: async (orderId, rating) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ rating })
        .eq('id', orderId);
      
      if (error) throw error;

      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId ? { ...order, rating } : order
        ),
      }));
    } catch (error) {
      console.error('Error rating order:', error);
    }
  },

  // Search & Filter actions
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
  },

  addRecentSearch: async (query) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return;

      const { recentSearches } = get();
      if (!recentSearches.includes(query)) {
        await supabase
          .from('recent_searches')
          .insert({
            user_id: user.id,
            query,
          });

        set({ recentSearches: [query, ...recentSearches.slice(0, 4)] });
      }
    } catch (error) {
      console.error('Error adding recent search:', error);
    }
  },

  clearRecentSearches: async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return;

      await supabase
        .from('recent_searches')
        .delete()
        .eq('user_id', user.id);

      set({ recentSearches: [] });
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  },

  // Promo actions
  applyPromo: async (code) => {
    try {
      const { data: promo, error } = await supabase
        .from('promos')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();
      
      if (error || !promo) return false;

      const mappedPromo = mapDbPromoToPromo(promo);
      const { getCartTotal } = get();
      const totals = getCartTotal();

      if (totals.subtotal < mappedPromo.minOrderValue) return false;
      
      if (new Date() > mappedPromo.expiryDate) return false;
      
      set({ appliedPromo: mappedPromo });
      return true;
    } catch (error) {
      console.error('Error applying promo:', error);
      return false;
    }
  },

  removePromo: () => {
    set({ appliedPromo: null });
  },
}));