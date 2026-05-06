import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image, Animated, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../theme';
import CategoryCard from '../components/CategoryCard';
import RecipeCard from '../components/RecipeCard';
import { getRandomQuickRecipe, getQuickRecipes, toggleFavorite } from '../database/queries';
import { blurActiveElementOnWeb } from '../utils/accessibility';

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Cakes', 'Salads'];

const GREETING_SLIDES = [
  "What should I cook today?",
  "No cooking skills? No problem.",
  "Delicious meals in minutes.",
  "Hungry but confused?",
  "We’ve got your next meal.",
  "Cook smart, eat better.",
  "Short time, big taste.",
  "15 minutes, full flavor.",
  "Fast, easy, delicious."
];

export default function HomeScreen({ navigation }) {
  const [dailyRecipe, setDailyRecipe] = useState(null);
  const [quickRecipes, setQuickRecipes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const [slideIndex, setSlideIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Slide out and fade out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 500,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start(() => {
        // 2. Change slide
        setSlideIndex((prev) => (prev + 1) % GREETING_SLIDES.length);
        
        // 3. Reset position to left
        slideAnim.setValue(-50);
        
        // 4. Slide in and fade in
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]).start();
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [slideAnim, opacityAnim]);

  const loadData = useCallback(async () => {
    try {
      const daily = await getRandomQuickRecipe(15);
      setDailyRecipe(daily);
      const quick = await getQuickRecipes(15);
      setQuickRecipes(quick);
    } catch (e) {
      console.error('Error loading home data:', e);
    }
  }, []);

  const handleToggleFavorite = async (recipeId) => {
    await toggleFavorite(recipeId);
    loadData();
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const navigateWithBlur = (screen, params) => {
    blurActiveElementOnWeb();
    navigation.navigate(screen, params);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={styles.logo} 
              resizeMode="contain" 
            />
          </View>
          <Text style={styles.brandName}>Food Compass</Text>
        </View>
        <Animated.View 
          style={[
            styles.greetingBox, 
            { 
              opacity: opacityAnim,
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          <Text style={styles.greetingText}>{GREETING_SLIDES[slideIndex]}</Text>
        </Animated.View>
      </View>

      {/* Daily Recommendation */}
      {dailyRecipe && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles-outline" size={24} color={Colors.accent} />
            <Text style={styles.sectionTitle}>Today's Pick</Text>
          </View>
          <TouchableOpacity
            style={styles.dailyCard}
            onPress={() => navigateWithBlur('RecipeDetail', { recipeId: dailyRecipe.id })}
            activeOpacity={0.85}
          >
            <View style={[styles.dailyImage, { backgroundColor: dailyRecipe.imageColor || Colors.accent }]}>
              <Ionicons name="restaurant" size={40} color="rgba(255,255,255,0.7)" />
              <TouchableOpacity 
                style={styles.dailyFavButton} 
                onPress={(e) => {
                  e.stopPropagation();
                  handleToggleFavorite(dailyRecipe.id);
                }}
              >
                <Ionicons 
                  name={dailyRecipe.isFavorite ? "heart" : "heart-outline"} 
                  size={24} 
                  color={dailyRecipe.isFavorite ? Colors.favorite : Colors.white} 
                />
              </TouchableOpacity>
            </View>
            <View style={styles.dailyContent}>
              <View style={styles.quickBadge}>
                <Ionicons name="flash" size={12} color={Colors.white} />
                <Text style={styles.quickBadgeText}>Quick Recipe</Text>
              </View>
              <Text style={styles.dailyName}>{dailyRecipe.name}</Text>
              <Text style={styles.dailyDesc} numberOfLines={2}>{dailyRecipe.description}</Text>
              <View style={styles.dailyMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color={Colors.textInverse} />
                  <Text style={styles.metaText}>{dailyRecipe.cookingTime} min</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="speedometer-outline" size={14} color={Colors.textInverse} />
                  <Text style={styles.metaText}>{dailyRecipe.difficulty}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="grid-outline" size={20} color={Colors.accent} />
          <Text style={styles.sectionTitle}>Categories</Text>
        </View>
        <View style={styles.categoriesGrid}>
          {CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat}
              category={cat}
              onPress={() => navigateWithBlur('Category', { category: cat })}
            />
          ))}
        </View>
      </View>

      {/* Quick Recipes */}
      {quickRecipes.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash-outline" size={20} color={Colors.accent} />
            <Text style={styles.sectionTitle}>Under 15 Minutes</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {quickRecipes.map((recipe) => (
              <View key={recipe.id} style={styles.horizontalCard}>
                <RecipeCard
                  recipe={recipe}
                  onPress={() => navigateWithBlur('RecipeDetail', { recipeId: recipe.id })}
                  onToggleFavorite={handleToggleFavorite}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xxl,
    paddingTop: Spacing.md,
  },
brandRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: Spacing.md,
  marginBottom: Spacing.lg,
},
  brandName: {
  fontSize: 26,
  fontWeight: '900',
  color: Colors.primary,
  letterSpacing: 1.5,
  fontStyle: 'italic',
  textTransform: 'uppercase',
  ...Platform.select({
    web: {
      textShadow: '2px 2px 4px rgba(0,0,0,0.15)',
    },
    default: {
      textShadowColor: 'rgba(0,0,0,0.15)',
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 4,
    },
  }),
},
  logo: {
    width: 100,
    height: 100,
  },
  greetingBox: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.sm,
    ...Shadows.medium,
    alignSelf: 'flex-start',
    borderLeftWidth: 5,
    borderLeftColor: Colors.primary,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.softYellowLight,
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  logoContainer: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  dailyCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.primary,
    ...Shadows.large,
  },
  dailyImage: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dailyFavButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: BorderRadius.round,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  dailyContent: {
    padding: Spacing.lg,
  },
  quickBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  quickBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textInverse,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dailyName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textInverse,
    marginBottom: 6,
  },
  dailyDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  dailyMeta: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textInverse,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  horizontalList: {
    paddingRight: Spacing.lg,
  },
  horizontalCard: {
    width: 220,
    marginRight: Spacing.md,
  },
});
