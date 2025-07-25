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
  const [isFlatListLayoutReady, setIsFlatListLayoutReady] = useState(false); // New state to track FlatList layout

  // Callback for FlatList's onLayout event
  const handleFlatListLayout = () => {
    setIsFlatListLayoutReady(true);
  };

  const swipeFlatListRef = useRef(null);

  // Original useEffect for initial data loading
  useEffect(() => {
    setRecipes(allRecipes);
    setFilteredRecipes(allRecipes);
  }, []);

  // Effect to explicitly scroll the FlatList to the selected item when the modal opens
  useEffect(() => {
    // Only attempt scroll if modal is visible, a recipe is selected, ref is available, AND layout is ready.
    if (modalVisible && selectedRecipeIndex !== -1 && swipeFlatListRef.current && isFlatListLayoutReady) {
      // Add a short timeout to ensure children of FlatList are also measured
      const scrollTimeoutId = setTimeout(() => {
        try {
          const itemFullWidth = (windowWidth * 0.9) + (4 * 2); // (windowWidth * 0.9) + 8
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
      }, 50); // A very short delay (e.g., 50ms) after onLayout, adjust if needed

      return () => clearTimeout(scrollTimeoutId); // Cleanup timeout on component unmount/dependency change
    }

    // Reset layout ready state when modal closes to re-trigger on next open
    if (!modalVisible) {
      console.log('*** SCROLL DEBUG ***: Modal closed. Resetting isFlatListLayoutReady: false.');
      setIsFlatListLayoutReady(false);
    }
  }, [modalVisible, selectedRecipeIndex, isFlatListLayoutReady, filteredRecipes.length]);

  const openRecipeModal = (index) => {
    setSelectedRecipeIndex(index);
    setModalVisible(true);
  };

  const closeRecipeModal = () => {
    setModalVisible(false);
    setSelectedRecipeIndex(-1);
  };

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

  const renderDetailedRecipeCard = ({ item }) => { // 'index' is removed as it's not directly used for display logic within this render
    // IMPORTANT: Add a check to ensure 'item' is valid before rendering its properties.
    // This can prevent errors or blank content if FlatList passes an incomplete item temporarily during init.
    if (!item) {
      // Return a placeholder that still maintains the expected dimensions
      // so FlatList's layout calculations (getItemLayout, snapToInterval) remain consistent.
      const CARD_FULL_WIDTH_PLACEHOLDER = windowWidth * 0.9;
      const CARD_MARGIN_HORIZONTAL_PLACEHOLDER = 4;
      return (
        <View style={[
          styles.detailedRecipeCard, // Inherit basic card styles
          {
            width: CARD_FULL_WIDTH_PLACEHOLDER,
            marginHorizontal: CARD_MARGIN_HORIZONTAL_PLACEHOLDER,
            minHeight: 500, // Maintain height consistent with detailedRecipeCard's minHeight
            justifyContent: 'center',
            alignItems: 'center'
          }
        ]}>
          <Text style={{ color: '#888', fontSize: 16 }}>Loading recipe details...</Text>
        </View>
      );
    }

    // Define the full width one card should occupy, including any margins
    const CARD_FULL_WIDTH = windowWidth * 0.9; // Each card will be 90% of screen width
    const CARD_MARGIN_HORIZONTAL = 4; // Margin on each side of the card (you desired 4px here)

    return (
      <View
        style={[
          styles.detailedRecipeCard,
          {
            width: CARD_FULL_WIDTH, // The card itself fills 90% of screen width
            marginHorizontal: CARD_MARGIN_HORIZONTAL, // Add margins to this rendered item
          },
        ]}
      >
        <View style={styles.recipeImageContainer}>
          {/* Ensure local_thumbnail is valid before using as source, or provide fallback */}
          <Image
            source={item.local_thumbnail}
            style={styles.recipeDetailImage}
            onError={(e) => console.warn("Failed to load recipe image:", item.name, e.nativeEvent.error)} // More specific error logging
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
              onLayout={handleFlatListLayout} // Add onLayout prop here
              data={filteredRecipes}
              renderItem={renderDetailedRecipeCard}
              keyExtractor={(item, index) => item.name + index}
              horizontal
              pagingEnabled={false} // Disable default paging
              // snapToInterval must be (card_content_width + 2 * desired_margin_horizontal)
              snapToInterval={ (windowWidth * 0.9) + (4 * 2) } // Actual total item width: (windowWidth * 0.9) + 8
              snapToAlignment={'center'} // Snap the item to the center of the FlatList's viewport
              decelerationRate="fast" // Improves snap feeling
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={selectedRecipeIndex}
              getItemLayout={(data, index) => {
                const itemFullWidth = (windowWidth * 0.9) + (4 * 2); // Match snapToInterval
                return {
                  length: itemFullWidth,
                  offset: itemFullWidth * index,
                  index,
                };
              }}
              onScrollEndDrag={(event) => {
                const itemFullWidth = (windowWidth * 0.9) + (4 * 2); // Match snapToInterval
                const contentOffsetX = event.nativeEvent.contentOffset.x;
                const newIndex = Math.round(contentOffsetX / itemFullWidth);
                if (newIndex !== selectedRecipeIndex) {
                  setSelectedRecipeIndex(newIndex);
                }
              }}
              style={styles.modalFlatList} // The FlatList container itself is 90% width and centered.
              contentContainerStyle={{
                alignItems: 'center', // This is sufficient for centering items within the FlatList's viewport
                // Remove paddingHorizontal, as it was causing an unintended offset with snapToAlignment:'center'
                // and the FlatList's 90% width.
              }}
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