import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import allRecipes from '../data/allRecipes';

const { width } = Dimensions.get('window');

const RecipeScreen = () => {
  // State management
  const [recipeList, setRecipeList] = useState(allRecipes);
  const [filteredRecipes, setFilteredRecipes] = useState(allRecipes);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  
  // Filter states
  const [priceFilter, setPriceFilter] = useState('all');
  const [tasteFilter, setTasteFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Recipe thumbnails mapping (Metro Bundler compatible)
  const recipeThumbnails = {
    'agar_tokoroten': require('../assets/recipe_images/agar_tokoroten.png'),
    'alaska_pollock_sushi': require('../assets/recipe_images/alaska_pollock_sushi.png'),
    'allenypterus_sushi': require('../assets/recipe_images/allenypterus_sushi.png'),
    'american_lobster_sushi': require('../assets/recipe_images/american_lobster_sushi.png'),
    // Add more mappings as needed - this is a sample
  };

  // Load saved data on component mount
  useEffect(() => {
    loadSavedData();
  }, []);

  // Apply filters whenever filter states change
  useEffect(() => {
    applyFilters();
  }, [priceFilter, tasteFilter, sourceFilter, typeFilter, recipeList]);

  const loadSavedData = async () => {
    try {
      // For now, we'll use the static recipe data
      // In the future, this could load user preferences or favorites
      console.log('Recipe data loaded successfully');
    } catch (error) {
      console.error('Error loading recipe data:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...recipeList];

    // Price filter
    if (priceFilter !== 'all') {
      filtered = filtered.filter(recipe => {
        const maxPrice = recipe.price_max;
        switch (priceFilter) {
          case 'budget': return maxPrice <= 100;
          case 'mid': return maxPrice > 100 && maxPrice <= 500;
          case 'premium': return maxPrice > 500 && maxPrice <= 1000;
          case 'luxury': return maxPrice > 1000;
          default: return true;
        }
      });
    }

    // Taste filter
    if (tasteFilter !== 'all') {
      filtered = filtered.filter(recipe => {
        const maxTaste = recipe.taste_max;
        switch (tasteFilter) {
          case 'basic': return maxTaste <= 100;
          case 'good': return maxTaste > 100 && maxTaste <= 200;
          case 'great': return maxTaste > 200 && maxTaste <= 300;
          case 'excellent': return maxTaste > 300;
          default: return true;
        }
      });
    }

    // Source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(recipe => {
        const acquisition = recipe.acquisition.toLowerCase();
        switch (sourceFilter) {
          case 'cooksta': return acquisition.includes('cooksta') || acquisition.includes('rank');
          case 'staff': return acquisition.includes('train') || acquisition.includes('level');
          case 'event': return acquisition.includes('event') || acquisition.includes('seasonal');
          case 'quest': return acquisition.includes('complete') || acquisition.includes('defeat');
          default: return true;
        }
      });
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(recipe => {
        const ingredients = recipe.ingredients.join(' ').toLowerCase();
        switch (typeFilter) {
          case 'fish': return recipe.ingredients.some(ing => 
            // Check if ingredient matches marine life names
            ing.toLowerCase().includes('tuna') || 
            ing.toLowerCase().includes('salmon') || 
            ing.toLowerCase().includes('shark') ||
            ing.toLowerCase().includes('fish') ||
            ing.toLowerCase().includes('lobster') ||
            ing.toLowerCase().includes('shrimp')
          );
          case 'veggie': return ingredients.includes('bean') || 
                                ingredients.includes('carrot') || 
                                ingredients.includes('cucumber') ||
                                ingredients.includes('onion');
          case 'mixed': return recipe.ingredients.length > 2;
          default: return true;
        }
      });
    }

    setFilteredRecipes(filtered);
  };

  const resetFilters = () => {
    setPriceFilter('all');
    setTasteFilter('all');
    setSourceFilter('all');
    setTypeFilter('all');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (priceFilter !== 'all') count++;
    if (tasteFilter !== 'all') count++;
    if (sourceFilter !== 'all') count++;
    if (typeFilter !== 'all') count++;
    return count;
  };

  const openRecipeModal = (recipe) => {
    setSelectedRecipe(recipe);
    setModalVisible(true);
  };

  const closeRecipeModal = () => {
    setModalVisible(false);
    setSelectedRecipe(null);
  };

  const renderFilterButton = (label, value, currentFilter, setFilter) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        currentFilter === value && styles.filterButtonActive
      ]}
      onPress={() => setFilter(value)}
    >
      <Text style={[
        styles.filterButtonText,
        currentFilter === value && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      {/* Price Filters */}
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>💰 Price:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {renderFilterButton('All', 'all', priceFilter, setPriceFilter)}
          {renderFilterButton('Budget', 'budget', priceFilter, setPriceFilter)}
          {renderFilterButton('Mid', 'mid', priceFilter, setPriceFilter)}
          {renderFilterButton('Premium', 'premium', priceFilter, setPriceFilter)}
          {renderFilterButton('Luxury', 'luxury', priceFilter, setPriceFilter)}
        </ScrollView>
      </View>

      {/* Taste Filters */}
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>👅 Taste:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {renderFilterButton('All', 'all', tasteFilter, setTasteFilter)}
          {renderFilterButton('Basic', 'basic', tasteFilter, setTasteFilter)}
          {renderFilterButton('Good', 'good', tasteFilter, setTasteFilter)}
          {renderFilterButton('Great', 'great', tasteFilter, setTasteFilter)}
          {renderFilterButton('Excellent', 'excellent', tasteFilter, setTasteFilter)}
        </ScrollView>
      </View>

      {/* Source Filters */}
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>🎯 Source:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {renderFilterButton('All', 'all', sourceFilter, setSourceFilter)}
          {renderFilterButton('Cooksta', 'cooksta', sourceFilter, setSourceFilter)}
          {renderFilterButton('Staff', 'staff', sourceFilter, setSourceFilter)}
          {renderFilterButton('Event', 'event', sourceFilter, setSourceFilter)}
          {renderFilterButton('Quest', 'quest', sourceFilter, setSourceFilter)}
        </ScrollView>
      </View>

      {/* Type Filters */}
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>🥘 Type:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {renderFilterButton('All', 'all', typeFilter, setTypeFilter)}
          {renderFilterButton('Fish', 'fish', typeFilter, setTypeFilter)}
          {renderFilterButton('Veggie', 'veggie', typeFilter, setTypeFilter)}
          {renderFilterButton('Mixed', 'mixed', typeFilter, setTypeFilter)}
        </ScrollView>
      </View>

      {/* Reset Button */}
      <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
        <Text style={styles.resetButtonText}>Reset All Filters</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRecipeItem = ({ item }) => {
    const thumbnailKey = item.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const thumbnailSource = recipeThumbnails[thumbnailKey];

    return (
      <TouchableOpacity
        style={styles.recipeCard}
        onPress={() => openRecipeModal(item)}
      >
        <View style={styles.recipeImageContainer}>
          {thumbnailSource ? (
            <Image source={thumbnailSource} style={styles.recipeImage} resizeMode="contain" />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>🍣</Text>
            </View>
          )}
        </View>
        
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.recipePrice}>${item.price_base} - ${item.price_max}</Text>
          <Text style={styles.recipeTaste}>Taste: {item.taste_base} - {item.taste_max}</Text>
          <Text style={styles.recipeServings}>{item.dish_base}-{item.dish_max} servings</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderRecipeModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={closeRecipeModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView>
            {selectedRecipe && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedRecipe.name}</Text>
                  <TouchableOpacity style={styles.closeButton} onPress={closeRecipeModal}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalImageContainer}>
                  <View style={styles.modalPlaceholderImage}>
                    <Text style={styles.modalPlaceholderText}>🍣</Text>
                    <Text style={styles.comingSoonText}>Image Coming Soon</Text>
                  </View>
                </View>

                <View style={styles.modalDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>💰 Price:</Text>
                    <Text style={styles.detailValue}>${selectedRecipe.price_base} - ${selectedRecipe.price_max}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>👅 Taste:</Text>
                    <Text style={styles.detailValue}>{selectedRecipe.taste_base} - {selectedRecipe.taste_max}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>🍽️ Servings:</Text>
                    <Text style={styles.detailValue}>{selectedRecipe.dish_base} - {selectedRecipe.dish_max}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>🥘 Ingredients:</Text>
                    <Text style={styles.detailValue}>{selectedRecipe.ingredients.join(', ')}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>🎯 How to Get:</Text>
                    <Text style={styles.detailValue}>{selectedRecipe.acquisition}</Text>
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Recipe Database</Text>
        <Text style={styles.subtitle}>
          Found: {filteredRecipes.length}/{recipeList.length} recipes
        </Text>
      </View>

      {/* Collapsible Filters */}
      <View style={styles.filterHeader}>
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setFiltersVisible(!filtersVisible)}
        >
          <Text style={styles.filterToggleText}>
            {filtersVisible ? '🔽' : '▶️'} Filters
            {getActiveFilterCount() > 0 && ` (${getActiveFilterCount()} active)`}
          </Text>
        </TouchableOpacity>
        
        {getActiveFilterCount() > 0 && (
          <TouchableOpacity style={styles.resetButtonSmall} onPress={resetFilters}>
            <Text style={styles.resetButtonSmallText}>Reset All</Text>
          </TouchableOpacity>
        )}
      </View>

      {filtersVisible && renderFilters()}

      {/* Recipe Grid */}
      <FlatList
        data={filteredRecipes}
        renderItem={renderRecipeItem}
        keyExtractor={(item, index) => `recipe-${index}`}
        numColumns={2}
        contentContainerStyle={styles.recipeGrid}
        showsVerticalScrollIndicator={false}
      />

      {/* Recipe Detail Modal */}
      {renderRecipeModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 16,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 4,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterToggle: {
    flex: 1,
  },
  filterToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  resetButtonSmall: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  resetButtonSmallText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  filtersContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#ff6b6b',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  recipeGrid: {
    padding: 8,
  },
  recipeCard: {
    flex: 1,
    backgroundColor: 'white',
    margin: 8,
    borderRadius: 12,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recipeImageContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  recipeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  placeholderText: {
    fontSize: 24,
  },
  recipeInfo: {
    alignItems: 'center',
  },
  recipeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  recipePrice: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    marginBottom: 2,
  },
  recipeTaste: {
    fontSize: 12,
    color: '#FF9800',
    marginBottom: 2,
  },
  recipeServings: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: width * 0.9,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  modalImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalPlaceholderImage: {
    width: 120,
    height: 120,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modalPlaceholderText: {
    fontSize: 40,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  modalDetails: {
    marginTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    width: 100,
    marginRight: 10,
  },
  detailValue: {
    fontSize: 16,
    color: '#666',
    flex: 1,
    flexWrap: 'wrap',
  },
});

export default RecipeScreen;

