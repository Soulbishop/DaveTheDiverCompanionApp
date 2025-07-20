import React, { useEffect, useState } from 'react'; // Import useEffect and useState
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native'; // Import View, ActivityIndicator

import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import MarineLifeScreen from './src/screens/MarineLifeScreen';
import RecipesScreen from './src/screens/RecipesScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Import the database functions
import { initializeMarineLifeDatabase, getAllMarineLife } from './src/utils/marineLifeDatabase';

const Tab = createBottomTabNavigator();

export default function App() {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(true); // State to track data loading
  const [marineLifeList, setMarineLifeList] = useState([]); // State to hold marine life data

  // Initialize the database and load data when the component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        await initializeMarineLifeDatabase(); // Initialize the database
        const data = getAllMarineLife();      // Get all loaded marine life data
        setMarineLifeList(data);              // Set it to state
      } catch (error) {
        console.error("Failed to load marine life data:", error);
        // Implement error handling UI here if needed
      } finally {
        setIsLoading(false); // Set loading to false regardless of success or failure
      }
    };

    loadData();
  }, []); // Empty dependency array means this effect runs once after initial render

  // Show a loading indicator while data is being fetched
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading Marine Life Data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#2196F3',
            tabBarInactiveTintColor: '#757575',
            tabBarStyle: {
              ...styles.tabBar,
              paddingBottom: styles.tabBar.paddingBottom + insets.bottom,
              height: styles.tabBar.height + insets.bottom,
            },
            tabBarLabelStyle: styles.tabBarLabel,
          }}
        >
          <Tab.Screen 
            name="Marine Life" 
            // Pass the marineLifeList as an initial parameter to MarineLifeScreen
            children={() => <MarineLifeScreen marineLifeList={marineLifeList} />}
            options={{
              tabBarIcon: ({ color }) => (
                <Text style={[styles.tabIcon, { color }]}>🐟</Text>
              ),
            }}
          />
          <Tab.Screen 
            name="Recipes" 
            component={RecipesScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <Text style={[styles.tabIcon, { color }]}>🍣</Text>
              ),
            }}
          />
          <Tab.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <Text style={[styles.tabIcon, { color }]}>⚙️</Text>
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  tabIcon: {
    fontSize: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Or your desired loading screen background
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
});
