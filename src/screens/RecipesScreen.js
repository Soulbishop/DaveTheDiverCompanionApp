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
import { useNavigation } from '@react-navigation/native'; // Used for navigating from ingredient links
import allRecipes from '../data/allRecipes'; // Your local recipes data
import { getAllMarineLife } from '../utils/marineLifeDatabase'; // Your local marine life data, for ingredient links


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
  const [searchText, setSearchText] = useState(''); // State for search input (if a search bar is added later)

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

  // 4. useEffect: Triggers 'applyFilters' whenever filter criteria or base recipes change.
  useEffect(() => {
    applyFilters();
  }, [applyFilters]); // Dependency on applyFilters (wrapped in useCallback for stability)

  // --- Modal Scrolling Logic ---

  // 5. useEffect: Handles scrolling the FlatList in the modal to the selected item on open.
  // This is a robust approach for reliable initial scrolling when the modal opens.
  useEffect(() => {
    // Only attempt scroll if modal is visible, an item is selected, FlatList ref is ready, AND layout is complete.
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
      }, 50); // Small delay (50ms) as a final safeguard against timing issues.

      return () => clearTimeout(scrollTimeoutId); // Cleanup the timeout when the effect re-runs or component unmounts.
    }

    // Reset layout readiness when the modal closes, so it's fresh for the next open.
    if (!modalVisible) {
      console.log('*** SCROLL DEBUG ***: Modal closed. Resetting isFlatListLayoutReady: false.');
      setIsFlatListLayoutReady(false);
    }
  }, [modalVisible, selectedRecipeIndex, isFlatListLayoutReady, recipes.length]); // Dependencies for this effect.

  // --- Modal Control Functions ---

  // Handler for opening the recipe detail modal when a card is clicked
  const openRecipeModal = (index) => {
    setSelectedRecipeIndex(index);
    setModalVisible(true);
  };

  // Handler for closing the recipe detail modal
  const closeRecipeModal = () => {
    setModalVisible(false);
    setSelectedRecipeIndex(-1); // Reset selected index when modal is closed
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

