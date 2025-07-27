// FILE: src/screens/RecipesScreen.js
// Clean rewrite with proper syntax from the start

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'; // Added useCallback import
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
  TextInput, // Keeping TextInput import, even if no explicit UI for search yet
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native'; // Used for navigating and accessing route params
import allRecipes from '../data/allRecipes'; // Your local recipes data
import { getAllMarineLife } from '../utils/marineLifeDatabase'; // Your local marine life data, for ingredient links
import RecipeCard from '../components/RecipeCard';


// Get the window dimensions for responsive sizing
const { width: windowWidth, height: windowHeight } = Dimensions.get('window');


const RecipesScreen = () => {
  const navigation = useNavigation(); // Hook for navigation
  const route = useRoute(); // Hook for accessing the current route's params

  // --- State Management ---
  const [recipes, setRecipes] = useState([]); // The full, unfiltered list of recipes from data source
  const [filteredRecipes, setFilteredRecipes] = useState([]); // The list currently displayed after filters are applied
  const [modalVisible, setModalVisible] = useState(false); // Controls visibility of the detail modal
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState(-1); // Index of the recipe currently selected for the modal
  const [showFilters, setShowFilters] = useState(false); // Controls visibility of the filter options dropdown

  // States for selected filter options (only Price and Taste, as per your request)
  const [activePriceFilter, setActivePriceFilter] = useState('All');
  const [activeTasteFilter, setActiveTasteFilter] = useState('All');
  const [searchText, setSearchText] = useState(''); // State for search input (if a search bar is added later)

  // Ref for direct FlatList manipulation (e.g., scrollToIndex)
  const swipeFlatListRef = useRef(null);

  // State and callback for FlatList's internal layout readiness
  // This is crucial for reliable scrollToIndex calls when the modal opens.
  const [isFlatListLayoutReady, setIsFlatListLayoutReady] = useState(false);
  const handleFlatListLayout = useCallback(() => {
    setIsFlatListLayoutReady(true);
  }, []);

  // --- Data Initialization and Memoized Filters ---

  // 1. useEffect: Loads all recipes data into 'recipes' state once on component mount.
  useEffect(() => {
    setRecipes(allRecipes); // Load all recipes into base state
    // filteredRecipes will be set by the filtering useEffect below after recipes are loaded
  }, []);

  // 2. useMemo: Dynamically generates available filter options (price ranges, taste ranges)
  // These are memoized to prevent unnecessary re-creation on every render.
  const priceRanges = useMemo(() => {
    // Define your price tiers explicitly. Adjust values based on your game's price distribution.
    return ['All', 'Low (<$50)', 'Medium ($50-$200)', 'High (>$200)'].sort();
  }, []);

  const tasteRanges = useMemo(() => {
    // Define your taste tiers explicitly. Adjust values based on your game's taste distribution.
    return ['All', 'Low (<50)', 'Medium (50-200)', 'High (>200)'].sort(); // Simplified to one 'High' tier
  }, []);

  // Memoized list of marine life names for checking clickable ingredients in detailed card
  const marineLifeNames = useMemo(() => {
    const allMarineLife = getAllMarineLife(); // Assuming this function exists and returns an array of marine life objects
    return new Set(allMarineLife.map(ml => ml.name.toLowerCase())); // Create a Set for efficient lookup
  }, []);

  // --- Filtering Logic ---

  // 3. Function: applyFilters - Core logic to filter 'recipes' based on current filter states.
  const applyFilters = useCallback(() => { // Using useCallback to memoize the function itself
    let currentFiltered = recipes; // Always start filtering from the original, full 'recipes' list

    // Apply search filter (if searchText has a value, e.g., from a future TextInput)
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
          case 'Medium ($50-$200)': return (currentPrice >= 50) && (currentPrice <= 200);
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

  // 4. useEffect: Triggers 'applyFilters' whenever filter criteria or base recipes change.
  useEffect(() => {
    applyFilters();
  }, [applyFilters]); // Dependency on applyFilters (wrapped in useCallback for stability)

  // Handle navigation from other screens (e.g., Marine Life card)
  useEffect(() => {
    const recipeNameToSearch = route.params?.recipeName;
    if (recipeNameToSearch) {
      setSearchText(recipeNameToSearch);
      // Clear the param to prevent re-triggering on screen focus
      navigation.setParams({ recipeName: undefined });
    }
  }, [route.params?.recipeName, navigation]);

  // --- Modal Scrolling Logic ---

  // 5. useEffect: Handles scrolling the FlatList in the modal to the selected item on open.
  // This is a robust approach for reliable initial scrolling when the modal opens.
  useEffect(() => {
    // Only attempt scroll if modal is visible, an item is selected, FlatList ref is ready, and layout is complete.
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
          // Fallback: Log error, but don't stop execution.
        }
      }, 25); // Small delay (25ms) as a final safeguard against timing issues.

      return () => clearTimeout(scrollTimeoutId); // Cleanup the timeout when the effect re-runs or component unmounts.
    }

    // Reset layout readiness when the modal closes, so it's fresh for the next open.
    if (!modalVisible) {
      console.log('*** SCROLL DEBUG ***: Modal closed. Resetting isFlatListLayoutReady: false.');
      setIsFlatListLayoutReady(false);
    }
  }, [modalVisible, selectedRecipeIndex, isFlatListLayoutReady, windowWidth, filteredRecipes, swipeFlatListRef]);


  // --- Modal Control Functions ---

  // Handler for opening the recipe detail modal when a card is clicked
  const openRecipeModal = (index) => {
    setSelectedRecipeIndex(index);
    setModalVisible(true);
  };

  // Handler for closing the recipe detail modal
  const closeRecipeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedRecipeIndex(-1); // Reset selected index when modal is closed
  }, []);

  // Handler for navigating to an ingredient's detail page from the RecipeCard
  const handleSelectIngredient = useCallback((ingredientName) => {
    closeRecipeModal();
    navigation.navigate('Marine Life', { marineLifeName: ingredientName });
  }, [navigation, closeRecipeModal]);
  // --- FlatList Item Renderers ---

  // Renders a single recipe card in the main grid view
  const renderRecipeCard = ({ item, index }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => openRecipeModal(index)}
    >
      <Image
        accessibilityIgnoresInvertColors={true}
        source={item.local_thumbnail} //Source has been pre-required
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
  const renderDetailedRecipeCard = useCallback(({ item }) => {
    const cardWidth = windowWidth * 0.9;
    const cardMargin = 4;

    return (
      <View
        style={{
          width: cardWidth,
          marginHorizontal: cardMargin,
          height: windowHeight * 0.7, // Set a consistent height for the card area
        }}
      >
        <RecipeCard
          recipe={item}
          onClose={closeRecipeModal}
          onSelectIngredient={handleSelectIngredient}
          marineLifeNames={marineLifeNames}
        />
      </View>
    );
  }, [closeRecipeModal, handleSelectIngredient, marineLifeNames]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recipe Collection</Text>
        <Text style={styles.subtitle}>
          Found: {filteredRecipes.length}/{recipes.length} recipes
        </Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search recipes or ingredients..."
        placeholderTextColor="#888"
        value={searchText}
        onChangeText={setSearchText}
        clearButtonMode="while-editing" // iOS clear button
      />

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
        <View style={styles.filterOptionsContainer}>
          {/* Price Range Filters */}
          <Text style={styles.filterCategoryLabel}>Price:</Text>
          <View style={styles.filterButtonsRow}>
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
          </View>

          {/* Taste Range Filters */}
          <Text style={styles.filterCategoryLabel}>Taste:</Text>
          <View style={styles.filterButtonsRow}>
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
          </View>
          {/* Note: Dish Type, Servings, and Acquisition filters are intentionally excluded as per your request */}
        </View>
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

          {/* The swipeable FlatList for detailed recipe cards */}
          {modalVisible && filteredRecipes.length > 0 && selectedRecipeIndex !== -1 && (
            <FlatList
              ref={swipeFlatListRef}
              onLayout={handleFlatListLayout}
              data={filteredRecipes}
              renderItem={renderDetailedRecipeCard}
              keyExtractor={(item, index) => item.name + index}
              horizontal
              pagingEnabled={false}
              snapToInterval={(windowWidth * 0.9) + (4 * 2)}
              snapToAlignment={'center'}
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={selectedRecipeIndex}
              removeClippedSubviews={true}
              initialNumToRender={5} // Changed from filteredRecipes.length to a small, fixed number for performance
              getItemLayout={(data, index) => {
                const itemFullWidth = (windowWidth * 0.9) + (4 * 2);
                return {
                  length: itemFullWidth,
                  offset: itemFullWidth * index,
                  index,
                };
              }}
              onMomentumScrollEnd={(event) => {
                const itemFullWidth = (windowWidth * 0.9) + (4 * 2);
                if (!itemFullWidth) return;
                const contentOffsetX = event.nativeEvent.contentOffset.x;
                const newIndex = Math.round(contentOffsetX / itemFullWidth);
                if (newIndex !== selectedRecipeIndex) {
                  setSelectedRecipeIndex(newIndex);
                }
              }}
              style={styles.modalFlatList}
              contentContainerStyle={styles.modalFlatListContent}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}; // Closing brace for RecipesScreen component

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
    // Removed flexDirection: 'row' and horizontal ScrollView.
    // This container will now lay out its children vertically by default.
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
    marginTop: 10, // Add some top margin to separate categories
    marginBottom: 5, // Space between label and its buttons
  },
  filterButtonsRow: {
    flexDirection: 'row', // Keep buttons within a category in a row
    flexWrap: 'wrap', // Allow buttons to wrap to the next line
    marginBottom: 10, // Space after each row of buttons
  },
  filterButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8, // Space between buttons in the same row
    marginBottom: 8, // Space below each button if they wrap
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
    flex: 1,
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
  modalFlatList: {
    flexGrow: 0,
    height: windowHeight * 0.75,
  },
  modalFlatListContent: {
    // This padding ensures the first and last items can be centered in the view
    // It calculates the space on either side of the card to center it.
    paddingHorizontal: (windowWidth - (windowWidth * 0.9) - (4 * 2)) / 2,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: 'white',
  },
});

export default RecipesScreen;