// src/context/ToCatchListContext.js

import React, { createContext, useReducer, useContext } from 'react';
import { getAllMarineLife } from '../utils/marineLifeDatabase'; // Assuming this provides full marine life data

// Define the initial state for our To-Catch list
const initialState = {
  // The 'items' array will hold the marine life needed, with quantities and caught status
  // Example: [{ name: 'Tuna', quantityNeeded: 2, isCaughtOnList: false, sourceRecipes: ['Tuna Sushi', 'Tuna Steak'] }]
  items: [],
};

// Define action types for our reducer
const TO_CATCH_ACTIONS = {
  ADD_RECIPE: 'add_recipe',
  REMOVE_RECIPE: 'remove_recipe',
  TOGGLE_CAUGHT: 'toggle_caught',
  CLEAR_LIST: 'clear_list',
};

// The reducer function that manages the state of the To-Catch list
// It takes the current state and an action, and returns the new state.
const toCatchListReducer = (state, action) => {
  switch (action.type) {
    case TO_CATCH_ACTIONS.ADD_RECIPE: {
      const { recipe } = action.payload; // 'recipe' is the full recipe object
      const allMarineLife = getAllMarineLife(); // Get all marine life for cross-referencing
      const newItems = [...state.items]; // Create a mutable copy of the current items

      // Iterate over each ingredient in the added recipe
      recipe.ingredients.forEach(ingredientName => {
        // Find the corresponding marine life in our database
        const marineLife = allMarineLife.find(ml =>
          ml.name.toLowerCase() === ingredientName.toLowerCase()
        );

        // If it's a valid marine life ingredient
        if (marineLife) {
          const existingItemIndex = newItems.findIndex(
            item => item.name.toLowerCase() === marineLife.name.toLowerCase()
          );

          if (existingItemIndex > -1) {
            // If the item already exists in the list, update its quantity and source recipes
            const existingItem = newItems[existingItemIndex];
            newItems[existingItemIndex] = {
              ...existingItem,
              quantityNeeded: existingItem.quantityNeeded + 1, // Increment quantity
              sourceRecipes: [...new Set([...existingItem.sourceRecipes, recipe.name])], // Add recipe name if new
            };
          } else {
            // If it's a new item, add it to the list
            newItems.push({
              name: marineLife.name,
              image_url: marineLife.image_url, // Use the thumbnail for the list
              quantityNeeded: 1,
              isCaughtOnList: false, // Default to not caught for this list
              sourceRecipes: [recipe.name],
            });
          }
        } else {
          // Optional: Log or handle cases where an ingredient is not found in marine life database
          console.warn(`Ingredient '${ingredientName}' from recipe '${recipe.name}' not found in marine life database.`);
        }
      });

      return { ...state, items: newItems };
    }

    case TO_CATCH_ACTIONS.REMOVE_RECIPE: {
      const { recipeToRemove } = action.payload; // The recipe object to remove

      // This is a more complex operation as we need to decrement quantities
      // and potentially remove items if their quantity drops to zero.
      const updatedItems = [];
      const allMarineLife = getAllMarineLife(); // Get all marine life for cross-referencing

      state.items.forEach(currentItem => {
        // Check if this marine life was sourced by the recipe being removed
        const isSourcedByRemovedRecipe = currentItem.sourceRecipes.includes(recipeToRemove.name);

        if (isSourcedByRemovedRecipe) {
          // Find the marine life in the database to get its ingredients
          const marineLifeInDb = allMarineLife.find(ml =>
            ml.name.toLowerCase() === currentItem.name.toLowerCase()
          );

          if (marineLifeInDb) {
            // Decrement quantity based on how many times this marine life is an ingredient
            // in the *removed* recipe. For simplicity, we assume each ingredient in a recipe
            // contributes 1 to the quantity. If a recipe lists an ingredient multiple times,
            // this logic would need to be adjusted.
            const countInRemovedRecipe = recipeToRemove.ingredients.filter(
              ing => ing.toLowerCase() === currentItem.name.toLowerCase()
            ).length;

            const newQuantity = currentItem.quantityNeeded - countInRemovedRecipe;

            if (newQuantity > 0) {
              // If quantity is still positive, update it and remove the source recipe
              updatedItems.push({
                ...currentItem,
                quantityNeeded: newQuantity,
                sourceRecipes: currentItem.sourceRecipes.filter(
                  name => name !== recipeToRemove.name
                ),
              });
            }
            // If newQuantity is 0 or less, the item is effectively removed from the list.
          } else {
            // If marine life not found, just keep the current item as is (or handle error)
            updatedItems.push(currentItem);
          }
        } else {
          // If not sourced by the removed recipe, keep the item as is
          updatedItems.push(currentItem);
        }
      });

      return { ...state, items: updatedItems };
    }

    case TO_CATCH_ACTIONS.TOGGLE_CAUGHT: {
      const { marineLifeName } = action.payload;
      return {
        ...state,
        items: state.items.map(item =>
          item.name === marineLifeName
            ? { ...item, isCaughtOnList: !item.isCaughtOnList }
            : item
        ),
      };
    }

    case TO_CATCH_ACTIONS.CLEAR_LIST:
      return { ...state, items: [] }; // Reset items to an empty array

    default:
      return state;
  }
};

// Create the Context object
export const ToCatchListContext = createContext();

// Create the Provider component
export const ToCatchListProvider = ({ children }) => {
  // useReducer hook to manage state with our reducer function
  const [state, dispatch] = useReducer(toCatchListReducer, initialState);

  // The value provided to consumers of this context
  const contextValue = {
    toCatchList: state.items, // The actual list of items
    dispatchToCatchList: dispatch, // The dispatch function to send actions
    TO_CATCH_ACTIONS, // Export action types for convenience
  };

  return (
    <ToCatchListContext.Provider value={contextValue}>
      {children}
    </ToCatchListContext.Provider>
  );
};

// Custom hook to easily consume the ToCatchListContext
export const useToCatchList = () => {
  const context = useContext(ToCatchListContext);
  if (context === undefined) {
    throw new Error('useToCatchList must be used within a ToCatchListProvider');
  }
  return context;
};
