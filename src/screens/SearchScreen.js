import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Spacing, BorderRadius, Shadows } from '../theme';
import RecipeCard from '../components/RecipeCard';
import { searchRecipes, toggleFavorite } from '../database/queries';
import { blurActiveElementOnWeb } from '../utils/accessibility';

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Cakes', 'Salads'];
const TIME_FILTERS = [
  { label: 'Any time', value: null },
  { label: '≤ 15 min', value: 15 },
  { label: '≤ 30 min', value: 30 },
  { label: '≤ 60 min', value: 60 },
];

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTime, setSelectedTime] = useState(null);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const doSearch = useCallback(async () => {
    try {
      const cat = selectedCategory === 'All' ? null : selectedCategory;
      const data = await searchRecipes(query, cat, selectedTime);
      setResults(data);
      setHasSearched(true);
    } catch (e) {
      console.error('Error searching:', e);
    }
  }, [query, selectedCategory, selectedTime]);

  useFocusEffect(
    useCallback(() => {
      doSearch();
    }, [doSearch])
  );

  useEffect(() => {
    doSearch();
  }, [selectedCategory, selectedTime]);

  const handleToggleFav = async (recipeId) => {
    await toggleFavorite(recipeId);
    doSearch();
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
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes..."
            placeholderTextColor={Colors.textTertiary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={doSearch}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); }}>
              <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter Chips */}
      <View style={styles.filterSection}>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.chipRow}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, selectedCategory === item && styles.chipActive]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text style={[styles.chipText, selectedCategory === item && styles.chipTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Time Filter */}
      <View style={styles.filterSection}>
        <FlatList
          data={TIME_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.label}
          contentContainerStyle={styles.chipRow}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.timeChip, selectedTime === item.value && styles.timeChipActive]}
              onPress={() => setSelectedTime(item.value)}
            >
              <Ionicons
                name="time-outline"
                size={14}
                color={selectedTime === item.value ? Colors.white : Colors.textSecondary}
              />
              <Text style={[styles.timeChipText, selectedTime === item.value && styles.timeChipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRecipe}
        contentContainerStyle={styles.resultsList}
        numColumns={2}
        columnWrapperStyle={results.length > 1 ? styles.row : undefined}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={Keyboard.dismiss}
        ListEmptyComponent={
          hasSearched ? (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={48} color={Colors.khaki} />
              <Text style={styles.emptyText}>No recipes found</Text>
              <Text style={styles.emptyHint}>Try different filters or search terms</Text>
            </View>
          ) : null
        }
        ListHeaderComponent={
          <Text style={styles.resultCount}>
            {results.length} recipe{results.length !== 1 ? 's' : ''} found
          </Text>
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
  searchSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    ...Shadows.small,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  filterSection: {
    marginBottom: Spacing.sm,
  },
  chipRow: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.white,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  timeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  timeChipTextActive: {
    color: Colors.white,
  },
  resultsList: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.huge,
  },
  resultCount: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
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
    paddingTop: 60,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  emptyHint: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
});
