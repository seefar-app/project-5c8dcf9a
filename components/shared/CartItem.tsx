import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import type { CartItem as CartItemType } from '@/types';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const theme = useTheme();

  const handleQuantityChange = (delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      onRemove();
    } else {
      onUpdateQuantity(newQuantity);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <Image
        source={{ uri: item.menuItem.image }}
        style={styles.image}
        contentFit="cover"
      />
      <View style={styles.content}>
        <Text style={[styles.name, { color: theme.text }]} numberOfLines={2}>
          {item.menuItem.name}
        </Text>
        {item.specialInstructions && (
          <Text style={[styles.instructions, { color: theme.textTertiary }]} numberOfLines={1}>
            Note: {item.specialInstructions}
          </Text>
        )}
        <Text style={[styles.price, { color: theme.primary }]}>
          ${item.totalPrice.toFixed(2)}
        </Text>
      </View>
      <View style={styles.quantityControls}>
        <Pressable
          onPress={() => handleQuantityChange(-1)}
          style={[styles.quantityButton, { backgroundColor: theme.backgroundSecondary }]}
        >
          <Ionicons
            name={item.quantity === 1 ? 'trash-outline' : 'remove'}
            size={18}
            color={item.quantity === 1 ? theme.error : theme.text}
          />
        </Pressable>
        <Text style={[styles.quantity, { color: theme.text }]}>{item.quantity}</Text>
        <Pressable
          onPress={() => handleQuantityChange(1)}
          style={[styles.quantityButton, { backgroundColor: theme.primary }]}
        >
          <Ionicons name="add" size={18} color="#ffffff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  instructions: {
    fontSize: 12,
    marginBottom: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
});