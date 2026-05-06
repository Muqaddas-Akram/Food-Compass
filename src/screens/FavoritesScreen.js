import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius } from '../theme';
import RecipeCard from '../components/RecipeCard';
import { getFavorites, toggleFavorite } from '../database/queries';
import { blurActiveElementOnWeb } from '../utils/accessibility';

export default function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);

  const load = useCallback(async () => {
    try {
      const data = await getFavorites();
      setFavorites(data);
    } catch (e) {
      console.error('Error loading favorites:', e);
    }
  }, []);

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
          navigation.navigate('HomeTab', {
            screen: 'RecipeDetail',
            params: { recipeId: item.id },
          });
        }}
        onToggleFavorite={handleToggleFav}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRecipe}
        contentContainerStyle={styles.list}
        numColumns={2}
        columnWrapperStyle={favorites.length > 1 ? styles.row : undefined}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="heart-outline" size={56} color={Colors.khaki} />
            </View>
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptyText}>Tap the heart icon on any recipe to save it here</Text>
          </View>
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Favorites</Text>
            <Text style={styles.headerCount}>
              {favorites.length} saved recipe{favorites.length !== 1 ? 's' : ''}
            </Text>
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
    paddingTop: Spacing.md,
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
    paddingTop: 100,
    paddingHorizontal: Spacing.xxxl,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
