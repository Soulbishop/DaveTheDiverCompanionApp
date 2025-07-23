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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import allRecipes from '../data/allRecipes'; // This will now contain pre-required images
import { getAllMarineLife } from '../utils/marineLifeDatabase';


// Get the window width for dynamic card sizing
const { width: windowWidth } = Dimensions.get('window');


// Removed: getRecipeImagePath function is no longer needed.
// It was confirmed that allRecipes.js will now contain pre-required images.
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


  // 🆕 MODIFIED: useEffect for scrolling with a more robust check and slight delay.
  // This aims to fix the issue where the image doesn't load until after a swipe,
  // and ensure it starts at the correct index.
  useEffect(() => {
    if (modalVisible && swipeFlatListRef.current && filteredRecipes.length > 0 && selectedRecipeIndex !== -1) {
      // Small delay to ensure FlatList has fully rendered its items before attempting to scroll.
      // This is often necessary when data changes and the component needs time to layout.
      const timer = setTimeout(() => {
        // Ensure the target index is still valid within the current filtered list
        if (selectedRecipeIndex < filteredRecipes.length) {
          swipeFlatListRef.current.scrollToIndex({
            index: selectedRecipeIndex,
            animated: false, // Set to false for instant jump to the correct card
            viewOffset: 0,
            viewPosition: 0, // 0 is start, 0.5 is center, 1 is end
          });
        }
      }, 100); // Increased delay slightly for better reliability

      return () => clearTimeout(timer); // Cleanup the timer
    }
  }, [modalVisible, selectedRecipeIndex, filteredRecipes]); // Depend on filteredRecipes to re-scroll if filter changes while modal is open


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
                const hasMarineLife = recipe.ingredients.some(ing => marineLifeNames.has(ing.toLowerCase()));
                const hasVeggie = recipe.ingredients.some(ing => {
                    const lowerIng = ing.toLowerCase();
                    return lowerIng.includes('bean') || lowerIng.includes('carrot') || lowerIng.includes('cucumber') || lowerIng.includes('onion') || lowerIng.includes('eggplant') || lowerIng.includes('tomato') || lowerIng.includes('seaweed') || lowerIng.includes('kelp') || lowerIng.includes('bladderwrack') || lowerIng.includes('sea grape') || lowerIng.includes('truffle') || lowerIng.includes('habanero') || lowerIng.includes('turmeric') || lowerIng.includes('buckwheat');
                });
                return hasMarineLife && hasVeggie && recipe.ingredients.length > 2;
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


  // openRecipeModal now takes index to support swiping
  const openRecipeModal = (recipeIndex) => {
    if (filteredRecipes.length === 0) return;
    setSelectedRecipeIndex(recipeIndex);
    setModalVisible(true);
  };


  const closeRecipeModal = () => {
    setModalVisible(false);
    setSelectedRecipeIndex(-1);
  };


  const renderFilterButton = (label, value, currentFilter, setFilter) => (
    <TouchableOpacity
      key={value}
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


  const renderRecipeItem = ({ item, index }) => {
    // Direct access to item.local_thumbnail (which should be pre-required)
    const thumbnailSource = item.local_thumbnail;


    return (
      <TouchableOpacity
        style={styles.recipeCard}
        onPress={() => openRecipeModal(index)}
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


  // Render function for each detailed card within the swipeable modal
  const renderDetailedRecipeCard = ({ item: recipe }) => {
      // Get all marine life data to check for clickable ingredients
      const allMarineLife = getAllMarineLife();
      const marineLifeNames = new Set(allMarineLife.map(ml => ml.name.toLowerCase()));
      // Function to navigate to MarineLifeScreen
      const navigateToMarineLife = (marineLifeName) => {
        closeRecipeModal();
        // Navigate to 'Marine Life' tab and pass the fish name as a parameter
        navigation.navigate('Marine Life', { screen: 'Marine Life', params: { marineLifeName: marineLifeName } });
      };


      return (
        <ScrollView contentContainerStyle={styles.modalScrollContent}>
          <View style={styles.modalImageContainer}>
            <View style={styles.modalPlaceholderImage}>
              {recipe.local_thumbnail ? (
                <Image
                  source={recipe.local_thumbnail}
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


            {/* Ingredients as clickable links */}
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
                              navigateToMarineLife(ingredient);
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

<FlatList

data={filteredRecipes}

renderItem={renderRecipeItem}

keyExtractor={(item, index) => `recipe-${index}`}

numColumns={2} // Renders items in two columns

contentContainerStyle={styles.recipeGridContainer}

/>


{/* Recipe Detail Modal */}

<Modal

animationType="slide"

transparent={true}

visible={modalVisible}

onRequestClose={closeRecipeModal}

>

<View style={styles.modalOverlay}>

{/* Swipable FlatList for detailed cards */}

{modalVisible && filteredRecipes.length > 0 && selectedRecipeIndex !== -1 && (

<FlatList

ref={swipeFlatListRef} // Attach ref here

data={filteredRecipes}

renderItem={renderDetailedRecipeCard}

keyExtractor={item => item.name}

horizontal // Make this FlatList horizontal

pagingEnabled // Enable snapping to full pages

showsHorizontalScrollIndicator={false}

initialScrollIndex={selectedRecipeIndex} // Start at the selected item

getItemLayout={(data, index) => ( // Optimize scrolling performance

{ length: windowWidth * 0.9, offset: (windowWidth * 0.9) * index, index }

)}

onScrollEndDrag={(event) => {

const contentOffsetX = event.nativeEvent.contentOffset.x;

// Calculate new index based on modal page width (windowWidth * 0.9)

const newIndex = Math.round(contentOffsetX / (windowWidth * 0.9));

if (newIndex !== selectedRecipeIndex) {

setSelectedRecipeIndex(newIndex);

}

}}

style={styles.modalFlatList} // NEW STYLE for modal FlatList

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

recipeGridContainer: {

paddingHorizontal: 4,

},

recipeCard: {

flex: 1,

margin: 4,

width: (windowWidth / 2) - 8,

height: 200,

backgroundColor: 'white',

borderRadius: 12,

padding: 12,

elevation: 3,

shadowColor: '#000',

shadowOffset: { width: 0, height: 2 },

shadowOpacity: 0.1,

shadowRadius: 4,

justifyContent: 'space-between',

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

modalFlatList: {

width: '90%',

maxHeight: '80%',

borderRadius: 16,

overflow: 'hidden',

},

modalScrollContent: {

flexGrow: 1,

justifyContent: 'flex-start',

backgroundColor: 'white',

paddingBottom: 20,

},

modalHeaderFixed: {

position: 'absolute',

top: Dimensions.get('window').height * 0.1,

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

flex: 1,

textAlign: 'center',

},

closeButton: {

width: 32,

height: 32,

borderRadius: 16,

backgroundColor: '#f0f0f0',

justifyContent: 'center',

alignItems: 'center',

position: 'absolute',

right: 16,

top: 16,

zIndex: 20,

},

closeButtonText: {

fontSize: 18,

color: '#666',

},

modalImageContainer: {

alignItems: 'center',

padding: 16,

marginTop: 60,

},

modalRecipeImage: {

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

paddingHorizontal: 16,

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

flexDirection: 'row',

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

});


export default RecipesScreen;
