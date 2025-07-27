// src/screens/ToCatchListScreen.js

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  Alert, // For confirmation dialogs (instead of window.alert/confirm)
} from 'react-native';

// Import our custom hook to access the To-Catch list context
import { useToCatchList } from '../context/ToCatchListContext';

const ToCatchListScreen = () => {
  // Use the custom hook to get the toCatchList state and the dispatch function
  const { toCatchList, dispatchToCatchList, TO_CATCH_ACTIONS } = useToCatchList();

  // Function to handle toggling the caught status of an item on this list
  const handleToggleCaught = (marineLifeName) => {
    dispatchToCatchList({
      type: TO_CATCH_ACTIONS.TOGGLE_CAUGHT,
      payload: { marineLifeName },
    });
  };

  // Function to confirm and clear the entire To-Catch list
  const handleClearList = () => {
    Alert.alert(
      "Clear To Catch List?",
      "Are you sure you want to clear all items from your To Catch list? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear All",
          onPress: () => dispatchToCatchList({ type: TO_CATCH_ACTIONS.CLEAR_LIST }),
          style: "destructive", // Red color for destructive action
        },
      ],
      { cancelable: true }
    );
  };

  // Render function for each item in the FlatList
  const renderToCatchItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemImageContainer}>
        {item.image_url ? (
          <Image
            accessibilityIgnoresInvertColors={true}
            source={{ uri: item.image_url }}
            style={styles.itemImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>
              {item.name.includes('Shark') ? '🦈' : '🐟'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemQuantity}>Quantity Needed: {item.quantityNeeded}</Text>
        {item.sourceRecipes && item.sourceRecipes.length > 0 && (
          <Text style={styles.itemSourceRecipes}>
            From: {item.sourceRecipes.join(', ')}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.caughtToggleButton,
          item.isCaughtOnList ? styles.caughtButtonActive : styles.caughtButtonInactive,
        ]}
        onPress={() => handleToggleCaught(item.name)}
      >
        <Text style={styles.caughtButtonText}>
          {item.isCaughtOnList ? '✓ Caught' : 'Mark Caught'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My To Catch List</Text>
        {/* Only show Clear All button if there are items in the list */}
        {toCatchList.length > 0 && (
          <TouchableOpacity style={styles.clearAllButton} onPress={handleClearList}>
            <Text style={styles.clearAllButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {toCatchList.length === 0 ? (
        <View style={styles.emptyListContainer}>
          <Text style={styles.emptyListText}>
            Your To Catch list is empty!
          </Text>
          <Text style={styles.emptyListSubText}>
            Add recipes from the 'Recipes' tab to start your fishing plan.
          </Text>
        </View>
      ) : (
        <FlatList
          data={toCatchList}
          renderItem={renderToCatchItem}
          keyExtractor={(item) => item.name} // Key by name (assuming unique names for marine life)
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
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
    paddingTop: 40,
    flexDirection: 'row', // Align title and button
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    flex: 1, // Allow title to take available space
  },
  clearAllButton: {
    backgroundColor: '#dc3545', // Red for clear
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 10, // Space from title
  },
  clearAllButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyListText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyListSubText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  listContentContainer: {
    padding: 8,
    paddingBottom: 20, // Add some padding at the bottom for scroll comfort
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginVertical: 6,
    marginHorizontal: 8,
    borderRadius: 12,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 28,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 15,
    color: '#555',
    marginBottom: 2,
  },
  itemSourceRecipes: {
    fontSize: 13,
    color: '#777',
    fontStyle: 'italic',
  },
  caughtToggleButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
    minWidth: 100, // Ensure button has consistent width
    alignItems: 'center',
  },
  caughtButtonActive: {
    backgroundColor: '#4CAF50', // Green for caught
  },
  caughtButtonInactive: {
    backgroundColor: '#FFC107', // Amber/Yellow for not caught
  },
  caughtButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default ToCatchListScreen;
