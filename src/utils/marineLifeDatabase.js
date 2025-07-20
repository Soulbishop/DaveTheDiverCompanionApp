// src/utils/marineLifeDatabase.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import allMarineLifeData from '../data/allMarineLife'; // Your static marine life data

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
    let baseData = allMarineLifeData.map(item => ({ ...item })); // Create a deep copy to avoid modifying original static data

    // 2. Load user-specific data from AsyncStorage
    const storedDataJson = await AsyncStorage.getItem(USER_MARINE_LIFE_DATA_KEY);
    let userStoredData = {};
    if (storedDataJson) {
      userStoredData = JSON.parse(storedDataJson);
      console.log('Loaded user data from AsyncStorage:', userStoredData);
    } else {
      console.log('No user data found in AsyncStorage. Using defaults.');
    }

    // 3. Merge user-specific data with base data
    // We'll primarily override 'caught' and 'breeding_pair'
    combinedMarineLifeData = baseData.map(item => {
      // Use marine life name as unique identifier, ensure consistency in keys
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
const saveUserMarineLifeData = async () => {
  try {
    const dataToSave = combinedMarineLifeData.reduce((acc, item) => {
      acc[item.name] = { // Use marine life name as unique identifier
        caught: item.caught,
        breeding_pair: item.breeding_pair,
      };
      return acc;
    }, {});
    await AsyncStorage.setItem(USER_MARINE_LIFE_DATA_KEY, JSON.stringify(dataToSave));
    console.log('User marine life data saved to AsyncStorage.');
  } catch (error) {
    console.error('Error saving user marine life data:', error);
  }
};

/**
 * Returns all marine life data currently loaded.
 * @returns {Array} An array of marine life objects.
 */
export const getAllMarineLife = () => {
  return combinedMarineLifeData;
};

/**
 * Updates the 'caught' status for a specific marine life and saves to AsyncStorage.
 * @param {string} name The name of the marine life to update (assumed unique).
 * @param {boolean} isCaught The new caught status.
 */
export const updateCaughtStatus = async (name, isCaught) => {
  const index = combinedMarineLifeData.findIndex(item => item.name === name);
  if (index !== -1) {
    combinedMarineLifeData[index].caught = isCaught;
    await saveUserMarineLifeData();
    console.log(`Updated ${name} caught status to ${isCaught}.`);
  } else {
    console.warn(`Marine life with name "${name}" not found for updating caught status.`);
  }
};

/**
 * Updates the 'breeding_pair' status for a specific marine life and saves to AsyncStorage.
 * @param {string} name The name of the marine life to update (assumed unique).
 * @param {boolean} hasBreedingPair The new breeding_pair status.
 */
export const updateBreedingPairStatus = async (name, hasBreedingPair) => {
  const index = combinedMarineLifeData.findIndex(item => item.name === name);
  if (index !== -1) {
    combinedMarineLifeData[index].breeding_pair = hasBreedingPair;
    await saveUserMarineLifeData();
    console.log(`Updated ${name} breeding_pair status to ${hasBreedingPair}.`);
  } else {
    console.warn(`Marine life with name "${name}" not found for updating breeding pair status.`);
  }
};
