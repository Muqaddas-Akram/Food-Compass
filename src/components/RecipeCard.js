import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../theme';

const DIFFICULTY_CONFIG = {
  Easy: { color: Colors.easy, bgColor: Colors.easyBg, icon: 'leaf-outline' },
  Medium: { color: Colors.medium, bgColor: Colors.mediumBg, icon: 'flame-outline' },
  Hard: { color: Colors.hard, bgColor: Colors.hardBg, icon: 'flash-outline' },
};

export default function RecipeCard({ recipe, onPress, onToggleFavorite, style }) {
  const diffConfig = DIFFICULTY_CONFIG[recipe.difficulty] || DIFFICULTY_CONFIG.Easy;

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Image placeholder with gradient color */}
      <View style={[styles.imageContainer, { backgroundColor: recipe.imageColor || Colors.accent }]}>
        <Ionicons name="restaurant-outline" size={36} color="rgba(255,255,255,0.6)" />
        <TouchableOpacity 
          style={styles.favButton} 
          onPress={(e) => {
            e.stopPropagation();
            onToggleFavorite && onToggleFavorite(recipe.id);
          }}
        >
          <Ionicons 
            name={recipe.isFavorite ? "heart" : "heart-outline"} 
            size={18} 
            color={recipe.isFavorite ? Colors.favorite : Colors.white} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{recipe.name}</Text>

        <View style={styles.tagsRow}>
          {/* Time badge */}
          <View style={styles.timeBadge}>
            <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.timeText}>{recipe.cookingTime} min</Text>
          </View>

          {/* Difficulty badge */}
          <View style={[styles.diffBadge, { backgroundColor: diffConfig.bgColor }]}>
            <Ionicons name={diffConfig.icon} size={12} color={diffConfig.color} />
            <Text style={[styles.diffText, { color: diffConfig.color }]}>{recipe.difficulty}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.medium,
    marginBottom: Spacing.lg,
  },
  imageContainer: {
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: BorderRadius.round,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  content: {
    padding: Spacing.md,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  diffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  diffText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
