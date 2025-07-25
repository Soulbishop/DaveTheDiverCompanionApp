// FILE: src/screens/RecipesScreen.js
// Clean rewrite with proper syntax from the start

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  Dimensions,
  ScrollView, // Required for the horizontal filter options
  TextInput, // Added for potential future search filter, declared for applyFilters safety
} from 'react-native';
import allRecipes from '../data/allRecipes';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const RecipesScreen = () => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState(-1);
  const [showFilters, setShowFilters] = useState(false);
  
  // ADDED: searchText state variable for filter functionality
  const [searchText, setSearchText] = useState(''); 

  // New state for FlatList layout readiness for reliable scrolling in modal
  const [isFlatListLayoutReady, setIsFlatListLayoutReady] = useState(false); 
  
  // New states for filter selections (Price and Taste, excluding Servings and Acquisition as per request)
  const [activePriceFilter, setActivePriceFilter] = useState('All');
  const [activeTasteFilter, setActiveTasteFilter] = useState('All');
  
  const swipeFlatListRef = useRef(null);

  // Callback for FlatList's onLayout event: sets readiness flag for scrolling
  const handleFlatListLayout = () => {
    setIsFlatListLayoutReady(true);
  };

  // 1. useEffect for initial data loading (runs once on component mount)
  useEffect(() => {
    setRecipes(allRecipes); // Set the full, unfiltered list of recipes
    // Initial filtering will be handled by the applyFilters useEffect below
  }, []);

  // 2. Memoized filter options arrays, derived from the full recipes list
  // These are defined here at the top level of the functional component, outside of other hooks/functions.
  const priceRanges = React.useMemo(() => {
    // Basic price tiers: Adjust values as needed based on your data spread
    return ['All', 'Low (<$50)', 'Medium ($50-$200)', 'High (>$200)'].sort();
  }, []); // Static array of ranges, no dependency needed after initial render of component

  const tasteRanges = React.useMemo(() => {
    // Basic taste tiers: Adjust values as needed
    return ['All', 'Low (<50)', 'Medium (50-200)', 'High (>200)'].sort();
  }, []); // Static array of ranges

  // 3. Function to apply all active filters based on user selections
  // This must be defined directly within the functional component's top level.
  const applyFilters = () => {
    let currentFiltered = recipes; // Always start filtering from the original, full list

    // Apply search filter using the 'searchText' state (if a TextInput updates it)
    if (searchText) { 
      currentFiltered = currentFiltered.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (item.ingredients && item.ingredients.some(ing => ing.toLowerCase().includes(searchText.toLowerCase())))
      );
    }

    // Apply Price filter based on 'activePriceFilter' state
    if (activePriceFilter !== 'All') {
      currentFiltered = currentFiltered.filter(item => {
        const avgPrice = (item.price_base + item.price_max) / 2;
        if (activePriceFilter === 'Low (<$50)') return avgPrice < 50;
        if (activePriceFilter === 'Medium ($50-$200)') return avgPrice >= 50 && avgPrice <= 200;
        if (activePriceFilter === 'High (>$200)') return avgPrice > 200;
        return true; 
      });
    }

    // Apply Taste filter based on 'activeTasteFilter' state
    if (activeTasteFilter !== 'All') {
      currentFiltered = currentFiltered.filter(item => {
        const avgTaste = (item.taste_base + item.taste_max) / 2;
        if (activeTasteFilter === 'Low (<50)') return avgTaste < 50;
        if (activeTasteFilter === 'Medium (50-200)') return avgTaste >= 50 && avgTaste <= 200;
        if (activeTasteFilter === 'High (>200)') return avgTaste > 200;
        return true;
      });
    }

    // No filters for Servings or Acquisition as per your latest instruction.

    setFilteredRecipes(currentFiltered); // Update the filtered list displayed in UI
  };

  // 4. useEffect to trigger filtering whenever relevant filter criteria change
  // This ensures 'filteredRecipes' is updated dynamically based on user selections or initial data load.
  useEffect(() => {
    applyFilters();
  }, [recipes, searchText, activePriceFilter, activeTasteFilter]); // Dependencies: Re-run when base recipes or any filter state changes

  // 5. useEffect to handle scrolling the FlatList in the modal to the selected item
  // This is the most robust implementation for reliable initial scrolling.
  useEffect(() => {
    // Only attempt scroll if modal is visible, a recipe is selected, ref is available, AND FlatList layout is ready.
    if (modalVisible && selectedRecipeIndex !== -1 && swipeFlatListRef.current && isFlatListLayoutReady) {
      // Add a short timeout to give the FlatList's children a moment to render and measure
      const scrollTimeoutId = setTimeout(() => {
        try {
          const itemFullWidth = (windowWidth * 0.9) + (4 * 2); // Calculate item's full width (content + margins)
          console.log('*** SCROLL DEBUG ***: Attempting scroll to index (onLayout + timeout). Target index:', selectedRecipeIndex, 'Item width:', itemFullWidth);
          swipeFlatListRef.current.scrollToIndex({
            index: selectedRecipeIndex,
            animated: false, // Immediate jump to position
          });
          console.log('*** SCROLL DEBUG ***: Scroll command issued for index:', selectedRecipeIndex);
        } catch (e) {
          console.warn('*** SCROLL DEBUG ***: Failed to scroll to index (onLayout + timeout trigger):', e);
          console.error('*** SCROLL DEBUG ***: scrollToIndex error details:', { message: e.message, name: e.name, stack: e.stack });
          // Fallback if scrolling fails: log error but let the app continue.
        }
      }, 50); // 50ms delay, adjust if necessary for different devices/performance

      return () => clearTimeout(scrollTimeoutId); // Cleanup the timeout to prevent memory leaks/unwanted behavior
    }

    // Reset layout ready state when modal closes to re-trigger on next open
    if (!modalVisible) {
      console.log('*** SCROLL DEBUG ***: Modal closed. Resetting isFlatListLayoutReady: false.');
      setIsFlatListLayoutReady(false);
    }
  }, [modalVisible, selectedRecipeIndex, isFlatListLayoutReady, recipes.length]); // Dependencies for this effect

  // Handler for opening the recipe detail modal
  const openRecipeModal = (index) => {
    setSelectedRecipeIndex(index);
    setModalVisible(true);
  };

  // Handler for closing the recipe detail modal
  const closeRecipeModal = () => {
    setModalVisible(false);
    setSelectedRecipeIndex(-1); 
  };

  // Renders a single recipe card in the main grid
  const renderRecipeCard = ({ item, index }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => openRecipeModal(index)}
    >
      <Image
        source={item.local_thumbnail}
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

  // Renders the detailed content for a single recipe card in the modal
  const renderDetailedRecipeCard = ({ item }) => { 
    // IMPORTANT: Check if 'item' is valid before rendering its properties.
    // This is a crucial safety check for FlatList's initial rendering quirks.
    if (!item) {
      // Return a placeholder that maintains the expected dimensions for FlatList's layout calculations
      const CARD_FULL_WIDTH_PLACEHOLDER = windowWidth * 0.9;
      const CARD_MARGIN_HORIZONTAL_PLACEHOLDER = 4;
      return (
        <View style={[
          styles.detailedRecipeCard, // Inherit basic card styles for consistency
          {
            width: CARD_FULL_WIDTH_PLACEHOLDER,
            marginHorizontal: CARD_MARGIN_HORIZONTAL_PLACEHOLDER,
            minHeight: 500, // Ensure height is consistent with detailedRecipeCard's minHeight
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
          styles.detailedRecipeCard,
          {
            width: CARD_FULL_WIDTH,
            marginHorizontal: CARD_MARGIN_HORIZONTAL,
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
              {item.ingredients && item.ingredients.length > 0 ? item.ingredients.join(', ') : 'N/A'}
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
          
          {modalVisible && filteredRecipes.length > 0 && selectedRecipeIndex !== -1 && (
             <FlatList
              ref={swipeFlatListRef}
              onLayout={handleFlatListLayout} // Trigger onLayout to set isFlatListLayoutReady
              data={filteredRecipes}
              renderItem={renderDetailedRecipeCard}
              keyExtractor={(item, index) => item.name + index}
              horizontal
              pagingEnabled={false} // Disable default paging
              snapToInterval={ (windowWidth * 0.9) + (4 * 2) } // Actual total item width: (windowWidth * 0.9) + 8
              snapToAlignment={'center'} // Snap item to center of FlatList's viewport
              decelerationRate="fast" // Improves snap feeling
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
    alignSelf: 'center', // Center label vertically
    minWidth: 80, // Give some space for the label
  },
  filterButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginHorizontal: 4,
    alignSelf: 'center', // Center button vertically
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
  },
  closeButton: {
    backgroundColor: '#ff6b6b',
    padding: 8,
    borderRadius: 20,
    width: 36,
    height: 36,
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
