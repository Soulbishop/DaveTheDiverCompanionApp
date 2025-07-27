// FILE LOCATION: src/components/MarineLifeCard.js
// CREATE THIS NEW FILE

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
} from 'react-native';

const MarineLifeCard = ({ fish, onClose, onToggleCaught, onToggleBreeding, onSelectRecipe }) => {
  if (!fish) return null;

  const imageUrl = fish.detailed_marine_life_art || fish.image_url;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{fish.name}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image 
              source={fish.detailed_marine_life_art || fish.local_thumbnail} 
              style={styles.fishImage}
              resizeMode="contain"
            />

          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>🐟</Text>
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Zone:</Text>
            <Text style={styles.value}>{fish.zone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Time of Day:</Text>
            <Text style={styles.value}>{fish.active_time}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Best Method:</Text>
            <Text style={styles.value}>{fish.best_capture_method}</Text>
          </View>

          {fish.weight && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Weight:</Text>
              <Text style={styles.value}>{fish.weight}</Text>
            </View>
          )}

          {fish.difficulty && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Difficulty:</Text>
              <Text style={styles.value}>{'★'.repeat(fish.difficulty)}</Text>
            </View>
          )}
        </View>

        {fish.recipes && fish.recipes.length > 0 && (
          <View style={styles.recipesSection}>
            <Text style={styles.sectionTitle}>Used in Recipes:</Text>
            {fish.recipes.map((recipe, index) => (
              <TouchableOpacity key={index} onPress={() => onSelectRecipe && onSelectRecipe(recipe)}>
                <View style={styles.recipeItem}>
                  <Text style={styles.recipeLinkText}>• {recipe}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.toggleSection}>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Caught</Text>
            <Switch
              value={fish.caught}
              onValueChange={() => onToggleCaught(fish.name, !fish.caught)}
              trackColor={{ false: '#767577', true: '#4CAF50' }}
              thumbColor={fish.caught ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Breeding Pair</Text>
            <Switch
              value={fish.breeding_pair}
              onValueChange={() => onToggleBreeding(fish.name, !fish.breeding_pair)}
              trackColor={{ false: '#767577', true: '#2196F3' }}
              thumbColor={fish.breeding_pair ? '#ffffff' : '#f4f3f4'}
            />
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
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  fishImage: {
    width: 120,
    height: 120,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    backgroundColor: '#e0e0e0',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: '#666',
    flex: 2,
    textAlign: 'right',
  },
  rarityText: {
    fontWeight: 'bold',
    color: '#ff6b35',
  },
  recipesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  recipeItem: {
    paddingVertical: 4,
  },
  recipeText: {
    fontSize: 14,
    color: '#666',
  },
  recipeLinkText: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  toggleSection: {
    marginBottom: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  descriptionSection: {
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default MarineLifeCard;