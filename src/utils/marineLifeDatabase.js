// FILE LOCATION: src/utils/marineLifeDatabase.js
// REPLACE THE ENTIRE EXISTING FILE WITH THIS CODE

import AsyncStorage from '@react-native-async-storage/async-storage';
import allMarineLifeData from '../data/allMarineLife'; // Import the complete marine life data

// Define a key for AsyncStorage to store user-specific data
const USER_MARINE_LIFE_DATA_KEY = '@DaveTheDiverCompanion:userMarineLife';

// In-memory store for the combined marine life data
// This will hold the static data merged with user-specific caught/breeding flags
let combinedMarineLifeData = [];

/**
 * Initializes the marine life database.
 * Loads static data, then attempts to load user-specific data from AsyncStorage
 * and merges it.
 */
export const initializeMarineLifeDatabase = async () => {
  try {
    console.log('Initializing marine life database...');
    
    // 1. Start with the static data from allMarineLife.js
    let baseData = allMarineLifeData.map(item => ({ ...item })); // Create a deep copy to avoid modifying original

    // 2. Load user-specific data from AsyncStorage
    const storedDataJson = await AsyncStorage.getItem(USER_MARINE_LIFE_DATA_KEY);
    let userStoredData = {};
    if (storedDataJson) {
      userStoredData = JSON.parse(storedDataJson);
    } else {
      console.log('No user data found in AsyncStorage. Using defaults.');
    }

    // 3. Merge user-specific data with base data
    // We'll primarily override 'caught' and 'breeding_pair'
    combinedMarineLifeData = baseData.map(item => {
      // Use marine life name as unique identifier to ensure consistency in keys
      const identifier = item.name;
      const userStatus = userStoredData[identifier];
      if (userStatus) {
        return {
          ...item,
          caught: userStatus.caught,
          breeding_pair: userStatus.breeding_pair,
        };
      }
      return item;
    });

    console.log('Marine life database initialized successfully.');
    // console.log('Sample combined data:', combinedMarineLifeData.slice(0, 5)); // Uncomment for debugging

  } catch (error) {
    console.error('Error initializing marine life database:', error);
  }
};

/**
 * Saves the current user-specific 'caught' and 'breeding_pair' states to AsyncStorage.
 * This function is optimized to only save the mutable flags.
 */
export const saveUserMarineLifeData = async (marineLifeList) => {
  try {
    const dataToSave = marineLifeList.reduce((acc, item) => {
      acc[item.name] = { // Use marine life name as unique identifier
        caught: item.caught,
        breeding_pair: item.breeding_pair,
      };
      return acc;
    }, {});
    
    await AsyncStorage.setItem(USER_MARINE_LIFE_DATA_KEY, JSON.stringify(dataToSave));
    console.log('User marine life data saved successfully.');
  } catch (error) {
    console.error('Error saving user marine life data:', error);
  }
};

/**
 * Returns all marine life data (static + user-specific).
 */
export const getAllMarineLife = () => {
  return combinedMarineLifeData;
};

/**
 * Returns marine life filtered by caught status.
 */
export const getCaughtMarineLife = () => {
  return combinedMarineLifeData.filter(item => item.caught);
};

/**
 * Returns marine life filtered by breeding pair status.
 */
export const getBreedingPairMarineLife = () => {
  return combinedMarineLifeData.filter(item => item.breeding_pair);
};

/**
 * Returns marine life filtered by zone.
 */
export const getMarineLifeByZone = (zone) => {
  return combinedMarineLifeData.filter(item => 
    item.zone.toLowerCase().includes(zone.toLowerCase())
  );
};

/**
 * Returns marine life filtered by active time (day/night/both).
 */
export const getMarineLifeByActiveTime = (activeTime) => {
  return combinedMarineLifeData.filter(item => 
    item.active_time.toLowerCase() === activeTime.toLowerCase() ||
    item.active_time.toLowerCase() === 'both'
  );
};

/**
 * Returns marine life filtered by difficulty level.
 */
export const getMarineLifeByDifficulty = (difficulty) => {
  return combinedMarineLifeData.filter(item => item.difficulty === difficulty);
};

/**
 * Searches marine life by name or zone.
 */
export const searchMarineLife = (searchTerm) => {
  const term = searchTerm.toLowerCase();
  return combinedMarineLifeData.filter(item =>
    item.name.toLowerCase().includes(term) ||
    item.zone.toLowerCase().includes(term)
  );
};

/**
 * Updates a specific marine life item's caught status.
 */
export const updateMarineLifeCaught = async (fishName, caughtStatus) => {
  try {
    // Update in memory
    const index = combinedMarineLifeData.findIndex(item => item.name === fishName);
    if (index !== -1) {
      combinedMarineLifeData[index].caught = caughtStatus;
      // Save to AsyncStorage
      await saveUserMarineLifeData(combinedMarineLifeData);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating marine life caught status:', error);
    return false;
  }
};

/**
 * Updates a specific marine life item's breeding pair status.
 */
export const updateMarineLifeBreedingPair = async (fishName, breedingStatus) => {
  try {
    // Update in memory
    const index = combinedMarineLifeData.findIndex(item => item.name === fishName);
    if (index !== -1) {
      combinedMarineLifeData[index].breeding_pair = breedingStatus;
      // Save to AsyncStorage
      await saveUserMarineLifeData(combinedMarineLifeData);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating marine life breeding pair status:', error);
    return false;
  }
};

/**
 * Gets statistics about the marine life collection.
 */
export const getMarineLifeStats = () => {
  const total = combinedMarineLifeData.length;
  const caught = combinedMarineLifeData.filter(item => item.caught).length;
  const breedingPairs = combinedMarineLifeData.filter(item => item.breeding_pair).length;
  
  return {
    total,
    caught,
    breedingPairs,
    caughtPercentage: total > 0 ? Math.round((caught / total) * 100) : 0,
    uncaught: total - caught,
  };
};

/**
 * Resets all user data (caught and breeding pair flags).
 */
export const resetAllUserData = async () => {
  try {
    await AsyncStorage.removeItem(USER_MARINE_LIFE_DATA_KEY);
    // Reset in-memory data
    combinedMarineLifeData = combinedMarineLifeData.map(item => ({
      ...item,
      caught: false,
      breeding_pair: false,
    }));
    console.log('All user data reset successfully.');
    return true;
  } catch (error) {
    console.error('Error resetting user data:', error);
    return false;
  }
};

