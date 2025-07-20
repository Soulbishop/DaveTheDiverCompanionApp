// FILE LOCATION: src/screens/MarineLifeScreen.js
// COMPLETE IMPLEMENTATION WITH ALL FIXES + CATEGORY FILTERS
// Generated automatically for ALL 206 marine life entries

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
import { saveUserMarineLifeData } from '../utils/marineLifeDatabase';

const MarineLifeScreen = ({ marineLifeList, setMarineLifeList }) => {
  const [filteredMarineLife, setFilteredMarineLife] = useState(marineLifeList);
  const [selectedFish, setSelectedFish] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, caught, uncaught, breeding
  
  // 🆕 NEW: Category filter states
  const [zoneFilter, setZoneFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');

  // Load marine life data when component mounts
  useEffect(() => {
    loadMarineLifeData();
  }, []);

  // Update filtered list when any filter changes
  useEffect(() => {
    applyFilters();
  }, [marineLifeList, searchText, filterType, zoneFilter, timeFilter]);

  // 🔧 PRESERVED: Modal state bug fix
  useEffect(() => {
    if (selectedFish && marineLifeList) {
      const updatedFish = marineLifeList.find(fish => fish.name === selectedFish.name);
      if (updatedFish) {
        setSelectedFish(updatedFish);
      }
    }
  }, [marineLifeList]);

  const loadMarineLifeData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('@DaveTheDiverCompanion:userMarineLife');
      if (storedData) {
        const userData = JSON.parse(storedData);
        const updatedList = marineLifeList.map(item => {
          const userStatus = userData[item.name];
          if (userStatus) {
            return {
              ...item,
              caught: userStatus.caught,
              breeding_pair: userStatus.breeding_pair,
            };
          }
          return item;
        });
        setMarineLifeList(updatedList);
      }
    } catch (error) {
      console.error('Failed to load marine life data:', error);
    }
  };

  // 🆕 ENHANCED: Apply all filters including new category filters
  const applyFilters = () => {
    let filtered = marineLifeList;

    // Apply search filter
    if (searchText) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.zone.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Apply status filter
    switch (filterType) {
      case 'caught':
        filtered = filtered.filter(item => item.caught);
        break;
      case 'uncaught':
        filtered = filtered.filter(item => !item.caught);
        break;
      case 'breeding':
        filtered = filtered.filter(item => item.breeding_pair);
        break;
      default:
        break;
    }

    // 🆕 NEW: Apply zone filter
    if (zoneFilter !== 'all') {
      filtered = filtered.filter(item => item.zone === zoneFilter);
    }

    // 🆕 NEW: Apply time filter
    if (timeFilter !== 'all') {
      filtered = filtered.filter(item => item.active_time === timeFilter);
    }

    setFilteredMarineLife(filtered);
  };

  // 🆕 NEW: Reset all filters
  const resetFilters = () => {
    setSearchText('');
    setFilterType('all');
    setZoneFilter('all');
    setTimeFilter('all');
  };

  const toggleCaught = async (fishName) => {
    const updatedList = marineLifeList.map(item => {
      if (item.name === fishName) {
        return { ...item, caught: !item.caught };
      }
      return item;
    });
    setMarineLifeList(updatedList);
    await saveUserMarineLifeData(updatedList);
  };

  const toggleBreedingPair = async (fishName) => {
    const updatedList = marineLifeList.map(item => {
      if (item.name === fishName) {
        return { ...item, breeding_pair: !item.breeding_pair };
      }
      return item;
    });
    setMarineLifeList(updatedList);
    await saveUserMarineLifeData(updatedList);
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
      style={styles.fishCard}
      onPress={() => openFishCard(item)}
    >
      <View style={styles.fishImageContainer}>
        {/* 🖼️ PRESERVED: Local thumbnails in grid */}
        {item.image_filename ? (
          <Image
            source={require(`../assets/marine_life_thumbs/${item.image_filename}`)}
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
        <Text style={styles.fishName}>{item.name}</Text>
        <Text style={styles.fishZone}>{item.zone}</Text>
        <Text style={styles.fishWeight}>{item.weight}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            item.caught ? styles.caughtButton : styles.uncaughtButton
          ]}
          onPress={() => toggleCaught(item.name)}
        >
          <Text style={styles.buttonText}>
            {item.caught ? '✓' : 'o'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            item.breeding_pair ? styles.breedingButton : styles.noBreedingButton
          ]}
          onPress={() => toggleBreedingPair(item.name)}
        >
          <Text style={styles.buttonText}>
            {item.breeding_pair ? '♥' : 'o'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderFishCard = () => {
    if (!selectedFish) return null;

    return (
      <ScrollView style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{selectedFish.name}</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={closeFishCard}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        {/* 🖼️ PRESERVED: Placeholder in modal */}
        <View style={styles.modalImageContainer}>
          <View style={styles.modalPlaceholderImage}>
            <Text style={styles.modalPlaceholderText}>🐟</Text>
            <Text style={styles.comingSoonText}>Image Coming Soon</Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Zone:</Text>
            <Text style={styles.detailValue}>{selectedFish.zone}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Weight:</Text>
            <Text style={styles.detailValue}>{selectedFish.weight}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Active Time:</Text>
            <Text style={styles.detailValue}>{selectedFish.active_time}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Difficulty:</Text>
            <Text style={styles.detailValue}>{'★'.repeat(selectedFish.difficulty)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Best Method:</Text>
            <Text style={styles.detailValue}>{selectedFish.best_capture_method}</Text>
          </View>

          {selectedFish.recipes && selectedFish.recipes.length > 0 && (
            <View style={styles.recipesContainer}>
              <Text style={styles.recipesTitle}>Used in Recipes:</Text>
              {selectedFish.recipes.map((recipe, index) => (
                <Text key={index} style={styles.recipeItem}>• {recipe}</Text>
              ))}
            </View>
          )}

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[
                styles.modalToggleButton,
                selectedFish.caught ? styles.caughtButton : styles.uncaughtButton
              ]}
              onPress={() => toggleCaught(selectedFish.name)}
            >
              <Text style={styles.modalButtonText}>
                {selectedFish.caught ? 'Caught ✓' : 'Not Caught o'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalToggleButton,
                selectedFish.breeding_pair ? styles.breedingButton : styles.noBreedingButton
              ]}
              onPress={() => toggleBreedingPair(selectedFish.name)}
            >
              <Text style={styles.modalButtonText}>
                {selectedFish.breeding_pair ? 'Breeding Pair ♥' : 'No Breeding Pair o'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  };

  // Calculate statistics
  const caughtCount = marineLifeList.filter(item => item.caught).length;
  const breedingCount = marineLifeList.filter(item => item.breeding_pair).length;
  const totalCount = marineLifeList.length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Marine Life Tracker</Text>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Caught: {caughtCount}/{totalCount} ({Math.round((caughtCount/totalCount)*100)}%)
          </Text>
          <Text style={styles.statsText}>
            Breeding Pairs: {breedingCount}
          </Text>
        </View>
      </View>

      {/* 🆕 ENHANCED: Filter controls with category filters */}
      <View style={styles.controlsContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search marine life..."
          value={searchText}
          onChangeText={setSearchText}
        />

        {/* Status Filters */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Status:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterContainer}>
              {['all', 'caught', 'uncaught', 'breeding'].map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterButton,
                    filterType === filter && styles.activeFilterButton
                  ]}
                  onPress={() => setFilterType(filter)}
                >
                  <Text style={[
                    styles.filterButtonText,
                    filterType === filter && styles.activeFilterButtonText
                  ]}>
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* 🆕 NEW: Zone Filters */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Zone:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  zoneFilter === 'all' && styles.activeFilterButton
                ]}
                onPress={() => setZoneFilter('all')}
              >
                <Text style={[
                  styles.filterButtonText,
                  zoneFilter === 'all' && styles.activeFilterButtonText
                ]}>
                  All
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  zoneFilter === 'Aberrations' && styles.activeFilterButton
                ]}
                onPress={() => setZoneFilter('Aberrations')}
              >
                <Text style={[
                  styles.filterButtonText,
                  zoneFilter === 'Aberrations' && styles.activeFilterButtonText
                ]}>
                  Aberrations
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  zoneFilter === 'Blue Hole Depths (130-250m)' && styles.activeFilterButton
                ]}
                onPress={() => setZoneFilter('Blue Hole Depths (130-250m)')}
              >
                <Text style={[
                  styles.filterButtonText,
                  zoneFilter === 'Blue Hole Depths (130-250m)' && styles.activeFilterButtonText
                ]}>
                  Blue Hole Depths
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  zoneFilter === 'Blue Hole Medium Depth (50-130m)' && styles.activeFilterButton
                ]}
                onPress={() => setZoneFilter('Blue Hole Medium Depth (50-130m)')}
              >
                <Text style={[
                  styles.filterButtonText,
                  zoneFilter === 'Blue Hole Medium Depth (50-130m)' && styles.activeFilterButtonText
                ]}>
                  Blue Hole Medium Depth
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  zoneFilter === 'Blue Hole Shallows (0-50m)' && styles.activeFilterButton
                ]}
                onPress={() => setZoneFilter('Blue Hole Shallows (0-50m)')}
              >
                <Text style={[
                  styles.filterButtonText,
                  zoneFilter === 'Blue Hole Shallows (0-50m)' && styles.activeFilterButtonText
                ]}>
                  Blue Hole Shallows
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  zoneFilter === 'Glacier Passage' && styles.activeFilterButton
                ]}
                onPress={() => setZoneFilter('Glacier Passage')}
              >
                <Text style={[
                  styles.filterButtonText,
                  zoneFilter === 'Glacier Passage' && styles.activeFilterButtonText
                ]}>
                  Glacier Passage
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  zoneFilter === 'Glacier Zone' && styles.activeFilterButton
                ]}
                onPress={() => setZoneFilter('Glacier Zone')}
              >
                <Text style={[
                  styles.filterButtonText,
                  zoneFilter === 'Glacier Zone' && styles.activeFilterButtonText
                ]}>
                  Glacier Zone
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  zoneFilter === 'Hydrothermal Vents' && styles.activeFilterButton
                ]}
                onPress={() => setZoneFilter('Hydrothermal Vents')}
              >
                <Text style={[
                  styles.filterButtonText,
                  zoneFilter === 'Hydrothermal Vents' && styles.activeFilterButtonText
                ]}>
                  Hydrothermal Vents
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* 🆕 NEW: Time Filters */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Time:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  timeFilter === 'all' && styles.activeFilterButton
                ]}
                onPress={() => setTimeFilter('all')}
              >
                <Text style={[
                  styles.filterButtonText,
                  timeFilter === 'all' && styles.activeFilterButtonText
                ]}>
                  All
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  timeFilter === 'Black Cliff' && styles.activeFilterButton
                ]}
                onPress={() => setTimeFilter('Black Cliff')}
              >
                <Text style={[
                  styles.filterButtonText,
                  timeFilter === 'Black Cliff' && styles.activeFilterButtonText
                ]}>
                  Black Cliff
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  timeFilter === 'Both' && styles.activeFilterButton
                ]}
                onPress={() => setTimeFilter('Both')}
              >
                <Text style={[
                  styles.filterButtonText,
                  timeFilter === 'Both' && styles.activeFilterButtonText
                ]}>
                  Both
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  timeFilter === 'Day' && styles.activeFilterButton
                ]}
                onPress={() => setTimeFilter('Day')}
              >
                <Text style={[
                  styles.filterButtonText,
                  timeFilter === 'Day' && styles.activeFilterButtonText
                ]}>
                  Day
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  timeFilter === 'Fog Coast' && styles.activeFilterButton
                ]}
                onPress={() => setTimeFilter('Fog Coast')}
              >
                <Text style={[
                  styles.filterButtonText,
                  timeFilter === 'Fog Coast' && styles.activeFilterButtonText
                ]}>
                  Fog Coast
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  timeFilter === 'Jellyfish Basin' && styles.activeFilterButton
                ]}
                onPress={() => setTimeFilter('Jellyfish Basin')}
              >
                <Text style={[
                  styles.filterButtonText,
                  timeFilter === 'Jellyfish Basin' && styles.activeFilterButtonText
                ]}>
                  Jellyfish Basin
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  timeFilter === 'Night' && styles.activeFilterButton
                ]}
                onPress={() => setTimeFilter('Night')}
              >
                <Text style={[
                  styles.filterButtonText,
                  timeFilter === 'Night' && styles.activeFilterButtonText
                ]}>
                  Night
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* 🆕 NEW: Reset Filters Button */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetFilters}
        >
          <Text style={styles.resetButtonText}>Reset All Filters</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredMarineLife}
        renderItem={renderMarineLifeItem}
        keyExtractor={item => item.name}
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
          {renderFishCard()}
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
    backgroundColor: '#2196F3',
    padding: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statsText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  controlsContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  // 🆕 NEW: Filter section styles
  filterSection: {
    marginBottom: 12,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: 'white',
  },
  // 🆕 NEW: Reset button styles
  resetButton: {
    backgroundColor: '#ff6b6b',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 8,
  },
  fishCard: {
    flex: 1,
    backgroundColor: 'white',
    margin: 4,
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  fishImageContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  fishImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  placeholderImage: {
    width: 80,
    height: 80,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  fishInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  fishName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  fishZone: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  fishWeight: {
    fontSize: 12,
    color: '#888',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  toggleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    backgroundColor: '#E91E63',
  },
  noBreedingButton: {
    backgroundColor: '#9E9E9E',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  modalImageContainer: {
    alignItems: 'center',
    padding: 16,
  },
  modalPlaceholderImage: {
    width: 200,
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  modalPlaceholderText: {
    fontSize: 64,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  detailsContainer: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  detailValue: {
    fontSize: 16,
    color: '#666',
    flex: 1,
    textAlign: 'right',
  },
  recipesContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  recipesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  recipeItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  modalButtonContainer: {
    marginTop: 20,
    gap: 12,
  },
  modalToggleButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MarineLifeScreen;
