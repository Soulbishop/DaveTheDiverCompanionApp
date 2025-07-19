import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

const RecipesScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sushi Recipes</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.comingSoon}>Coming in Phase 2!</Text>
        <Text style={styles.description}>
          This section will contain all sushi recipes and dishes from Dave the Diver,
          including ingredients, prices, and cross-references with marine life.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FF9800',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  comingSoon: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default RecipesScreen;

