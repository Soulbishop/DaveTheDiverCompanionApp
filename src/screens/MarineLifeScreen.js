// FILE LOCATION: src/screens/MarineLifeScreen.js
// REPLACE THE ENTIRE EXISTING FILE WITH THIS CODE

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Image,
  TextInput,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  getAllMarineLife,
  updateMarineLifeCaught,
  updateMarineLifeBreedingPair,
  getMarineLifeStats,
} from '../utils/marineLifeDatabase';
import MarineLifeCard from '../components/MarineLifeCard';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

const FishThumbnail = ({ item, imageStyle, containerStyle, placeholderTextStyle }) => (
  <View style={[styles.fishImageContainer, containerStyle]}>
    {item.image_url ? (
      <Image
        accessibilityIgnoresInvertColors={true}
        source={{ uri: item.image_url }}
        style={[styles.fishImage, imageStyle]}
      />
    ) : (
      <View style={[styles.placeholderImage, imageStyle]}>
        <Text style={[styles.placeholderText, placeholderTextStyle]}>
          {item.name.includes('Shark') ? '🦈' : '🐟'}
        </Text>
      </View>
    )}
  </View>
);
const MarineLifeScreen = ({ route, navigation }) => {
  const [allMarineLife, setAllMarineLife] = useState([]);
  const [filteredMarineLife, setFilteredMarineLife] = useState([]);
  const [stats, setStats] = useState({ total: 0, caught: 0, breedingPairs: 0, caughtPercentage: 0 });

  const [selectedFishIndex, setSelectedFishIndex] = useState(-1);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortType, setSortType] = useState('name_asc');

  const swipeFlatListRef = useRef(null);

  const sortOptions = [
    { key: 'name_asc', label: 'Name (A-Z)' },
    { key: 'name_desc', label: 'Name (Z-A)' },
    { key: 'zone_asc', label: 'Zone' },
    { key: 'difficulty_desc', label: 'Difficulty (High-Low)' },
    { key: 'difficulty_asc', label: 'Difficulty (Low-High)' },
  ];

  // This effect handles scrolling the modal FlatList to the correct initial item.
  useEffect(() => {
    if (modalVisible && selectedFishIndex !== -1 && swipeFlatListRef.current) {
      // Using a timeout to ensure the list has had time to render before scrolling.
      setTimeout(() => {
        swipeFlatListRef.current?.scrollToIndex({
          index: selectedFishIndex,
          animated: false,
        });
      }, 100);
    }
  }, [modalVisible, selectedFishIndex]);

  // Update filtered list when marineLifeList or filters change
  useEffect(() => {
    updateDisplayedData();
  }, [allMarineLife, searchText, filterType, sortType]);

  // Handle navigation from other screens (e.g., Recipes)
useEffect(() => {
    const fishNameToOpen = route.params?.marineLifeName;
    // Exit early if no name is passed or data isn't ready
    if (!fishNameToOpen || allMarineLife.length === 0) {
      return;
    }

    // Check if the fish is currently visible in the filtered list
    const fishIndexInFiltered = filteredMarineLife.findIndex(
      (fish) => fish.name.toLowerCase() === fishNameToOpen.toLowerCase()
    );

    if (fishIndexInFiltered !== -1) {
      // If visible, open the card and clear the navigation parameter
      openFishCard(fishIndexInFiltered);
      navigation.setParams({ marineLifeName: undefined });
    } else {
      // If not visible, reset filters. The component will re-render,
      // this effect will run again, and the condition above will be met.
      const fishExistsInMasterList = allMarineLife.some(
        (fish) => fish.name.toLowerCase() === fishNameToOpen.toLowerCase()
      );
      if (fishExistsInMasterList) {
        setSearchText('');
        setFilterType('all');
      } else {
        // Fish doesn't exist at all, clear param to avoid infinite loops
        navigation.setParams({ marineLifeName: undefined });
      }
    }
  }, [route.params?.marineLifeName, allMarineLife, filteredMarineLife, navigation]);

  // useFocusEffect is like useEffect but runs when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const refreshData = () => {
        const data = getAllMarineLife();
        const currentStats = getMarineLifeStats();
        setAllMarineLife(data);
        setStats(currentStats);
      };
      refreshData();
    }, [])
  );

  const updateDisplayedData = () => {
    let filtered = allMarineLife;

    // Apply search filter
    if (searchText) {
      const lowercasedSearchText = searchText.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(lowercasedSearchText) ||
        item.zone.toLowerCase().includes(lowercasedSearchText)
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
        filtered = filtered.filter(item => item.breeding_pair);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Apply sorting
    switch (sortType) {
      case 'name_asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'zone_asc':
        // Sort by zone, then by name for items in the same zone
        filtered.sort((a, b) => {
          const zoneCompare = a.zone.localeCompare(b.zone);
          if (zoneCompare !== 0) return zoneCompare;
          return a.name.localeCompare(b.name);
        });
        break;
      case 'difficulty_asc':
        filtered.sort((a, b) => {
          const diffCompare = a.difficulty - b.difficulty;
          if (diffCompare !== 0) return diffCompare;
          return a.name.localeCompare(b.name);
        });
        break;
      case 'difficulty_desc':
        filtered.sort((a, b) => {
          const diffCompare = b.difficulty - a.difficulty;
          if (diffCompare !== 0) return diffCompare;
          return a.name.localeCompare(b.name);
        });
        break;
    }

    setFilteredMarineLife(filtered);
  };

  const handleToggleCaught = useCallback(async (fishName, newStatus) => {
    await updateMarineLifeCaught(fishName, newStatus);
    const updatedData = getAllMarineLife();
    const updatedStats = getMarineLifeStats();
    setAllMarineLife(updatedData);
    setStats(updatedStats);
  }, []);

  const handleToggleBreedingPair = useCallback(async (fishName, newStatus) => {
    await updateMarineLifeBreedingPair(fishName, newStatus);
    const updatedData = getAllMarineLife();
    const updatedStats = getMarineLifeStats();
    setAllMarineLife(updatedData);
    setStats(updatedStats);
  }, []);

  const openFishCard = (index) => {
    setSelectedFishIndex(index);
    setModalVisible(true);
  };

  const closeFishCard = useCallback(() => {
    setModalVisible(false);
    setSelectedFishIndex(-1);
  }, []);

  const handleSelectRecipe = useCallback((recipeName) => {
    closeFishCard();
    navigation.navigate('Recipes', { recipeName: recipeName });
  }, [navigation, closeFishCard]);

  const renderGridItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.fishCard}
      onPress={() => openFishCard(index)}
    >
      <FishThumbnail item={item} />

      <View style={styles.fishInfo}>
        <Text style={styles.fishName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.fishZone}>{item.zone}</Text>
        <Text style={styles.fishWeight}>{item.weight}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, item.caught ? styles.caughtButton : styles.uncaughtButton]}
          onPress={() => handleToggleCaught(item.name, !item.caught)}
        >
          <Text style={styles.buttonText}>
            {item.caught ? '✓' : 'o'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, item.breeding_pair ? styles.breedingButton : styles.noBreedingButton]}
          onPress={() => handleToggleBreedingPair(item.name, !item.breeding_pair)}
        >
          <Text style={styles.buttonText}>
            {item.breeding_pair ? '♥' : 'o'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderDetailedFishCard = useCallback(({ item }) => {
    const cardWidth = windowWidth * 0.9;
    const cardMargin = 4;
    return (
      <View
        style={{
          width: cardWidth,
          marginHorizontal: cardMargin,
          height: windowHeight * 0.7,
        }}
      >
        <View style={styles.detailedCard}>
          <FishThumbnail
            item={item}
            containerStyle={styles.detailedImageContainer}
            imageStyle={styles.detailedImage}
            placeholderTextStyle={styles.detailedPlaceholderText}
          />
          <MarineLifeCard
            fish={item}
            onClose={closeFishCard}
            onToggleCaught={handleToggleCaught}
            onToggleBreeding={handleToggleBreedingPair}
            onSelectRecipe={handleSelectRecipe}
          />
        </View>
      </View>
    );
  }, [closeFishCard, handleSelectRecipe, handleToggleBreedingPair, handleToggleCaught]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Statistics */}
      <View style={styles.header}>
        <Text style={styles.title}>Marine Life Tracker</Text>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Caught: {stats.caught}/{stats.total} ({stats.caughtPercentage}%)
          </Text>
          <Text style={styles.statsText}>
            Breeding Pairs: {stats.breedingPairs}
          </Text>
        </View>
      </View>

      {/* Search and Filter Controls */}
      <View style={styles.controlsContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search marine life..."
          value={searchText}
          onChangeText={(text) => setSearchText(text)}
          placeholderTextColor="#666"
        />

        <Text style={styles.controlLabel}>Filter by:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {['all', 'caught', 'uncaught', 'breeding'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterButton, filterType === filter && styles.activeFilterButton]}
              onPress={() => setFilterType(filter)}
            >
              <Text style={[styles.filterButtonText, filterType === filter && styles.activeFilterButtonText]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.controlLabel}>Sort by:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[styles.filterButton, sortType === option.key && styles.activeFilterButton]}
              onPress={() => setSortType(option.key)}
            >
              <Text style={[styles.filterButtonText, sortType === option.key && styles.activeFilterButtonText]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Marine Life Grid */}
      <FlatList
        data={filteredMarineLife}
        renderItem={renderGridItem}
        keyExtractor={(item) => item.name}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Swipable Detailed Fish Card Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeFishCard}
      >
        <View style={styles.modalOverlay}>
          {modalVisible && filteredMarineLife.length > 0 && selectedFishIndex !== -1 && (
            <FlatList
              ref={swipeFlatListRef}
              data={filteredMarineLife}
              renderItem={renderDetailedFishCard}
              keyExtractor={(item) => item.name}
              horizontal
              pagingEnabled={false}
              snapToInterval={(windowWidth * 0.9) + (4 * 2)} // Card width + horizontal margins
              snapToAlignment="center"
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={selectedFishIndex}
              getItemLayout={(data, index) => {
                const itemWidth = (windowWidth * 0.9) + (4 * 2);
                return { length: itemWidth, offset: itemWidth * index, index };
              }}
              onMomentumScrollEnd={(event) => {
                const itemWidth = (windowWidth * 0.9) + (4 * 2);
                const newIndex = Math.round(event.nativeEvent.contentOffset.x / itemWidth);
                if (newIndex !== selectedFishIndex) {
                  setSelectedFishIndex(newIndex);
                }
              }}
              style={styles.modalFlatList}
              contentContainerStyle={styles.modalFlatListContent}
            />
          )}
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
    paddingTop: 40, // Increased padding for notch
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
  controlLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  filterButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: 'white',
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
    resizeMode: 'contain',
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
  detailedCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  detailedImageContainer: {
    marginBottom: 0,
    backgroundColor: '#f0f0f0',
  },
  detailedImage: {
    width: '100%',
    height: windowHeight * 0.25,
    resizeMode: 'contain',
  },
  detailedPlaceholderText: {
    fontSize: 80,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center', // Center the FlatList vertically
    alignItems: 'center',
  },
  modalFlatList: {
    flexGrow: 0, // Prevent FlatList from taking full screen height
    height: windowHeight * 0.75, // Set explicit height for the list area
  },
  modalFlatListContent: {
    // Padding to ensure the first and last items can be centered
    paddingHorizontal: (windowWidth - (windowWidth * 0.9) - (4 * 2)) / 2,
  },
});

export default MarineLifeScreen;
