// FILE LOCATION: App.js
// REPLACE THE ENTIRE EXISTING FILE WITH THIS CODE

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';

// Import screens
import MarineLifeScreen from './src/screens/MarineLifeScreen';
import RecipesScreen from './src/screens/RecipesScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Import database functions
import { initializeMarineLifeDatabase, getAllMarineLife } from './src/utils/marineLifeDatabase';
import RecipeScreen from './src/screens/RecipeScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [marineLifeList, setMarineLifeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Initialize the marine life database
      await initializeMarineLifeDatabase();
      
      // Get all marine life data
      const allMarineLife = getAllMarineLife();
      setMarineLifeList(allMarineLife);
      
      console.log(`Loaded ${allMarineLife.length} marine life entries`);
      
    } catch (error) {
      console.error('Failed to initialize database:', error);
      setError('Failed to load marine life data. Please restart the app.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading screen while initializing
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading Marine Life Database...</Text>
      </View>
    );
  }

  // Show error screen if initialization failed
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>⚠️</Text>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: '#666',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Tab.Screen
          name="Marine Life"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Text style={{ color, fontSize: size }}>🐟</Text>
            ),
            headerShown: false, // MarineLifeScreen has its own header
          }}
        >
          {() => (
            <MarineLifeScreen
              marineLifeList={marineLifeList}
              setMarineLifeList={setMarineLifeList}
            />
          )}
        </Tab.Screen>
        
        <Tab.Screen
          name="Recipes"
          component={RecipesScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Text style={{ color, fontSize: size }}>🍣</Text>
            ),
            title: 'Sushi Recipes',
          }}
        />
        
        <Tab.Screen
          name="Settings"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Text style={{ color, fontSize: size }}>⚙️</Text>
            ),
          }}
        >
          {() => (
            <SettingsScreen
              marineLifeList={marineLifeList}
              setMarineLifeList={setMarineLifeList}
              onDatabaseReset={initializeDatabase}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

