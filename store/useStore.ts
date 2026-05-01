import { create } from 'zustand';
import * as Crypto from 'expo-crypto';
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

const mockDeliveryPartner: DeliveryPartner = {
  id: 'driver-001',
  name: 'Michael Chen',
  rating: 4.9,
  avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
  vehicle: 'Honda Civic - Black',
  currentLocation: {
    lat: 37.7749,
    lng: -122.4194,
  },
  phone: '+1 555-0456',
  totalDeliveries: 1247,
};

const mockRestaurants: Restaurant[] = [
  {
    id: 'rest-001',
    name: 'Green Garden Bistro',
    cuisine: ['Healthy', 'Salads', 'Organic'],
    rating: 4.8,
    reviewCount: 324,
    deliveryTime: '20-30 min',
    deliveryFee: 2.99,
    minimumOrder: 15,
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800',
    isOpen: true,
    hours: '8:00 AM - 10:00 PM',
    location: {
      address: '123 Organic Way, San Francisco',
      lat: 37.7849,
      lng: -122.4094,
    },
    isFavorite: true,
    distance: '0.8 mi',
    promoText: '20% off first order',
    menu: [
      {
        id: 'cat-001',
        name: 'Popular Items',
        items: [
          {
            id: 'item-001',
            name: 'Forest Bowl',
            description: 'Quinoa, roasted vegetables, avocado, tahini dressing, topped with microgreens',
            price: 14.99,
            image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
            category: 'Bowls',
            customizations: [
              {
                id: 'cust-001',
                name: 'Protein',
                options: [
                  { id: 'opt-001', name: 'Grilled Chicken', price: 3.00 },
                  { id: 'opt-002', name: 'Tofu', price: 2.00 },
                  { id: 'opt-003', name: 'Salmon', price: 5.00 },
                ],
                required: false,
                maxSelections: 1,
              },
            ],
            availability: true,
            rating: 4.9,
            isPopular: true,
            calories: 450,
          },
          {
            id: 'item-002',
            name: 'Avocado Toast Deluxe',
            description: 'Sourdough bread, smashed avocado, poached eggs, cherry tomatoes, everything seasoning',
            price: 12.99,
            image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400',
            category: 'Breakfast',
            customizations: [],
            availability: true,
            rating: 4.7,
            isPopular: true,
            calories: 380,
          },
        ],
      },
      {
        id: 'cat-002',
        name: 'Salads',
        items: [
          {
            id: 'item-003',
            name: 'Kale Caesar',
            description: 'Organic kale, parmesan, croutons, house-made caesar dressing',
            price: 11.99,
            image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
            category: 'Salads',
            customizations: [],
            availability: true,
            rating: 4.6,
            isPopular: false,
            calories: 320,
          },
        ],
      },
    ],
  },
  {
    id: 'rest-002',
    name: 'Sakura Japanese Kitchen',
    cuisine: ['Japanese', 'Sushi', 'Asian'],
    rating: 4.7,
    reviewCount: 512,
    deliveryTime: '25-35 min',
    deliveryFee: 3.49,
    minimumOrder: 20,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800',
    isOpen: true,
    hours: '11:00 AM - 11:00 PM',
    location: {
      address: '456 Sushi Lane, San Francisco',
      lat: 37.7899,
      lng: -122.4004,
    },
    isFavorite: false,
    distance: '1.2 mi',
    menu: [
      {
        id: 'cat-003',
        name: 'Sushi Rolls',
        items: [
          {
            id: 'item-004',
            name: 'Dragon Roll',
            description: 'Shrimp tempura, cucumber, avocado topping, eel sauce',
            price: 16.99,
            image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
            category: 'Sushi',
            customizations: [],
            availability: true,
            rating: 4.8,
            isPopular: true,
            calories: 480,
          },
          {
            id: 'item-005',
            name: 'Salmon Nigiri (4pc)',
            description: 'Fresh Atlantic salmon on seasoned rice',
            price: 12.99,
            image: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=400',
            category: 'Sushi',
            customizations: [],
            availability: true,
            rating: 4.9,
            isPopular: true,
            calories: 280,
          },
        ],
      },
      {
        id: 'cat-004',
        name: 'Ramen',
        items: [
          {
            id: 'item-006',
            name: 'Tonkotsu Ramen',
            description: 'Rich pork broth, chashu, soft egg, green onions, nori',
            price: 15.99,
            image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
            category: 'Ramen',
            customizations: [
              {
                id: 'cust-002',
                name: 'Spice Level',
                options: [
                  { id: 'opt-004', name: 'Mild', price: 0 },
                  { id: 'opt-005', name: 'Medium', price: 0 },
                  { id: 'opt-006', name: 'Hot', price: 0 },
                ],
                required: true,
                maxSelections: 1,
              },
            ],
            availability: true,
            rating: 4.8,
            isPopular: true,
            calories: 650,
          },
        ],
      },
    ],
  },
  {
    id: 'rest-003',
    name: 'Bella Italia Trattoria',
    cuisine: ['Italian', 'Pizza', 'Pasta'],
    rating: 4.6,
    reviewCount: 289,
    deliveryTime: '30-40 min',
    deliveryFee: 2.49,
    minimumOrder: 18,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    isOpen: true,
    hours: '11:00 AM - 10:00 PM',
    location: {
      address: '789 Pasta Blvd, San Francisco',
      lat: 37.7699,
      lng: -122.4294,
    },
    isFavorite: true,
    distance: '1.5 mi',
    promoText: 'Free delivery on orders $30+',
    menu: [
      {
        id: 'cat-005',
        name: 'Pizzas',
        items: [
          {
            id: 'item-007',
            name: 'Margherita',
            description: 'San Marzano tomatoes, fresh mozzarella, basil, olive oil',
            price: 18.99,
            image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
            category: 'Pizza',
            customizations: [
              {
                id: 'cust-003',
                name: 'Size',
                options: [
                  { id: 'opt-007', name: 'Medium (12")', price: 0 },
                  { id: 'opt-008', name: 'Large (16")', price: 4.00 },
                ],
                required: true,
                maxSelections: 1,
              },
            ],
            availability: true,
            rating: 4.7,
            isPopular: true,
            calories: 800,
          },
        ],
      },
      {
        id: 'cat-006',
        name: 'Pasta',
        items: [
          {
            id: 'item-008',
            name: 'Spaghetti Carbonara',
            description: 'Guanciale, pecorino romano, egg yolk, black pepper',
            price: 16.99,
            image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400',
            category: 'Pasta',
            customizations: [],
            availability: true,
            rating: 4.8,
            isPopular: true,
            calories: 720,
          },
        ],
      },
    ],
  },
  {
    id: 'rest-004',
    name: 'Spice Route Indian',
    cuisine: ['Indian', 'Curry', 'Vegetarian'],
    rating: 4.5,
    reviewCount: 198,
    deliveryTime: '35-45 min',
    deliveryFee: 3.99,
    minimumOrder: 25,
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
    isOpen: true,
    hours: '11:30 AM - 10:30 PM',
    location: {
      address: '321 Curry Road, San Francisco',
      lat: 37.7649,
      lng: -122.4394,
    },
    isFavorite: false,
    distance: '2.1 mi',
    menu: [
      {
        id: 'cat-007',
        name: 'Curries',
        items: [
          {
            id: 'item-009',
            name: 'Butter Chicken',
            description: 'Tender chicken in creamy tomato sauce, served with basmati rice',
            price: 17.99,
            image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
            category: 'Curry',
            customizations: [
              {
                id: 'cust-004',
                name: 'Spice Level',
                options: [
                  { id: 'opt-009', name: 'Mild', price: 0 },
                  { id: 'opt-010', name: 'Medium', price: 0 },
                  { id: 'opt-011', name: 'Spicy', price: 0 },
                  { id: 'opt-012', name: 'Extra Spicy', price: 0 },
                ],
                required: true,
                maxSelections: 1,
              },
            ],
            availability: true,
            rating: 4.7,
            isPopular: true,
            calories: 580,
          },
        ],
      },
    ],
  },
  {
    id: 'rest-005',
    name: 'Taco Loco',
    cuisine: ['Mexican', 'Tacos', 'Burritos'],
    rating: 4.4,
    reviewCount: 456,
    deliveryTime: '15-25 min',
    deliveryFee: 1.99,
    minimumOrder: 12,
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800',
    isOpen: true,
    hours: '10:00 AM - 12:00 AM',
    location: {
      address: '567 Salsa Street, San Francisco',
      lat: 37.7799,
      lng: -122.4144,
    },
    isFavorite: false,
    distance: '0.5 mi',
    promoText: 'Taco Tuesday: 2 for 1',
    menu: [
      {
        id: 'cat-008',
        name: 'Tacos',
        items: [
          {
            id: 'item-010',
            name: 'Street Tacos (3)',
            description: 'Corn tortillas, carne asada, onion, cilantro, lime',
            price: 10.99,
            image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400',
            category: 'Tacos',
            customizations: [],
            availability: true,
            rating: 4.6,
            isPopular: true,
            calories: 420,
          },
        ],
      },
    ],
  },
];

const mockPromos: Promo[] = [
  {
    id: 'promo-001',
    code: 'FOREST20',
    discount: 20,
    discountType: 'percentage',
    minOrderValue: 25,
    expiryDate: new Date('2025-12-31'),
    usageLimit: 100,
    description: '20% off your order',
  },
  {
    id: 'promo-002',
    code: 'FREESHIP',
    discount: 5,
    discountType: 'fixed',
    minOrderValue: 30,
    expiryDate: new Date('2025-06-30'),
    usageLimit: 50,
    description: 'Free delivery',
  },
];

const mockOrders: Order[] = [
  {
    id: 'order-001',
    userId: 'user-001',
    restaurant: mockRestaurants[0],
    items: [
      {
        id: 'cart-001',
        menuItem: mockRestaurants[0].menu[0].items[0],
        quantity: 2,
        selectedCustomizations: [],
        totalPrice: 29.98,
      },
    ],
    status: 'delivered',
    subtotal: 29.98,
    deliveryFee: 2.99,
    tax: 2.85,
    discount: 0,
    total: 35.82,
    deliveryAddress: {
      id: 'addr-001',
      label: 'Home',
      street: '123 Forest Lane',
      city: 'San Francisco',
      zipCode: '94102',
      lat: 37.7749,
      lng: -122.4194,
      isDefault: true,
    },
    createdAt: new Date('2025-01-10T12:30:00'),
    estimatedDeliveryTime: new Date('2025-01-10T13:00:00'),
    deliveryPartner: mockDeliveryPartner,
    rating: 5,
  },
  {
    id: 'order-002',
    userId: 'user-001',
    restaurant: mockRestaurants[1],
    items: [
      {
        id: 'cart-002',
        menuItem: mockRestaurants[1].menu[0].items[0],
        quantity: 1,
        selectedCustomizations: [],
        totalPrice: 16.99,
      },
    ],
    status: 'on_the_way',
    subtotal: 16.99,
    deliveryFee: 3.49,
    tax: 1.62,
    discount: 0,
    total: 22.10,
    deliveryAddress: {
      id: 'addr-001',
      label: 'Home',
      street: '123 Forest Lane',
      city: 'San Francisco',
      zipCode: '94102',
      lat: 37.7749,
      lng: -122.4194,
      isDefault: true,
    },
    createdAt: new Date(),
    estimatedDeliveryTime: new Date(Date.now() + 20 * 60 * 1000),
    deliveryPartner: mockDeliveryPartner,
  },
];

export const useStore = create<StoreState>((set, get) => ({
  // Initial state
  restaurants: [],
  featuredRestaurants: [],
  favorites: ['rest-001', 'rest-003'],
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
  recentSearches: ['Sushi', 'Pizza', 'Healthy'],
  promos: mockPromos,
  appliedPromo: null,
  isLoadingRestaurants: false,
  isLoadingOrders: false,

  // Restaurant actions
  fetchRestaurants: async () => {
    set({ isLoadingRestaurants: true });
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const { favorites } = get();
      const restaurantsWithFavorites = mockRestaurants.map((r) => ({
        ...r,
        isFavorite: favorites.includes(r.id),
      }));
      set({ 
        restaurants: restaurantsWithFavorites,
        featuredRestaurants: restaurantsWithFavorites.filter((r) => r.promoText),
        isLoadingRestaurants: false,
      });
    } catch (error) {
      set({ isLoadingRestaurants: false });
    }
  },

  fetchRestaurant: async (id: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const restaurant = mockRestaurants.find((r) => r.id === id);
      if (restaurant) {
        const { favorites } = get();
        const restaurantWithFavorite = {
          ...restaurant,
          isFavorite: favorites.includes(id),
        };
        set({ selectedRestaurant: restaurantWithFavorite });
        return restaurantWithFavorite;
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  setSelectedRestaurant: (restaurant) => {
    set({ selectedRestaurant: restaurant });
  },

  toggleFavorite: (restaurantId) => {
    const { favorites, restaurants } = get();
    const isFavorite = favorites.includes(restaurantId);
    const newFavorites = isFavorite
      ? favorites.filter((id) => id !== restaurantId)
      : [...favorites, restaurantId];
    
    set({
      favorites: newFavorites,
      restaurants: restaurants.map((r) => ({
        ...r,
        isFavorite: newFavorites.includes(r.id),
      })),
    });
  },

  // Cart actions
  addToCart: (item, quantity, customizations = [], instructions) => {
    const { cart, cartRestaurantId, selectedRestaurant } = get();
    
    if (cartRestaurantId && selectedRestaurant && cartRestaurantId !== selectedRestaurant.id) {
      set({ cart: [], cartRestaurantId: selectedRestaurant.id });
    }
    
    const basePrice = item.price;
    const customizationPrice = 0; // Simplified for now
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
    const tax = subtotal * 0.0875; // 8.75% tax
    
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
      await new Promise((resolve) => setTimeout(resolve, 600));
      set({ orders: mockOrders, isLoadingOrders: false });
    } catch (error) {
      set({ isLoadingOrders: false });
    }
  },

  createOrder: async (deliveryAddress, paymentMethodId, scheduledTime) => {
    const { cart, cartRestaurantId, restaurants, getCartTotal, appliedPromo } = get();
    const restaurant = restaurants.find((r) => r.id === cartRestaurantId);
    
    if (!restaurant || cart.length === 0) {
      throw new Error('Invalid order');
    }
    
    const totals = getCartTotal();
    
    const newOrder: Order = {
      id: Crypto.randomUUID(),
      userId: 'user-001',
      restaurant,
      items: [...cart],
      status: 'pending',
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      tax: totals.tax,
      discount: totals.discount,
      total: totals.total,
      deliveryAddress,
      scheduledTime,
      createdAt: new Date(),
      estimatedDeliveryTime: new Date(Date.now() + 35 * 60 * 1000),
      promoCode: appliedPromo?.code,
    };
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    set((state) => ({
      orders: [newOrder, ...state.orders],
      activeOrder: newOrder,
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
    
    return newOrder;
  },

  updateOrderStatus: (orderId, status) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
              deliveryPartner: status === 'on_the_way' ? mockDeliveryPartner : order.deliveryPartner,
            }
          : order
      ),
      activeOrder: state.activeOrder?.id === orderId
        ? {
            ...state.activeOrder,
            status,
            deliveryPartner: status === 'on_the_way' ? mockDeliveryPartner : state.activeOrder.deliveryPartner,
          }
        : state.activeOrder,
    }));
  },

  setActiveOrder: (order) => {
    set({ activeOrder: order });
  },

  rateOrder: (orderId, rating) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId ? { ...order, rating } : order
      ),
    }));
  },

  // Search & Filter actions
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
  },

  addRecentSearch: (query) => {
    const { recentSearches } = get();
    if (!recentSearches.includes(query)) {
      set({ recentSearches: [query, ...recentSearches.slice(0, 4)] });
    }
  },

  clearRecentSearches: () => {
    set({ recentSearches: [] });
  },

  // Promo actions
  applyPromo: (code) => {
    const { promos, getCartTotal } = get();
    const promo = promos.find((p) => p.code.toUpperCase() === code.toUpperCase());
    
    if (!promo) return false;
    
    const totals = getCartTotal();
    if (totals.subtotal < promo.minOrderValue) return false;
    
    if (new Date() > promo.expiryDate) return false;
    
    set({ appliedPromo: promo });
    return true;
  },

  removePromo: () => {
    set({ appliedPromo: null });
  },
}));