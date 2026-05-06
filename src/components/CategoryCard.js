import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../theme';

const CATEGORY_ICONS = {
  Breakfast: { icon: 'sunny-outline', color: '#F6A623', bgColor: '#FFF3E0' },
  Lunch: { icon: 'restaurant-outline', color: '#4CAF50', bgColor: '#E8F5E9' },
  Dinner: { icon: 'moon-outline', color: '#7B68EE', bgColor: '#EDE7F6' },
  Snacks: { icon: 'cafe-outline', color: '#FF7043', bgColor: '#FBE9E7' },
  Cakes: { icon: 'heart-outline', color: '#E91E63', bgColor: '#FCE4EC' },
  Salads: { icon: 'leaf-outline', color: '#26A69A', bgColor: '#E0F2F1' },
};

export default function CategoryCard({ category, onPress, style }) {
  const config = CATEGORY_ICONS[category] || CATEGORY_ICONS.Lunch;

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
        <Ionicons name={config.icon} size={28} color={config.color} />
      </View>
      <Text style={styles.label}>{category}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    ...Shadows.small,
    width: '48%',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});
