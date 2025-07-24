// FILE: src/screens/RecipesScreen.js



import React, { useState, useEffect, useRef } from 'react';

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

  // Removed TextInput as it's not present in this file's current version

} from 'react-native';

import { useNavigation } from '@react-navigation/native';

import allRecipes from '../data/allRecipes'; // This will now contain pre-required images

import { getAllMarineLife } from '../utils/marineLifeDatabase';





// Get the window width for dynamic card sizing

const { width: windowWidth } = Dimensions.get('window');





// Removed: getRecipeImagePath function is no longer needed

// const getRecipeImagePath = (recipeName) => {

//   const filename = recipeName

//     .toLowerCase()

//     .replace(/[^a-z0-9]/g, '_')

//     .replace(/_+/g, '_')

//     .replace(/^_|_$/g, '') + '.png';

//   try {

//     return require(`../../assets/recipe_images/${filename}`);

//   } catch (error) {

//     console.warn(`Recipe image not found for: ${recipeName} (${filename})`);

//     return null;

//   }

// };





const RecipesScreen = () => {

  const navigation = useNavigation();

  // State management

  const [recipeList, setRecipeList] = useState(allRecipes);

  const [filteredRecipes, setFilteredRecipes] = useState(allRecipes);

  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState(-1);

  const [modalVisible, setModalVisible] = useState(false);

  const [filtersVisible, setFiltersVisible] = useState(false);

  // Filter states

  const [priceFilter, setPriceFilter] = useState('all');

  const [tasteFilter, setTasteFilter] = useState('all');

  const [sourceFilter, setSourceFilter] = useState('all');

  const [typeFilter, setTypeFilter] = useState('all');



  const swipeFlatListRef = useRef(null);



  // Apply filters whenever filter states change

  useEffect(() => {

    applyFilters();

  }, [priceFilter, tasteFilter, sourceFilter, typeFilter, recipeList]);



  // Use another useEffect to scroll to the selected item when modal opens or index changes

  useEffect(() => {

    if (modalVisible && swipeFlatListRef.current && selectedRecipeIndex !== -1) {

      setTimeout(() => {

        swipeFlatListRef.current.scrollToIndex({

          index: selectedRecipeIndex,

          animated: false,

          viewOffset: 0,

          viewPosition: 0,

        });

      }, 50);

    }

  }, [modalVisible, selectedRecipeIndex, filteredRecipes]);



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

        // Corrected filter logic for ingredient types

        const allMarineLife = getAllMarineLife();

        const marineLifeNames = new Set(allMarineLife.map(ml => ml.name.toLowerCase()));



        switch (typeFilter) {

            case 'fish':

                // Check if any ingredient is a marine life type or related to fish/seafood

                return recipe.ingredients.some(ing => {

                    const lowerIng = ing.toLowerCase();

                    return marineLifeNames.has(lowerIng) ||

                           lowerIng.includes('tuna') ||

                           lowerIng.includes('salmon') ||

                           lowerIng.includes('shark') ||

                           lowerIng.includes('fish') ||

                           lowerIng.includes('lobster') ||

                           lowerIng.includes('shrimp') ||

                           lowerIng.includes('crab') ||

                           lowerIng.includes('octopus') ||

                           lowerIng.includes('squid') ||

                           lowerIng.includes('jellyfish') ||

                           lowerIng.includes('seahorse') ||

                           lowerIng.includes('eel') ||

                           lowerIng.includes('ray') ||

                           lowerIng.includes('snailfish') ||

                           lowerIng.includes('stargazer') ||

                           lowerIng.includes('nautilus') ||

                           lowerIng.includes('clione') ||

                           lowerIng.includes('anglerfish') ||

                           lowerIng.includes('barracuda') ||

                           lowerIng.includes('trevally') ||

                           lowerIng.includes('triggerfish') ||

                           lowerIng.includes('parrotfish') ||

                           lowerIng.includes('snapper') ||

                           lowerIng.includes('porgy') ||

                           lowerIng.includes('wrasse') ||

                           lowerIng.includes('batfish') ||

                           lowerIng.includes('puffer');

                });

            case 'veggie':

                return recipe.ingredients.some(ing => {

                    const lowerIng = ing.toLowerCase();

                    return lowerIng.includes('bean') ||

                           lowerIng.includes('carrot') ||

                           lowerIng.includes('cucumber') ||

                           lowerIng.includes('onion') ||

                           lowerIng.includes('eggplant') ||

                           lowerIng.includes('tomato') ||

                           lowerIng.includes('seaweed') ||

                           lowerIng.includes('kelp') ||

                           lowerIng.includes('bladderwrack') ||

                           lowerIng.includes('sea grape') ||

                           lowerIng.includes('truffle') ||

                           lowerIng.includes('habanero') ||

                           lowerIng.includes('turmeric') ||

                           lowerIng.includes('buckwheat');

                });

            case 'mixed':

                // A 'mixed' type could be defined as recipes with both marine life and veggie ingredients,

                // or simply recipes with more than two ingredients as you originally had.

                // For now, let's keep it as "more than 2 ingredients" or refine if you have a specific definition.

                const hasMarineLife = recipe.ingredients.some(ing => marineLifeNames.has(ing.toLowerCase()));

                const hasVeggie = recipe.ingredients.some(ing => {

                    const lowerIng = ing.toLowerCase();

                    return lowerIng.includes('bean') || lowerIng.includes('carrot') || lowerIng.includes('cucumber') || lowerIng.includes('onion') || lowerIng.includes('eggplant') || lowerIng.includes('tomato') || lowerIng.includes('seaweed') || lowerIng.includes('kelp') || lowerIng.includes('bladderwrack') || lowerIng.includes('sea grape') || lowerIng.includes('truffle') || lowerIng.includes('habanero') || lowerIng.includes('turmeric') || lowerIng.includes('buckwheat');

                });

                return hasMarineLife && hasVeggie && recipe.ingredients.length > 2; // Mixed if both types and more than 2 ingredients total

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





  // 🆕 MODIFIED: openRecipeModal now takes index to support swiping

  const openRecipeModal = (recipeIndex) => {

    if (filteredRecipes.length === 0) return; // Prevent opening if list is empty

    setSelectedRecipeIndex(recipeIndex);

    setModalVisible(true);

  };





  const closeRecipeModal = () => {

    setModalVisible(false);

    setSelectedRecipeIndex(-1); // Reset index when modal closes

  };





  const renderFilterButton = (label, value, currentFilter, setFilter) => (

    <TouchableOpacity

      key={value} // Add key for list items

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





  const renderRecipeItem = ({ item, index }) => { // 🆕 index is now available from FlatList

    // ⚠️ MODIFIED: Direct access to item.local_thumbnail (which should be pre-required)

    const thumbnailSource = item.local_thumbnail; // This expects item.local_thumbnail to be the 'require'd image





    return (

      <TouchableOpacity

        style={styles.recipeCard}

        onPress={() => openRecipeModal(index)} // 🆕 Pass index instead of item

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



  // 🆕 NEW: Render function for each detailed card within the swipeable modal

  const renderDetailedRecipeCard = ({ item: recipe }) => {

      // Get all marine life data to check for clickable ingredients

      const allMarineLife = getAllMarineLife();

      const marineLifeNames = new Set(allMarineLife.map(ml => ml.name.toLowerCase()));

      // Function to navigate to MarineLifeScreen

      const navigateToMarineLife = (marineLifeName) => {

        closeRecipeModal(); // Close current recipe modal

        // Navigate to 'Marine Life' tab and pass the fish name as a parameter

        navigation.navigate('Marine Life', { screen: 'Marine Life', params: { marineLifeName: marineLifeName } });

      };



      return (

        <ScrollView contentContainerStyle={styles.modalScrollContent}> {/* Allows internal scrolling for large content */}

          {/* Modal Header is outside this render function to be static */}



          <View style={styles.modalImageContainer}>

            <View style={styles.modalPlaceholderImage}>

              {/* ⚠️ MODIFIED: Direct access to recipe.local_thumbnail */}

              {recipe.local_thumbnail ? (

                <Image

                  source={recipe.local_thumbnail} // Direct usage of the pre-resolved image

                  style={styles.modalRecipeImage}

                  resizeMode="contain"

                />

              ) : (

                <>

                  <Text style={styles.modalPlaceholderText}>🍣</Text>

                  <Text style={styles.comingSoonText}>Image Coming Soon</Text>

                </>

              )}

            </View>

          </View>





          <View style={styles.modalDetails}>

            <View style={styles.detailRow}>

              <Text style={styles.detailLabel}>💰 Price:</Text>

              <Text style={styles.detailValue}>${recipe.price_base} - ${recipe.price_max}</Text>

            </View>





            <View style={styles.detailRow}>

              <Text style={styles.detailLabel}>👅 Taste:</Text>

              <Text style={styles.detailValue}>{recipe.taste_base} - {recipe.taste_max}</Text>

            </View>





            <View style={styles.detailRow}>

              <Text style={styles.detailLabel}>🍽️ Servings:</Text>

              <Text style={styles.detailValue}>{recipe.dish_base} - {recipe.dish_max}</Text>

            </View>





            {/* 🆕 MODIFIED: Ingredients as clickable links */}

            <View style={styles.detailRow}>

              <Text style={styles.detailLabel}>🥘 Ingredients:</Text>

              <View style={styles.ingredientsList}>

                {recipe.ingredients.map((ingredient, idx) => {

                  const isMarineLife = marineLifeNames.has(ingredient.toLowerCase());

                  return (

                    <Text key={idx}>

                      {isMarineLife ? (

                        <Text

                          style={styles.ingredientLink}

                          onPress={() => {

                              navigateToMarineLife(ingredient); // Navigate to Marine Life screen

                          }}

                        >

                          {ingredient}

                        </Text>

                      ) : (

                        <Text style={styles.ingredientText}>

                          {ingredient}

                        </Text>

                      )}

                      {idx < recipe.ingredients.length - 1 && ', '}

                    </Text>

                  );

                })}

              </View>

            </View>





            <View style={styles.detailRow}>

              <Text style={styles.detailLabel}>🎯 How to Get:</Text>

              <Text style={styles.detailValue}>{recipe.acquisition}</Text>

            </View>

          </View>

        </ScrollView>

      );

  };





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

      {/* 🆕 MODIFIED: FlatList for main grid */}

      

        <FlatList

          ref={swipeFlatListRef}

          data={filteredRecipes}

          renderItem={renderDetailedRecipeCard}

          keyExtractor={item => item.name}

          horizontal

          pagingEnabled

          showsHorizontalScrollIndicator={false}

          initialScrollIndex={selectedRecipeIndex}

          getItemLayout={(data, index) => (

            { length: windowWidth * 0.9, offset: (windowWidth * 0.9) * index, index }

          )}

          onScrollEndDrag={(event) => {

            const contentOffsetX = event.nativeEvent.contentOffset.x;

            const newIndex = Math.round(contentOffsetX / (windowWidth * 0.9));

            if (newIndex !== selectedRecipeIndex) {

              setSelectedRecipeIndex(newIndex);

            }

          }}

          style={styles.modalFlatList}

          contentContainerStyle={{ alignItems: 'center' }}

        />

          )}

          {modalVisible && ( // Display modal header only when modal is visible

             <View style={styles.modalHeaderFixed}> {/* NEW STYLE for fixed header */}

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

  // 🆕 MODIFIED: Styles for vertical grid FlatList

  recipeGridContainer: { // Changed from recipeGridHorizontal

    paddingHorizontal: 4, // Slightly less padding for grid items

  },

  recipeCard: {

    flex: 1, // <--- ADDED: Allows cards to share space in columns

    margin: 4, // <--- ADJUSTED: Smaller margin for grid spacing

    width: (windowWidth / 2) - 8, // Adjusted width for 2 columns, accounting for margin

    height: 200, // Give a fixed height to cards

    backgroundColor: 'white',

    borderRadius: 12,

    padding: 12,

    elevation: 3,

    shadowColor: '#000',

    shadowOffset: { width: 0, height: 2 },

    shadowOpacity: 0.1,

    shadowRadius: 4,

    justifyContent: 'space-between', // Distribute content vertically

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

  // 🆕 NEW: Style for the FlatList inside the modal

  modalFlatList: {

    width: '90%', // Match the desired width of the modal content

    maxHeight: '80%', // Limit height if needed

    borderRadius: 16, // Apply border radius to the FlatList itself

    overflow: 'hidden', // Ensures content respects border radius

  },

  // 🆕 NEW: Style for the content *within* each swipeable modal card page

  modalScrollContent: {

    flexGrow: 1, // Allows content to grow

    justifyContent: 'flex-start', // Align content to the top

    backgroundColor: 'white', // Background for individual cards

    paddingBottom: 20, // Add some padding at the bottom of the scrollable content

  },

  // 🆕 NEW: Style for the fixed header within the modal

  modalHeaderFixed: {

    position: 'absolute', // Make it float above the swipable content

    top: Dimensions.get('window').height * 0.1, // Adjust based on modalOverlay justifyContent

    width: '90%', // Match modal width

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    padding: 16,

    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Slightly transparent white

    borderTopLeftRadius: 16,

    borderTopRightRadius: 16,

    zIndex: 10, // Ensure it's above the FlatList content

    borderBottomWidth: 1,

    borderBottomColor: '#e0e0e0',

  },

  modalTitle: {

    fontSize: 20,

    fontWeight: 'bold',

    flex: 1,

    textAlign: 'center', // Center the title

  },

  closeButton: {

    width: 32,

    height: 32,

    borderRadius: 16,

    backgroundColor: '#f0f0f0',

    justifyContent: 'center',

    alignItems: 'center',

    position: 'absolute', // Position relative to modalHeaderFixed

    right: 16,

    top: 16,

    zIndex: 20, // Ensure it's above title and other elements

  },

  closeButtonText: {

    fontSize: 18,

    color: '#666',

  },

  modalImageContainer: {

    alignItems: 'center',

    padding: 16,

    marginTop: 60, // Account for the fixed header

  },

  modalRecipeImage: { // New style for recipe image in modal

    width: 200,

    height: 200,

    borderRadius: 12,

  },

  modalPlaceholderImage: {

    width: 200,

    height: 200,

    backgroundColor: '#f0f0f0',

    borderRadius: 12,

    justifyContent: 'center',

    alignItems: 'center',

    borderWidth: 2,

    borderColor: '#e0e0e0',

    borderStyle: 'dashed',

  },

  modalPlaceholderText: {

    fontSize: 64,

    marginBottom: 8,

  },

  comingSoonText: {

    fontSize: 14,

    color: '#666',

    fontStyle: 'italic',

  },

  modalDetails: {

    marginTop: 10,

    paddingHorizontal: 16, // Add horizontal padding for details

  },

  detailRow: {

    flexDirection: 'row',

    marginBottom: 12,

    alignItems: 'flex-start',

    paddingBottom: 8,

    borderBottomWidth: 1,

    borderBottomColor: '#f0f0f0',

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

  ingredientsList: {

    flex: 1,

    flexDirection: 'row', // Display ingredients in a row

    flexWrap: 'wrap', // Allow ingredients to wrap to next line

  },

  ingredientLink: {

    color: '#0066cc', // Make it blue like a link

    fontWeight: 'bold',

    textDecorationLine: 'underline',

  },

  ingredientText: {

    color: '#666',

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

  statItem: {

    flexDirection: 'row',

    alignItems: 'center',

    flex: 1,

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

