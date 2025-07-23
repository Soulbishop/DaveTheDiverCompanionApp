// FILE LOCATION: App.js
// REPLACE THE ENTIRE EXISTING FILE WITH THIS CODE

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';

// Import screens - CORRECTED IMPORT PATH
import MarineLifeScreen from './src/screens/MarineLifeScreen';
import RecipesScreen from './src/screens/RecipesScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Import database functions
import { initializeMarineLifeDatabase, getAllMarineLife } from './src/utils/marineLifeDatabase';

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
      console.log('Starting database initialization...');
      await initializeMarineLifeDatabase();
      console.log('Database initialized successfully');
      
      const data = await getAllMarineLife();
      console.log(`Loaded ${data.length} marine life entries`);
      setMarineLifeList(data);
      setIsLoading(false);
    } catch (err) {
      console.error('Database initialization failed:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading Dave the Diver Companion...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text style={styles.errorSubtext}>Please restart the app</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#0066cc',
          tabBarInactiveTintColor: '#666',
          tabBarStyle: {
            backgroundColor: '#f8f9fa',
            borderTopWidth: 1,
            borderTopColor: '#e9ecef',
          },
          headerStyle: {
            backgroundColor: '#0066cc',
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
          }}
          // Pass marineLifeList and setMarineLifeList as props
        >
          {(props) => <MarineLifeScreen {...props} marineLifeList={marineLifeList} setMarineLifeList={setMarineLifeList} />}
        </Tab.Screen>
        
        <Tab.Screen 
          name="Recipes" 
          component={RecipesScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Text style={{ color, fontSize: size }}>🍣</Text>
            ),
          }}
        />
        
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Text style={{ color, fontSize: size }}>⚙️</Text>
            ),
          }}
        />
      </Tab.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

