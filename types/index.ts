export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  preferences: UserPreferences;
  totalOrders: number;
  joinedDate: Date;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  zipCode: string;
  lat: number;
  lng: number;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'cash' | 'wallet';
  label: string;
  lastFour?: string;
  expiryDate?: string;
  isDefault: boolean;
}

export interface UserPreferences {
  dietaryRestrictions: string[];
  notificationsEnabled: boolean;
  defaultPaymentMethodId: string | null;
  defaultAddressId: string | null;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string[];
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minimumOrder: number;
  image: string;
  isOpen: boolean;
  hours: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  menu: MenuCategory[];
  isFavorite: boolean;
  distance: string;
  promoText?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  customizations: Customization[];
  availability: boolean;
  rating: number;
  isPopular: boolean;
  calories?: number;
}

export interface Customization {
  id: string;
  name: string;
  options: CustomizationOption[];
  required: boolean;
  maxSelections: number;
}

export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  selectedCustomizations: SelectedCustomization[];
  specialInstructions?: string;
  totalPrice: number;
}

export interface SelectedCustomization {
  customizationId: string;
  optionIds: string[];
}

export interface Order {
  id: string;
  userId: string;
  restaurant: Restaurant;
  items: CartItem[];
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  deliveryAddress: Address;
  scheduledTime?: Date;
  createdAt: Date;
  estimatedDeliveryTime: Date;
  deliveryPartner?: DeliveryPartner;
  rating?: number;
  promoCode?: string;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'on_the_way'
  | 'arriving_soon'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface DeliveryPartner {
  id: string;
  name: string;
  rating: number;
  avatar: string;
  vehicle: string;
  currentLocation: {
    lat: number;
    lng: number;
  };
  phone: string;
  totalDeliveries: number;
}

export interface Review {
  id: string;
  orderId: string;
  rating: number;
  text: string;
  images: string[];
  createdAt: Date;
  userId: string;
  userName: string;
  userAvatar: string;
}

export interface Promo {
  id: string;
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  minOrderValue: number;
  expiryDate: Date;
  usageLimit: number;
  description: string;
}

export interface SearchFilters {
  cuisine: string[];
  rating: number;
  deliveryTime: string;
  priceRange: string;
  sortBy: 'recommended' | 'rating' | 'delivery_time' | 'distance';
}