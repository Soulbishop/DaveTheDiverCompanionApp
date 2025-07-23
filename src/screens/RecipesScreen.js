// FILE: src/screens/RecipesScreen.js

import React, { useState, useEffect, useRef } from 'react'; // 🆕 Import useRef
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
import { useNavigation } from '@react-navigation/native'; // 🆕 Import useNavigation hook
import allRecipes from '../data/allRecipes';
// 🆕 Import getAllMarineLife to check if ingredient is a marine life
import { getAllMarineLife } from '../utils/marineLifeDatabase';


// Get the window width for dynamic card sizing
const { width: windowWidth } = Dimensions.get('window');


// Convert recipe name to local image filename
const getRecipeImagePath = (recipeName) => {
  // Convert recipe name to filename format (lowercase, replace spaces/special chars with underscores)
  const filename = recipeName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') + '.png';
  try {
    // This assumes the images are directly in `src/assets/recipe_images` based on your file structure.
    return require(`../../assets/recipe_images/${filename}`);
  } catch (error) {
    // console.warn(`Recipe image not found for: ${recipeName} (${filename})`); // Uncomment for debugging missing images
    return null;
  }
};


const RecipesScreen = () => {
  const navigation = useNavigation(); // 🆕 Initialize useNavigation hook
  // State management
  const [recipeList, setRecipeList] = useState(allRecipes);
  const [filteredRecipes, setFilteredRecipes] = useState(allRecipes);
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState(-1); // 🆕 Track index for swiping
  const [modalVisible, setModalVisible] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  // Filter states
  const [priceFilter, setPriceFilter] = useState('all');
  const [tasteFilter, setTasteFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const swipeFlatListRef = useRef(null); // 🆕 Ref for horizontal FlatList in modal

  // Apply filters whenever filter states change
  useEffect(() => {
    applyFilters();
  }, [priceFilter, tasteFilter, sourceFilter, typeFilter, recipeList]);

  // Use another useEffect to scroll to the selected item when modal opens or index changes
  useEffect(() => {
    if (modalVisible && swipeFlatListRef.current && selectedRecipeIndex !== -1) {
      // Use setTimeout to ensure the FlatList has rendered before attempting to scroll
      setTimeout(() => {
        swipeFlatListRef.current.scrollToIndex({
          index: selectedRecipeIndex,
          animated: false, // Set to true for smooth animation, false for instant jump
          viewOffset: 0,
          viewPosition: 0, // 0 is start, 0.5 is center, 1 is end
        });
      }, 50); // Small delay to allow FlatList to render its items
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
          {render
