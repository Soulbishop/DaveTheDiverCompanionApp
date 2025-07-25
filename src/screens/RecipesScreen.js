// FILE: src/screens/RecipesScreen.js
// Clean rewrite with proper syntax from the start

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  ScrollView, // Required for the horizontal filter options
  Dimensions,
  TextInput, // Keeping TextInput import, just in case searchText is used with it later
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; // For navigating to Marine Life screen from ingredients
import allRecipes from '../data/allRecipes';
import { getAllMarineLife } from '../utils/marineLifeDatabase'; // For linking ingredients to marine life details


// Get the window dimensions for responsive sizing
const { width: windowWidth, height: windowHeight } = Dimensions.get('window');


const RecipesScreen = () => {
  const navigation = useNavigation(); // Hook for navigation within React Navigation stack

  // --- State Management ---
  const [recipes, setRecipes] = useState([]); // The full, unfiltered list of recipes from data source
  const [filteredRecipes, setFilteredRecipes] = useState([]); // The list currently displayed after filters are applied
  const [modalVisible, setModalVisible] = useState(false); // Controls visibility of the detail modal
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState(-1); // Index of the recipe currently selected for the modal
  const [showFilters, setShowFilters] = useState(false); // Controls visibility of the filter options dropdown
  
  // States for selected filter options (only Price and Taste, as per your request)
  const [activePriceFilter, setActivePriceFilter] = useState('All');
  const [activeTasteFilter, setActiveTasteFilter] = useState('All');
  const [searchText, setSearchText] = useState(''); // Declared for applyFilters, even if no TextInput UI is present yet

  // Ref for direct FlatList manipulation (e.g., scrollToIndex)
  const swipeFlatListRef = useRef(null);

  // State and callback for FlatList's internal layout readiness
  // This is crucial for reliable scrollToIndex calls when the modal opens.
  const [isFlatListLayoutReady, setIsFlatListLayoutReady] = useState(false); 
  const handleFlatListLayout = () => {
    setIsFlatListLayoutReady(true);
  };

  // --- Data Initialization and Memoized Filters ---

  // 1. useEffect: Loads all recipes data into 'recipes' state once on component mount.
  useEffect(() => {
    setRecipes(allRecipes); 
  }, []);

  // 2. useMemo: Dynamically generates available filter options (price ranges, taste ranges)
  const priceRanges = useMemo(() => {
    // These are predefined categories. Adjust values to fit your game's price distribution.
    return ['All', 'Low (<$50)', 'Medium ($50-$200)', 'High (>$200)'].sort();
  }, []); 

  const tasteRanges = useMemo(() => {
    // These are predefined categories. Adjust values to fit your game's taste distribution.
    return ['All', 'Low (<50)', 'Medium (50-200)', 'High (>200)'].sort(); 
  }, []);

  // Memoized list of marine life names for checking clickable ingredients in detailed card
  const marineLifeNames = useMemo(() => {
    const allMarineLife = getAllMarineLife(); // Assuming this function exists and returns an array of marine life objects
    return new Set(allMarineLife.map(ml => ml.name.toLowerCase())); // Create a Set for efficient lookup
  }, []); 

  // --- Filtering Logic ---

  // 3. Function: applyFilters - Core logic to filter 'recipes' based on current filter states.
  const applyFilters = React.useCallback(() => { // Using useCallback to memoize the function itself
    let currentFiltered = recipes; // Always start filtering from the original, full 'recipes' list

    // Apply search filter (if searchText has a value)
    if (searchText) { 
      currentFiltered = currentFiltered.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (item.ingredients && item.ingredients.some(ing => ing.toLowerCase().includes(searchText.toLowerCase())))
      );
    }

    // Apply Price filter
    if (activePriceFilter !== 'All') {
      currentFiltered = currentFiltered.filter(item => {
        const currentPrice = (item.price_base + item.price_max) / 2; // Using average price for filtering logic
        switch (activePriceFilter) {
          case 'Low (<$50)': return currentPrice < 50;
          case 'Medium ($50-$200)': return currentPrice >= 50 && currentPrice <= 200;
          case 'High (>$200)': return currentPrice > 200;
          default: return true; 
        }
      });
    }

    // Apply Taste filter
    if (activeTasteFilter !== 'All') {
      currentFiltered = currentFiltered.filter(item => {
        const currentTaste = (item.taste_base + item.taste_max) / 2; // Using average taste for filtering logic
        switch (activeTasteFilter) {
          case 'Low (<50)': return currentTaste < 50;
          case 'Medium (50-200)': return currentTaste >= 50 && currentTaste <= 200;
          case 'High (>200)': return currentTaste > 200; // Simplified to one 'High' tier for taste
          default: return true;
        }
      });
    }

    // No filters for Dish Type, Servings, or Acquisition Method are implemented here, as per your request.

    setFilteredRecipes(currentFiltered); // Update the state that drives the displayed FlatList
  }, [recipes, searchText, activePriceFilter, activeTasteFilter]); // Dependencies for applyFilters

  // 4. useEffect: Triggers 'applyFilters' whenever relevant filter criteria or base recipes change.
  useEffect(() => {
    applyFilters();
  }, [applyFilters]); // Dependency on applyFilters (wrapped in useCallback for stability)

  // --- Modal Control Functions ---

  // Handler for opening the recipe detail modal when a card is clicked
  const openRecipeModal = (index) => {
    setSelectedRecipeIndex(index);
    setModalVisible(true);
  };

  // Handler for closing the recipe detail modal
  const closeRecipeModal = () => {
    setModalVisible(false);
    setSelectedRecipeIndex(-1); // Reset selected index when modal closes
  };

  // --- FlatList Item Renderers ---

  // Renders a single recipe card in the main grid view
  const renderRecipeCard = ({ item, index }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => openRecipeModal(index)}
    >
      <Image
        source={item.local_thumbnail} // Assumed to be pre-required images
        style={styles.recipeImage}
      />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeName}>{item.name}</Text>
        <Text style={styles.recipePrice}>
          ${item.price_base} - ${item.price_max}
        </Text>
        <Text style={styles.recipeTaste}>
          Taste: {item.taste_base} - {item.taste_max}
        </Text>
        <Text style={styles.recipeServings}>
          {item.dish_base}-{item.dish_max} servings
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Renders the detailed content for a single recipe card within the swipeable modal
  const renderDetailedRecipeCard = ({ item }) => { 
    // CRITICAL SAFETY CHECK: If 'item' is undefined or null during rendering, display a placeholder.
    if (!item) {
      const CARD_FULL_WIDTH_PLACEHOLDER = windowWidth * 0.9;
      const CARD_MARGIN_HORIZONTAL_PLACEHOLDER = 4;
      return (
        <View style={[
          styles.detailedRecipeCard, 
          {
            width: CARD_FULL_WIDTH_PLACEHOLDER,
            marginHorizontal: CARD_MARGIN_HORIZONTAL_PLACEHOLDER,
            minHeight: 500, // Keep height consistent with the main card style
            justifyContent: 'center',
            alignItems: 'center'
          }
        ]}>
          <Text style={{ color: '#888', fontSize: 16 }}>Loading recipe details...</Text>
        </View>
      );
    }

    const CARD_FULL_WIDTH = windowWidth * 0.9; 
    const CARD_MARGIN_HORIZONTAL = 4; 

    return (
      <View
        style={[
          styles.detailedRecipeCard, // Base styling for the detailed card background, shadow, etc.
          {
            width: CARD_FULL_WIDTH, // Explicitly set width to match modal's available space
            marginHorizontal: CARD_MARGIN_HORIZONTAL, // Apply desired spacing around the card
          },
        ]}
      >
        <View style={styles.recipeImageContainer}>
          <Image
            source={item.local_thumbnail}
            style={styles.recipeDetailImage}
            onError={(e) => console.warn("Failed to load recipe image:", item.name, e.nativeEvent.error)} // Enhanced error logging
          />
        </View>
        <View style={styles.recipeDetailsContainer}>
          <View style={styles.recipeStatsRow}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statLabel}>Price:</Text>
            <Text style={styles.statValue}>
              ${item.price_base} - ${item.price_max}
            </Text>
          </View>
          
          <View style={styles.recipeStatsRow}>
            <Text style={styles.statIcon}>👅</Text>
            <Text style={styles.statLabel}>Taste:</Text>
            <Text style={styles.statValue}>
              {item.taste_base} - {item.taste_max}
            </Text>
          </View>
          
          <View style={styles.recipeStatsRow}>
            <Text style={styles.statIcon}>🍽️</Text>
            <Text style={styles.statLabel}>Servings:</Text>
            <Text style={styles.statValue}>
              {item.dish_base}-{item.dish_max} servings
            </Text>
          </View>
          
          <View style={styles.ingredientsSection}>
            <Text style={styles.statIcon}>🥘</Text>
            <Text style={styles.statLabel}>Ingredients:</Text>
            <Text style={styles.ingredientsList}>
              {item.ingredients && item.ingredients.length > 0 // Robust null/empty array check for ingredients
                ? item.ingredients.map((ingredient, idx) => (
                    // Make ingredients clickable to navigate to MarineLifeScreen
                    <Text key={idx} style={marineLifeNames.has(ingredient.toLowerCase()) ? styles.ingredientLink : styles.ingredientText}
                          onPress={marineLifeNames.has(ingredient.toLowerCase()) ? () => {
                            closeRecipeModal(); // Close recipe modal before navigating away
                            navigation.navigate('Marine Life', { screen: 'Marine Life', params: { marineLifeName: ingredient } });
                          } : undefined}>
                      {ingredient}
                      {idx < item.ingredients.length - 1 && ', '}
                    </Text>
                  ))
                : 'N/A'}
            </Text>
          </View>
          
          <View style={styles.acquisitionSection}>
            <Text style={styles.statIcon}>🎯</Text>
            <Text style={styles.statLabel}>How to Get:</Text>
            <Text style={styles.acquisitionText}>{item.acquisition || 'N/A'}</Text> 
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recipe Collection</Text>
        <Text style={styles.subtitle}>
          Found: {filteredRecipes.length}/{recipes.length} recipes
        </Text>
      </View>

      <TouchableOpacity
        style={styles.filterHeader}
        onPress={() => setShowFilters(!showFilters)}
      >
        <Text style={styles.filterToggleText}>
          🔽 Filters {showFilters ? '(Hide)' : '(Show)'}
        </Text>
      </TouchableOpacity>

      {/* Filter Options UI, conditionally rendered based on showFilters state */}
      {showFilters && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptionsContainer}>
          {/* Price Range Filters */}
          <Text style={styles.filterCategoryLabel}>Price:</Text>
          {priceRanges.map(range => (
            <TouchableOpacity
              key={range}
              style={[styles.filterButton, activePriceFilter === range && styles.activeFilterButton]}
              onPress={() => setActivePriceFilter(range)}
            >
              <Text style={[styles.filterButtonText, activePriceFilter === range && styles.activeFilterButtonText]}>
                {range}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Taste Range Filters */}
          <Text style={styles.filterCategoryLabel}>Taste:</Text>
          {tasteRanges.map(range => (
            <TouchableOpacity
              key={range}
              style={[styles.filterButton, activeTasteFilter === range && styles.activeFilterButton]}
              onPress={() => setActiveTasteFilter(range)}
            >
              <Text style={[styles.filterButtonText, activeTasteFilter === range && styles.activeFilterButtonText]}>
                {range}
              </Text>
            </TouchableOpacity>
          ))}
          {/* Note: Other filters (Dish Type, Servings, Acquisition) are intentionally excluded as per your request */}
        </ScrollView>
      )}

      <FlatList
        data={filteredRecipes}
        renderItem={renderRecipeCard}
        keyExtractor={(item, index) => item.name + index}
        numColumns={2}
        style={styles.recipeGridContainer}
        contentContainerStyle={styles.recipeGrid}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeRecipeModal}
      >
        <View style={styles.modalOverlay}>
          {/* Modal Header Fixed at the top, outside the scrollable FlatList content */}
          <View style={styles.modalHeaderFixed}>
            <Text style={styles.modalTitle}>
              {selectedRecipeIndex !== -1 ? filteredRecipes[selectedRecipeIndex]?.name : 'Recipe Details'}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeRecipeModal}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {/* The swipeable FlatList for detailed recipe cards */}
          {modalVisible && filteredRecipes.length > 0 && selectedRecipeIndex !== -1 && (
             <FlatList
              ref={swipeFlatListRef}
              onLayout={handleFlatListLayout} // Trigger onLayout to set isFlatListLayoutReady
              data={filteredRecipes}
              renderItem={renderDetailedRecipeCard} // Uses the robust detailed card renderer
              keyExtractor={(item, index) => item.name + index}
              horizontal // Horizontal scrolling
              pagingEnabled={false} // Disable default paging; using snapToInterval for control
              snapToInterval={ (windowWidth * 0.9) + (4 * 2) } // Precise snap: Card content (90%) + total margins (4*2=8px)
              snapToAlignment={'center'} // Snaps item to the center of the FlatList's viewport
              decelerationRate="fast" // Improves the feel of snapping
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={selectedRecipeIndex} // Hint for initial scroll
              initialNumToRender={filteredRecipes.length > 0 ? filteredRecipes.length : 1} // Render all items for robust measurement
              getItemLayout={(data, index) => {
                const itemFullWidth = (windowWidth * 0.9) + (4 * 2); // Matches snapToInterval
                return {
                  length: itemFullWidth,
                  offset: itemFullWidth * index,
                  index,
                };
              }}
              onScrollEndDrag={(event) => {
                const itemFullWidth = (windowWidth * 0.9) + (4 * 2); // Matches snapToInterval
                const contentOffsetX = event.nativeEvent.contentOffset.x;
                const newIndex = Math.round(contentOffsetX / itemFullWidth);
                if (newIndex !== selectedRecipeIndex) {
                  setSelectedRecipeIndex(newIndex);
                }
              }}
              style={styles.modalFlatList}
              contentContainerStyle={{ alignItems: 'center' }}
            />
          )}
        </View>
      </Modal>
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
    marginBottom: 4,
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
  filterToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  filterOptionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterCategoryLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginRight: 10,
    alignSelf: 'center', 
    minWidth: 50, 
  },
  filterButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginHorizontal: 4,
    alignSelf: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    color: '#333',
    fontSize: 13,
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: 'white',
  },
  recipeGridContainer: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  recipeGrid: {
    paddingBottom: 20,
  },
  recipeCard: {
    flex: 1,
    margin: 4,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recipeImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  recipeInfo: {
    alignItems: 'center',
  },
  recipeName: {
    fontSize: 14,
    fontWeight: 'bold',
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
  modalHeaderFixed: {
    position: 'absolute',
    top: windowHeight * 0.1,
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1, 
    textAlign: 'center',
    marginLeft: 32, 
    marginRight: 32, 
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18, 
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalFlatList: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 60,
  },
  modalScrollContent: {
    flexGrow: 1, 
    justifyContent: 'flex-start',
    backgroundColor: 'white', 
    paddingBottom: 20, 
  },
  detailedRecipeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 500,
  },
  recipeImageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeDetailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  recipeDetailsContainer: {
    flex: 1,
    paddingTop: 8,
  },
  recipeStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  statIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
    minWidth: 80,
  },
  statValue: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  ingredientsSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  ingredientsList: {
    fontSize: 16,
    color: '#0066cc',
    flex: 1,
    flexWrap: 'wrap',
  },
  ingredientLink: {
    color: '#0066cc',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  ingredientText: {
    color: '#666',
  },
  acquisitionSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
  },
  acquisitionText: {
    fontSize: 16,
    color: '#666',
    flex: 1,
    flexWrap: 'wrap',
  },
});

export default RecipesScreen;
