// src/screens/ToCatchListScreen.js

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

// Placeholder screen for the "To Catch" list
const ToCatchListScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My To Catch List</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.placeholderText}>
          Your marine life shopping list will appear here!
        </Text>
        <Text style={styles.placeholderText}>
          Add recipes from the 'Recipes' tab to populate this list.
        </Text>
      </View>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default ToCatchListScreen;
