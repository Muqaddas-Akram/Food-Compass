import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../theme';
import { getRecipeById, getIngredients, getSteps, toggleFavorite } from '../database/queries';
import { blurActiveElementOnWeb } from '../utils/accessibility';

const DIFFICULTY_CONFIG = {
  Easy: { color: Colors.easy, bgColor: Colors.easyBg, icon: 'leaf-outline' },
  Medium: { color: Colors.medium, bgColor: Colors.mediumBg, icon: 'flame-outline' },
  Hard: { color: Colors.hard, bgColor: Colors.hardBg, icon: 'flash-outline' },
};

export default function RecipeDetailScreen({ route, navigation }) {
  const { recipeId } = route.params;
  const [recipe, setRecipe] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);
  const [isFav, setIsFav] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const r = await getRecipeById(recipeId);
      setRecipe(r);
      setIsFav(!!r?.isFavorite);
      const ing = await getIngredients(recipeId);
      setIngredients(ing);
      const st = await getSteps(recipeId);
      setSteps(st);
    } catch (e) {
      console.error('Error loading recipe detail:', e);
    }
  }, [recipeId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleToggleFav = async () => {
    const result = await toggleFavorite(recipeId);
    setIsFav(result);
  };

  if (!recipe) return <View style={styles.container} />;

  const diffConfig = DIFFICULTY_CONFIG[recipe.difficulty] || DIFFICULTY_CONFIG.Easy;
  const requiredIngredients = ingredients.filter(i => i.isRequired);
  const optionalIngredients = ingredients.filter(i => !i.isRequired);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: recipe.imageColor || Colors.accent }]}>
          <Ionicons name="restaurant" size={56} color="rgba(255,255,255,0.5)" />
          <TouchableOpacity style={styles.favButton} onPress={handleToggleFav}>
            <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={24} color={isFav ? Colors.favorite : Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.recipeName}>{recipe.name}</Text>
          <Text style={styles.recipeDesc}>{recipe.description}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Ionicons name="time-outline" size={16} color={Colors.accent} />
              <Text style={styles.metaChipText}>{recipe.cookingTime} min</Text>
            </View>
            <View style={[styles.metaChip, { backgroundColor: diffConfig.bgColor }]}>
              <Ionicons name={diffConfig.icon} size={16} color={diffConfig.color} />
              <Text style={[styles.metaChipText, { color: diffConfig.color }]}>{recipe.difficulty}</Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="people-outline" size={16} color={Colors.accent} />
              <Text style={styles.metaChipText}>{recipe.servings} servings</Text>
            </View>
          </View>
        </View>

        {/* Required Ingredients */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.sienna} />
            <Text style={styles.sectionTitle}>Must Have</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{requiredIngredients.length}</Text>
            </View>
          </View>
          {requiredIngredients.map((ing) => (
            <View key={ing.id} style={styles.ingredientRow}>
              <View style={styles.ingredientDot} />
              <View style={styles.ingredientInfo}>
                <Text style={styles.ingredientName}>{ing.name}</Text>
                {ing.quantity ? <Text style={styles.ingredientQty}>{ing.quantity}</Text> : null}
                {ing.alternatives ? (
                  <View style={styles.altRow}>
                    <Ionicons name="swap-horizontal" size={12} color={Colors.accent} />
                    <Text style={styles.altText}>Alt: {ing.alternatives}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          ))}
        </View>

        {/* Optional Ingredients */}
        {optionalIngredients.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="add-circle-outline" size={20} color={Colors.khaki} />
              <Text style={styles.sectionTitle}>Optional</Text>
              <View style={[styles.countBadge, { backgroundColor: Colors.khakiLight }]}>
                <Text style={[styles.countText, { color: Colors.khakiDark }]}>{optionalIngredients.length}</Text>
              </View>
            </View>
            {optionalIngredients.map((ing) => (
              <View key={ing.id} style={[styles.ingredientRow, styles.optionalRow]}>
                <View style={[styles.ingredientDot, { backgroundColor: Colors.khaki }]} />
                <View style={styles.ingredientInfo}>
                  <Text style={[styles.ingredientName, { color: Colors.textSecondary }]}>{ing.name}</Text>
                  {ing.quantity ? <Text style={styles.ingredientQty}>{ing.quantity}</Text> : null}
                  {ing.alternatives ? (
                    <View style={styles.altRow}>
                      <Ionicons name="swap-horizontal" size={12} color={Colors.accent} />
                      <Text style={styles.altText}>Alt: {ing.alternatives}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Steps Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list-outline" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Steps</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{steps.length}</Text>
            </View>
          </View>
          {steps.map((step) => (
            <View key={step.id} style={styles.stepPreview}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{step.stepNumber}</Text>
              </View>
              <Text style={styles.stepText} numberOfLines={2}>{step.instruction}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Start Cooking Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.cookButton}
          onPress={() => {
            blurActiveElementOnWeb();
            navigation.navigate('CookingMode', { recipeId: recipe.id, recipeName: recipe.name });
          }}
          activeOpacity={0.85}
        >
          <Ionicons name="flame-outline" size={22} color={Colors.white} />
          <Text style={styles.cookButtonText}>Start Cooking</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  hero: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favButton: {
    position: 'absolute',
    top: Spacing.xl,
    right: Spacing.lg,
    width: 44,
    height: 44,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    padding: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  recipeName: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  recipeDesc: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
  },
  metaChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  countBadge: {
    backgroundColor: Colors.softYellow,
    width: 26,
    height: 26,
    borderRadius: BorderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadows.small,
  },
  optionalRow: {
    opacity: 0.85,
  },
  ingredientDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.sienna,
    marginTop: 5,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  ingredientQty: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  altRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  altText: {
    fontSize: 12,
    color: Colors.accent,
    fontStyle: 'italic',
  },
  stepPreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    paddingTop: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  cookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.sienna,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    ...Shadows.medium,
  },
  cookButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
});
