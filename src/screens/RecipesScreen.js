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

  const swipeFlatListRef = useRef(null);

  useEffect(() => {
    setRecipes(allRecipes);
    setFilteredRecipes(allRecipes);
  }, []);

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

  const renderDetailedRecipeCard = ({ item, index }) => {
    // Define the full width one card should occupy, including any margins
    const CARD_FULL_WIDTH = windowWidth * 0.9; // Each card will be 90% of screen width
    const CARD_MARGIN_HORIZONTAL = 8; // Margin on each side of the card

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
          <Image
            source={item.local_thumbnail}
            style={styles.recipeDetailImage}
            
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
              {item.dish_base} - {item.dish_max}
            </Text>
          </View>
          
          <View style={styles.ingredientsSection}>
            <Text style={styles.statIcon}>🥘</Text>
            <Text style={styles.statLabel}>Ingredients:</Text>
            <Text style={styles.ingredientsList}>
              {item.ingredients.join(', ')}
            </Text>
          </View>
          
          <View style={styles.acquisitionSection}>
            <Text style={styles.statIcon}>🎯</Text>
            <Text style={styles.statLabel}>How to Get:</Text>
            <Text style={styles.acquisitionText}>{item.acquisition}</Text>
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
              data={filteredRecipes}
              renderItem={renderDetailedRecipeCard}
              keyExtractor={(item, index) => item.name + index}
              horizontal
              // We explicitly set snapping behavior instead of using pagingEnabled
              pagingEnabled={false} // Disable default paging
              snapToInterval={ (windowWidth * 0.9) + (8 * 2) } // Card width + left margin + right margin
              snapToAlignment={'center'} // Snap the item to the center of the FlatList
              decelerationRate="fast" // Improves snap feeling
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={selectedRecipeIndex}
              // getItemLayout is still useful for initial rendering performance,
              // but snapToInterval will enforce the snapping.
              getItemLayout={(data, index) => {
                const itemFullWidth = (windowWidth * 0.9) + (8 * 2); // Card width + total margins
                return {
                  length: itemFullWidth,
                  offset: itemFullWidth * index,
                  index,
                };
              }}
              onScrollEndDrag={(event) => {
                const itemFullWidth = (windowWidth * 0.9) + (8 * 2);
                const contentOffsetX = event.nativeEvent.contentOffset.x;
                const newIndex = Math.round(contentOffsetX / itemFullWidth);
                if (newIndex !== selectedRecipeIndex) {
                  setSelectedRecipeIndex(newIndex);
                }
              }}
              style={styles.modalFlatList}
              // Adjust content container style to add padding at ends for centering
              contentContainerStyle={{
                alignItems: 'center', // Center content
                paddingHorizontal: (windowWidth - ((windowWidth * 0.9) + (8 * 2))) / 2 // Half of remaining space to center the first/last item
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

