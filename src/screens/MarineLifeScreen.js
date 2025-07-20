// FILE LOCATION: src/screens/MarineLifeScreen.js
// REPLACE THE ENTIRE EXISTING FILE WITH THIS CODE

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  TextInput,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MarineLifeCard from '../components/MarineLifeCard';
import marineLifeData from '../data/marineLife.json';

const MarineLifeScreen = () => {
  const [marineLife, setMarineLife] = useState(marineLifeData);
  const [filteredMarineLife, setFilteredMarineLife] = useState(marineLifeData);
  const [selectedFish, setSelectedFish] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, caught, uncaught, breeding

  useEffect(() => {
    loadMarineLifeData();
  }, []);

  useEffect(() => {
    filterMarineLife();
  }, [marineLife, searchText, filterType]);

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

  const saveMarineLifeData = async (updatedData) => {
    try {
      await AsyncStorage.setItem('marineLifeData', JSON.stringify(updatedData));
      console.error('Marine life data saved successfully');
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

  const filterMarineLife = () => {
    let filtered = marineLife;

    // Apply search filter
    if (searchText) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.zone.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Apply type filter
    switch (filterType) {
      case 'caught':
        filtered = filtered.filter(item => item.caught);
        break;
      case 'uncaught':
        filtered = filtered.filter(item => !item.caught);
        break;
      case 'breeding':
        filtered = filtered.filter(item => item.breedingPair);
        break;
      default:
        break;
    }

    setFilteredMarineLife(filtered);
  };

  const openFishCard = (fish) => {
    setSelectedFish(fish);
    setModalVisible(true);
  };

  const closeFishCard = () => {
    setModalVisible(false);
    setSelectedFish(null);
  };

  const renderMarineLifeItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.fishItem}
      onPress={() => openFishCard(item)}
    >
      <View style={styles.fishImageContainer}>
        {item.sprite ? (
          <Image 
            source={{ uri: item.sprite }} 
            style={styles.fishImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>🐟</Text>
          </View>
        )}
      </View>
      
      <View style={styles.fishInfo}>
        <Text style={styles.fishName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.fishZone}>{item.zone}</Text>
        <Text style={styles.fishTime}>{item.timeOfDay}</Text>
      </View>
      
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, item.caught ? styles.caughtButton : styles.uncaughtButton]}
          onPress={() => handleToggleCaught(item.id)}
        >
          <Text style={styles.toggleText}>C</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.toggleButton, item.breedingPair ? styles.breedingButton : styles.noBreedingButton]}
          onPress={() => handleToggleBreeding(item.id)}
        >
          <Text style={styles.toggleText}>B</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search marine life..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'caught', 'uncaught', 'breeding'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterButton, filterType === filter && styles.activeFilter]}
              onPress={() => setFilterType(filter)}
            >
              <Text style={[styles.filterText, filterType === filter && styles.activeFilterText]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredMarineLife}
        renderItem={renderMarineLifeItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeFishCard}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedFish && (
              <MarineLifeCard
                fish={selectedFish}
                onClose={closeFishCard}
                onToggleCaught={() => handleToggleCaught(selectedFish.id)}
                onToggleBreeding={() => handleToggleBreeding(selectedFish.id)}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#2c5aa0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  statsContainer: {
    marginTop: 8,
  },
  stats: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeFilter: {
    backgroundColor: '#2c5aa0',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterText: {
    color: 'white',
  },
  listContainer: {
    padding: 8,
  },
  fishItem: {
    flex: 1,
    margin: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fishImageContainer: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  fishImage: {
    width: 60,
    height: 60,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    backgroundColor: '#e0e0e0',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
  },
  fishInfo: {
    marginBottom: 8,
  },
  fishName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  fishZone: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  fishTime: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  toggleButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  caughtButton: {
    backgroundColor: '#4CAF50',
  },
  uncaughtButton: {
    backgroundColor: '#f44336',
  },
  breedingButton: {
    backgroundColor: '#2196F3',
  },
  noBreedingButton: {
    backgroundColor: '#9E9E9E',
  },
  toggleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
});

export default MarineLifeScreen;

