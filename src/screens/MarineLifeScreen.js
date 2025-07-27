// FILE LOCATION: src/screens/MarineLifeScreen.js
// REPLACE THE ENTIRE EXISTING FILE WITH THIS CODE

import React, { useEffect, useRef, useCallback, useReducer } from 'react';
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
  LayoutAnimation, // <--- Import LayoutAnimation
  Platform, // <--- Import Platform for LayoutAnimation
  UIManager, // <--- Import UIManager for LayoutAnimation
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

// Enable LayoutAnimation on Android
// On Android, LayoutAnimation is an experimental feature and needs to be enabled manually.
// This check ensures it only runs on Android to avoid issues on iOS where it's enabled by default.
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// FishThumbnail component (remains unchanged)
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

// Initial state for the reducer
const initialState = {
  allMarineLife: [],
  filteredMarineLife: [],
  stats: { total: 0, caught: 0, breedingPairs: 0, caughtPercentage: 0 },
  selectedFishIndex: -1,
  modalVisible: false,
  searchText: '',
  filterType: 'all',
  sortType: 'name_asc',
  filterExpanded: true, // <--- New state variable to control filter visibility
};

// Reducer function for managing state
function marineLifeReducer(state, action) {
  switch (action.type) {
    case 'SET_DATA':
      return { ...state, allMarineLife: action.payload.data, stats: action.payload.stats };
    case 'SET_FILTERED_DATA':
      return { ...state, filteredMarineLife: action.payload };
    case 'SET_SEARCH_TEXT':
      return { ...state, searchText: action.payload };
    case 'SET_FILTER_TYPE':
      return { ...state, filterType: action.payload };
    case 'SET_SORT_TYPE':
      return { ...state, sortType: action.payload };
    case 'OPEN_MODAL':
      return { ...state, modalVisible: true, selectedFishIndex: action.payload };
    case 'CLOSE_MODAL':
      return { ...state, modalVisible: false, selectedFishIndex: -1 };
    case 'SET_SELECTED_INDEX':
      return { ...state, selectedFishIndex: action.payload };
    case 'RESET_FILTERS':
      return { ...state, searchText: '', filterType: 'all' };
    case 'TOGGLE_FILTER_EXPAND': // <--- New action to toggle filter visibility
      return { ...state, filterExpanded: !state.filterExpanded };
    default:
      return state;
  }
}

// Main MarineLifeScreen component
const MarineLifeScreen = ({ route, navigation }) => {
  // Use useReducer to manage complex state logic
  const [state, dispatch] = useReducer(marineLifeReducer, initialState);
  const {
    allMarineLife,
    filteredMarineLife,
    stats,
    selectedFishIndex,
    modalVisible,
    searchText,
    filterType,
    sortType,
    filterExpanded, // <--- Destructure filterExpanded from state
  } = state;

  const swipeFlatListRef = useRef(null);

  // Sorting options for the marine life list
  const sortOptions = [
    { key: 'name_asc', label: 'Name (A-Z)' },
    { key: 'name_desc', label: 'Name (Z-A)' },
    { key: 'zone_asc', label: 'Zone' },
    { key: 'difficulty_desc', label: 'Difficulty (High-Low)' },
    { key: 'difficulty_asc', label: 'Difficulty (Low-High)' },
  ];

  // Effect to scroll the modal FlatList to the correct item when opened
  useEffect(() => {
    if (modalVisible && selectedFishIndex !== -1 && swipeFlatListRef.current) {
      // Using a timeout to ensure the list has had time to render before scrolling.
      // This is a common pattern in React Native for ensuring UI updates before interaction.
      setTimeout(() => {
        swipeFlatListRef.current?.scrollToIndex({
          index: selectedFishIndex,
          animated: false,
        });
      }, 100);
    }
  }, [modalVisible, selectedFishIndex]);

  // Effect to update the filtered list whenever the master list or filter/sort criteria change
  useEffect(() => {
    updateDisplayedData();
  }, [allMarineLife, searchText, filterType, sortType]);

  // Effect to handle navigation from other screens (e.g., Recipes) that might pass a marineLifeName
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
      // If visible, open the card and clear the navigation parameter to prevent re-triggering
      openFishCard(fishIndexInFiltered);
      navigation.setParams({ marineLifeName: undefined });
    } else {
      // If not visible in the current filtered list, check if it exists in the master list.
      // If it exists, reset filters to make it visible, which will re-trigger this effect.
      // If it doesn't exist at all, clear the param to avoid infinite loops.
      const fishExistsInMasterList = allMarineLife.some(
        (fish) => fish.name.toLowerCase() === fishNameToOpen.toLowerCase()
      );
      if (fishExistsInMasterList) {
        dispatch({ type: 'RESET_FILTERS' });
      } else {
        navigation.setParams({ marineLifeName: undefined });
      }
    }
  }, [route.params?.marineLifeName, allMarineLife, filteredMarineLife, navigation]);

  // useFocusEffect is a hook from React Navigation that runs when the screen is focused.
  // We use it here to refresh the marine life data and stats every time the screen becomes active.
  useFocusEffect(
    useCallback(() => {
      const refreshData = () => {
        const data = getAllMarineLife(); // Fetch all marine life data
        const currentStats = getMarineLifeStats(); // Fetch current statistics
        dispatch({ type: 'SET_DATA', payload: { data, stats: currentStats } }); // Update state
      };
      refreshData();
    }, []) // Empty dependency array means this effect runs once on mount and when screen gains focus
  );

  // Function to apply search, filter, and sort logic to the marine life data
  const updateDisplayedData = () => {
    let filtered = allMarineLife; // Start with all marine life

    // Apply search filter if search text is present
    if (searchText) {
      const lowercasedSearchText = searchText.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(lowercasedSearchText) ||
        item.zone.toLowerCase().includes(lowercasedSearchText)
      );
    }

    // Apply type filter (caught, uncaught, breeding, or all)
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

    // Apply sorting based on the selected sort type
    switch (sortType) {
      case 'name_asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'zone_asc':
        // Sort primarily by zone, then by name for consistent ordering within zones
        filtered.sort((a, b) => {
          const zoneCompare = a.zone.localeCompare(b.zone);
          if (zoneCompare !== 0) return zoneCompare;
          return a.name.localeCompare(b.name);
        });
        break;
      case 'difficulty_asc':
        // Sort primarily by difficulty (ascending), then by name
        filtered.sort((a, b) => {
          const diffCompare = a.difficulty - b.difficulty;
          if (diffCompare !== 0) return diffCompare;
          return a.name.localeCompare(b.name);
        });
        break;
      case 'difficulty_desc':
        // Sort primarily by difficulty (descending), then by name
        filtered.sort((a, b) => {
          const diffCompare = b.difficulty - a.difficulty;
          if (diffCompare !== 0) return diffCompare;
          return a.name.localeCompare(b.name);
        });
        break;
    }

    dispatch({ type: 'SET_FILTERED_DATA', payload: filtered }); // Update the filtered data in state
  };

  // Callback to toggle the 'caught' status of a marine life item
  const handleToggleCaught = useCallback(async (fishName, newStatus) => {
    await updateMarineLifeCaught(fishName, newStatus); // Update in the database
    const updatedData = getAllMarineLife(); // Get updated data
    const updatedStats = getMarineLifeStats(); // Get updated stats
    dispatch({ type: 'SET_DATA', payload: { data: updatedData, stats: updatedStats } }); // Update state
  }, []); // Empty dependency array means this function is memoized and only re-created if dependencies change

  // Callback to toggle the 'breeding pair' status of a marine life item
  const handleToggleBreedingPair = useCallback(async (fishName, newStatus) => {
    await updateMarineLifeBreedingPair(fishName, newStatus); // Update in the database
    const updatedData = getAllMarineLife(); // Get updated data
    const updatedStats = getMarineLifeStats(); // Get updated stats
    dispatch({ type: 'SET_DATA', payload: { data: updatedData, stats: updatedStats } }); // Update state
  }, []);

  // Function to open the detailed fish card modal
  const openFishCard = (index) => {
    dispatch({ type: 'OPEN_MODAL', payload: index });
  };

  // Callback to close the detailed fish card modal
  const closeFishCard = useCallback(() => {
    dispatch({ type: 'CLOSE_MODAL' });
  }, []);

  // Callback to navigate to the Recipes screen and open a specific recipe
  const handleSelectRecipe = useCallback((recipeName) => {
    closeFishCard(); // Close the current modal
    navigation.navigate('Recipes', { recipeName: recipeName }); // Navigate to Recipes screen
  }, [navigation, closeFishCard]);

  // Function to toggle the filter section's expanded state
  const toggleFilterExpand = () => {
    // LayoutAnimation.configureNext provides a smooth animation for layout changes.
    // It's configured to ease in and out over a duration of 300 milliseconds.
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    dispatch({ type: 'TOGGLE_FILTER_EXPAND' }); // Dispatch the action to change state
  };

  // Render function for each item in the main grid list
  const renderGridItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.fishCard}
      onPress={() => openFishCard(index)} // Open detailed card on press
    >
      <FishThumbnail item={item} /> {/* Display fish image/thumbnail */}

      <View style={styles.fishInfo}>
        <Text style={styles.fishName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.fishZone}>{item.zone}</Text>
        <Text style={styles.fishWeight}>{item.weight}</Text>
      </View>

      <View style={styles.buttonContainer}>
        {/* Toggle button for 'caught' status */}
        <TouchableOpacity
          style={[styles.toggleButton, item.caught ? styles.caughtButton : styles.uncaughtButton]}
          onPress={() => handleToggleCaught(item.name, !item.caught)}
        >
          <Text style={styles.buttonText}>
            {item.caught ? '✓' : 'o'}
          </Text>
        </TouchableOpacity>

        {/* Toggle button for 'breeding pair' status */}
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

  // Render function for the detailed fish card within the modal
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

      {/* Collapsible Search and Filter Controls */}
      <View style={styles.controlsContainer}>
        {/* Button to toggle filter section visibility */}
        <TouchableOpacity onPress={toggleFilterExpand} style={styles.collapseToggle}>
          <Text style={styles.collapseToggleText}>
            {filterExpanded ? 'Hide Filters ▲' : 'Show Filters ▼'}
          </Text>
        </TouchableOpacity>

        {/* Conditionally render the filter and sort section */}
        {filterExpanded && (
          <View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search marine life..."
              value={searchText}
              onChangeText={(text) => dispatch({ type: 'SET_SEARCH_TEXT', payload: text })}
              placeholderTextColor="#666"
            />

            <Text style={styles.controlLabel}>Filter by:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
              {['all', 'caught', 'uncaught', 'breeding'].map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterButton, filterType === filter && styles.activeFilterButton]}
                  onPress={() => dispatch({ type: 'SET_FILTER_TYPE', payload: filter })}
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
                  onPress={() => dispatch({ type: 'SET_SORT_TYPE', payload: option.key })}
                >
                  <Text style={[styles.filterButtonText, sortType === option.key && styles.activeFilterButtonText]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
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
                  dispatch({ type: 'SET_SELECTED_INDEX', payload: newIndex });
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
  // Style for the collapse toggle button
  collapseToggle: {
    alignItems: 'center', // Center the text horizontally
    paddingVertical: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 10,
  },
  collapseToggleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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