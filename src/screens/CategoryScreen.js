import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius } from '../theme';
import RecipeCard from '../components/RecipeCard';
import { getRecipesByCategory, toggleFavorite } from '../database/queries';
import { blurActiveElementOnWeb } from '../utils/accessibility';

export default function CategoryScreen({ route, navigation }) {
  const { category } = route.params;
  const [recipes, setRecipes] = useState([]);

  const load = useCallback(async () => {
    try {
      const data = await getRecipesByCategory(category);
      setRecipes(data);
    } catch (e) {
      console.error('Error loading category recipes:', e);
    }
  }, [category]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleToggleFav = async (recipeId) => {
    await toggleFavorite(recipeId);
    load();
  };

  const renderRecipe = ({ item }) => (
    <View style={styles.cardWrapper}>
      <RecipeCard
        recipe={item}
        onPress={() => {
          blurActiveElementOnWeb();
          navigation.navigate('RecipeDetail', { recipeId: item.id });
        }}
        onToggleFavorite={handleToggleFav}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRecipe}
        contentContainerStyle={styles.list}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="restaurant-outline" size={48} color={Colors.khaki} />
            <Text style={styles.emptyText}>No recipes in {category} yet</Text>
          </View>
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{category}</Text>
            <Text style={styles.headerCount}>{recipes.length} recipe{recipes.length !== 1 ? 's' : ''}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: Spacing.lg,
    paddingBottom: Spacing.huge,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  headerCount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  row: {
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '48%',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textTertiary,
  },
});
