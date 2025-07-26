// FILE LOCATION: src/components/RecipeCard.js
// CREATE THIS NEW FILE

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';

const RecipeCard = ({ recipe, onClose, onSelectIngredient, marineLifeNames }) => {
  if (!recipe) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>{recipe.name}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            accessibilityIgnoresInvertColors={true}
            source={recipe.local_thumbnail}
            style={styles.detailImage}
            onError={(e) => console.warn("Failed to load recipe image:", recipe.name, e.nativeEvent.error)}
          />
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.statsRow}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statLabel}>Price:</Text>
            <Text style={styles.statValue}>
              ${recipe.price_base} - ${recipe.price_max}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.statIcon}>👅</Text>
            <Text style={styles.statLabel}>Taste:</Text>
            <Text style={styles.statValue}>
              {recipe.taste_base} - {recipe.taste_max}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.statIcon}>🍽️</Text>
            <Text style={styles.statLabel}>Servings:</Text>
            <Text style={styles.statValue}>
              {recipe.dish_base}-{recipe.dish_max} servings
            </Text>
          </View>

          <View style={styles.ingredientsSection}>
            <Text style={styles.statIcon}>🥘</Text>
            <Text style={styles.statLabel}>Ingredients:</Text>
            <Text style={styles.ingredientsList}>
              {recipe.ingredients && recipe.ingredients.length > 0
                ? recipe.ingredients.map((ingredient, idx) => (
                    <Text
                      key={idx}
                      style={marineLifeNames.has(ingredient.toLowerCase()) ? styles.ingredientLink : styles.ingredientText}
                      onPress={
                        marineLifeNames.has(ingredient.toLowerCase())
                          ? () => onSelectIngredient(ingredient)
                          : undefined
                      }
                    >
                      {ingredient}
                      {idx < recipe.ingredients.length - 1 && ', '}
                    </Text>
                  ))
                : 'N/A'}
            </Text>
          </View>

          <View style={styles.acquisitionSection}>
            <Text style={styles.statIcon}>🎯</Text>
            <Text style={styles.statLabel}>How to Get:</Text>
            <Text style={styles.acquisitionText}>{recipe.acquisition || 'N/A'}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2c5aa0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  detailsContainer: {
    flex: 1,
    paddingTop: 8,
  },
  statsRow: {
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
    flex: 1,
    lineHeight: 24,
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
  },
});

export default RecipeCard;