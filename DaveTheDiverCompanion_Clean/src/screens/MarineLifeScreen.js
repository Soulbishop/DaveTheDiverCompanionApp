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

  if (marineLife.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Marine Life Collection</Text>
        </View>
        
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Ready for Your Data!</Text>
          <Text style={styles.emptyDescription}>
            This is your Phase 1 foundation. Add your marine life data to the 
            src/data/marineLife.json file to start tracking your collection.
          </Text>
          <Text style={styles.emptyNote}>
            The app is ready to handle your complete Dave the Diver marine life database 
            with your custom naming system and organization.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
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


  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  emptyNote: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },

