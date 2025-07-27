// FILE: src/screens/RecipesScreen.js
// Clean rewrite with proper syntax from the start

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  TextInput,
  LayoutAnimation, // Import LayoutAnimation for smooth transitions
  Platform, // For LayoutAnimation on Android
  UIManager, // For LayoutAnimation on Android
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import allRecipes from '../data/allRecipes';
import { getAllMarineLife } from '../utils/marineLifeDatabase';
import RecipeCard from '../components/RecipeCard';

// NEW: Import our ToCatchListContext for global state management
import { useToCatchList } from '../context/ToCatchListContext';

// Enable LayoutAnimation on Android (if not already enabled globally in App.js)
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

const RecipesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // NEW: Destructure the toCatchList and dispatch function from our context
  const { dispatchToCatchList, TO_CATCH_ACTIONS } = useToCatchList();

  // --- State Management ---
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState(-1);
  const [showFilters, setShowFilters] = useState(false);
  const [activePriceFilter, setActivePriceFilter] = useState('All');
  const [activeTasteFilter, setActiveTasteFilter] = useState('All');
  const [searchText, setSearchText] = useState('');

  // NEW: State for multi-select mode
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  // NEW: State to store selected recipes for batch adding
  const [selectedRecipesForBatch, setSelectedRecipesForBatch] = useState({}); // Use object for efficient lookup: { recipeName: true }

  const swipeFlatListRef = useRef(null);
  const [isFlatListLayoutReady, setIsFlatListLayoutReady] = useState(false);
  const handleFlatListLayout = useCallback(() => {
    setIsFlatListLayoutReady(true);
  }, []);

  // --- Data Initialization and Memoized Filters ---
  useEffect(() => {
    setRecipes(allRecipes);
  }, []);

  const priceRanges = useMemo(() => {
    return ['All', 'Low (<$50)', 'Medium ($50-$200)', 'High (>$200)'].sort();
  }, []);

  const tasteRanges = useMemo(() => {
    return ['All', 'Low (<50)', 'Medium (50-200)', 'High (>200)'].sort();
  }, []);

  const marineLifeNames = useMemo(() => {
    const allMarineLife = getAllMarineLife();
    return new Set(allMarineLife.map(ml => ml.name.toLowerCase()));
  }, []);

  // --- Filtering Logic ---
  const applyFilters = useCallback(() => {
    let currentFiltered = recipes;

    if (searchText) {
      currentFiltered = currentFiltered.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (item.ingredients && item.ingredients.some(ing => ing.toLowerCase().includes(searchText.toLowerCase())))
      );
    }

    if (activePriceFilter !== 'All') {
      currentFiltered = currentFiltered.filter(item => {
        const currentPrice = (item.price_base + item.price_max) / 2;
        switch (activePriceFilter) {
          case 'Low (<$50)': return currentPrice < 50;
          case 'Medium ($50-$200)': return (currentPrice >= 50) && (currentPrice <= 200);
          case 'High (>$200)': return currentPrice > 200;
          default: return true;
        }
      });
    }

    if (activeTasteFilter !== 'All') {
      currentFiltered = currentFiltered.filter(item => {
        const currentTaste = (item.taste_base + item.taste_max) / 2;
        switch (activeTasteFilter) {
          case 'Low (<50)': return currentTaste < 50;
          case 'Medium (50-200)': return currentTaste >= 50 && currentTaste <= 200;
          case 'High (>200)': return currentTaste > 200;
          default: return true;
        }
      });
    }

    setFilteredRecipes(currentFiltered);
  }, [recipes, searchText, activePriceFilter, activeTasteFilter]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Handle navigation from other screens (e.g., Marine Life card)
  useEffect(() => {
    const recipeNameToSearch = route.params?.recipeName;
    if (recipeNameToSearch) {
      setSearchText(recipeNameToSearch);
      navigation.setParams({ recipeName: undefined });
    }
  }, [route.params?.recipeName, navigation]);

  // --- Modal Scrolling Logic ---
  useEffect(() => {
    if (modalVisible && selectedRecipeIndex !== -1 && swipeFlatListRef.current && isFlatListLayoutReady) {
      const scrollTimeoutId = setTimeout(() => {
        try {
          const itemFullWidth = (windowWidth * 0.9) + (4 * 2);
          console.log('*** SCROLL DEBUG ***: Attempting scroll to index (onLayout + timeout). Target index:', selectedRecipeIndex, 'Item width:', itemFullWidth);
          swipeFlatListRef.current.scrollToIndex({
            index: selectedRecipeIndex,
            animated: false,
          });
          console.log('*** SCROLL DEBUG ***: Scroll command issued for index:', selectedRecipeIndex);
        } catch (e) {
          console.warn('*** SCROLL DEBUG ***: Failed to scroll to index (onLayout + timeout trigger):', e);
          console.error('*** SCROLL DEBUG ***: scrollToIndex error details:', { message: e.message, name: e.name, stack: e.stack });
        }
      }, 25);
      return () => clearTimeout(scrollTimeoutId);
    }
    if (!modalVisible) {
      console.log('*** SCROLL DEBUG ***: Modal closed. Resetting isFlatListLayoutReady: false.');
      setIsFlatListLayoutReady(false);
    }
  }, [modalVisible, selectedRecipeIndex, isFlatListLayoutReady, windowWidth, filteredRecipes, swipeFlatListRef]);


  // --- Modal Control Functions ---
  const openRecipeModal = (index) => {
    setSelectedRecipeIndex(index);
    setModalVisible(true);
  };

  const closeRecipeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedRecipeIndex(-1);
  }, []);

  const handleSelectIngredient = useCallback((ingredientName) => {
    closeRecipeModal();
    navigation.navigate('Marine Life', { marineLifeName: ingredientName });
  }, [navigation, closeRecipeModal]);


  // --- NEW: To Catch List Functions ---

  // Function to add a single recipe to the To-Catch list
  const addRecipeToToCatchList = useCallback((recipe) => {
    dispatchToCatchList({ type: TO_CATCH_ACTIONS.ADD_RECIPE, payload: { recipe } });
    // Optional: Provide visual feedback (e.g., a toast message)
    // console.log(`Added ${recipe.name} to To Catch List`);
  }, [dispatchToCatchList, TO_CATCH_ACTIONS]);

  // Function to toggle multi-select mode
  const toggleMultiSelectMode = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // Smooth animation
    setIsMultiSelectMode(prev => {
      if (prev) { // If turning off multi-select, clear selections
        setSelectedRecipesForBatch({});
      }
      return !prev;
    });
  };

  // Function to toggle selection of a recipe in multi-select mode
  const toggleRecipeSelection = useCallback((recipe) => {
    setSelectedRecipesForBatch(prevSelected => {
      const newSelected = { ...prevSelected };
      if (newSelected[recipe.name]) {
        delete newSelected[recipe.name]; // Deselect
      } else {
        newSelected[recipe.name] = recipe; // Select
      }
      return newSelected;
    });
  }, []);

  // Function to add all currently selected recipes to the To-Catch list
  const addSelectedToToCatchList = useCallback(() => {
    Object.values(selectedRecipesForBatch).forEach(recipe => {
      addRecipeToToCatchList(recipe);
    });
    setSelectedRecipesForBatch({}); // Clear selections after adding
    setIsMultiSelectMode(false); // Exit multi-select mode
  }, [selectedRecipesForBatch, addRecipeToToCatchList]);

  // Function to clear all batch selections without adding
  const clearBatchSelection = useCallback(() => {
    setSelectedRecipesForBatch({});
  }, []);


  // --- FlatList Item Renderers ---

  // Renders a single recipe card in the main grid view
  const renderRecipeCard = ({ item, index }) => {
    const isSelected = selectedRecipesForBatch[item.name]; // Check if recipe is selected for batch add

    return (
      <TouchableOpacity
        style={[styles.recipeCard, isSelected && styles.selectedRecipeCard]} // Apply selected style
        onPress={() => isMultiSelectMode ? toggleRecipeSelection(item) : openRecipeModal(index)}
        onLongPress={() => toggleMultiSelectMode()} // Long press to enter multi-select mode
      >
        {isMultiSelectMode && (
          <View style={styles.checkboxContainer}>
            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
              {isSelected && <Text style={styles.checkboxCheck}>✓</Text>}
            </View>
          </View>
        )}
        <Image
          accessibilityIgnoresInvertColors={true}
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
        {/* NEW: Individual "Add to List" button for single recipe */}
        {!isMultiSelectMode && ( // Only show if not in multi-select mode
          <TouchableOpacity
            style={styles.addToListButton}
            onPress={() => addRecipeToToCatchList(item)}
          >
            <Text style={styles.addToListButtonText}>Add to List</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  // Renders the detailed content for a single recipe card within the swipeable modal
  const renderDetailedRecipeCard = useCallback(({ item }) => {
    const cardWidth = windowWidth * 0.9;
    const cardMargin = 4;

    return (
      <View
        style={{
          width: cardWidth,
          marginHorizontal: cardMargin,
          height: windowHeight * 0.7,
        }}
      >
        <RecipeCard
          recipe={item}
          onClose={closeRecipeModal}
          onSelectIngredient={handleSelectIngredient}
          marineLifeNames={marineLifeNames}
          // NEW: Pass the addRecipeToToCatchList function to the RecipeCard for modal button
          onAddRecipeToToCatchList={addRecipeToToCatchList}
        />
      </View>
    );
  }, [closeRecipeModal, handleSelectIngredient, marineLifeNames, addRecipeToToCatchList]);

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
        clearButtonMode="while-editing"
      />

      {/* NEW: Multi-select toggle button */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={styles.multiSelectToggleButton}
          onPress={toggleMultiSelectMode}
        >
          <Text style={styles.multiSelectToggleButtonText}>
            {isMultiSelectMode ? 'Exit Multi-Select' : 'Multi-Select'}
          </Text>
        </TouchableOpacity>

        {isMultiSelectMode && (
          <>
            <TouchableOpacity
              style={[styles.batchActionButton, Object.keys(selectedRecipesForBatch).length === 0 && styles.batchActionButtonDisabled]}
              onPress={addSelectedToToCatchList}
              disabled={Object.keys(selectedRecipesForBatch).length === 0}
            >
              <Text style={styles.batchActionButtonText}>
                Add {Object.keys(selectedRecipesForBatch).length} Selected
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.batchActionButton}
              onPress={clearBatchSelection}
            >
              <Text style={styles.batchActionButtonText}>Clear Selection</Text>
            </TouchableOpacity>
          </>
        )}
      </View>


      <TouchableOpacity
        style={styles.filterHeader}
        onPress={() => setShowFilters(!showFilters)}
      >
        <Text style={styles.filterToggleText}>
          🔽 Filters {showFilters ? '(Hide)' : '(Show)'}
        </Text>
      </TouchableOpacity>

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
                style={[styles.filterButton, activeTasteFilter === range && styles.activeTasteFilterButton]}
                onPress={() => setActiveTasteFilter(range)}
              >
                <Text style={[styles.filterButtonText, activeTasteFilter === range && styles.activeTasteFilterButtonText]}>
                  {range}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
              initialNumToRender={5}
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
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginHorizontal: 16,
    marginVertical: 10, // Added vertical margin for spacing
    backgroundColor: 'white',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  multiSelectToggleButton: {
    backgroundColor: '#6c757d', // Grey color for multi-select toggle
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  multiSelectToggleButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  batchActionButton: {
    backgroundColor: '#28a745', // Green for add selected
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  batchActionButtonDisabled: {
    backgroundColor: '#90ee90', // Lighter green when disabled
  },
  batchActionButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
    marginTop: 10,
    marginBottom: 5,
  },
  filterButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  filterButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
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
    position: 'relative', // Needed for absolute positioning of checkbox
  },
  selectedRecipeCard: {
    borderColor: '#0066cc', // Highlight selected cards
    borderWidth: 2,
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
  // NEW: Styles for the individual "Add to List" button on the card
  addToListButton: {
    backgroundColor: '#17a2b8', // Info blue color
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'center', // Center the button
  },
  addToListButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // NEW: Styles for the multi-select checkbox
  checkboxContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1, // Ensure it's above other content
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  checkboxSelected: {
    backgroundColor: '#0066cc',
  },
  checkboxCheck: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
    paddingHorizontal: (windowWidth - (windowWidth * 0.9) - (4 * 2)) / 2,
  },
});

export default RecipesScreen;
