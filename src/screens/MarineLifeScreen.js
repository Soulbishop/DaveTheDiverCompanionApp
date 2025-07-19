import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MarineLifeCard from '../components/MarineLifeCard';
import marineLifeData from '../data/marineLife.json';

const MarineLifeScreen = () => {
  const [marineLife, setMarineLife] = useState(marineLifeData);

  useEffect(() => {
    loadMarineLifeData();
  }, []);

  const loadMarineLifeData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('marineLifeData');
      if (savedData) {
        setMarineLife(JSON.parse(savedData));
      }
    } catch (error) {
      console.error('Error loading marine life data:', error);
    }
  };

  const saveMarineLifeData = async (data) => {
    try {
      await AsyncStorage.setItem('marineLifeData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving marine life data:', error);
    }
  };

  const handleToggleCaught = (id) => {
    const updatedData = marineLife.map(item =>
      item.id === id ? { ...item, caught: !item.caught } : item
    );
    setMarineLife(updatedData);
    saveMarineLifeData(updatedData);
  };

  const handleToggleBreeding = (id) => {
    const updatedData = marineLife.map(item =>
      item.id === id ? { ...item, breedingPair: !item.breedingPair } : item
    );
    setMarineLife(updatedData);
    saveMarineLifeData(updatedData);
  };

  const renderMarineLifeCard = ({ item }) => (
    <MarineLifeCard
      marineLife={item}
      onToggleCaught={handleToggleCaught}
      onToggleBreeding={handleToggleBreeding}
    />
  );

  const caughtCount = marineLife.filter(item => item.caught).length;
  const breedingPairCount = marineLife.filter(item => item.breedingPair).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Marine Life Collection</Text>
        <View style={styles.statsContainer}>
          <Text style={styles.stats}>
            Caught: {caughtCount}/{marineLife.length} • Breeding Pairs: {breedingPairCount}
          </Text>
        </View>
      </View>
      
      <FlatList
        data={marineLife}
        renderItem={renderMarineLifeCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  statsContainer: {
    marginTop: 8,
  },
  stats: {
    fontSize: 14,
    color: '#E3F2FD',
    textAlign: 'center',
  },
  listContainer: {
    padding: 8,
  },
});

export default MarineLifeScreen;

