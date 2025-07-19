import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const MarineLifeCard = ({ marineLife, onToggleCaught, onToggleBreeding }) => {
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return '#4CAF50';
      case 'uncommon': return '#FF9800';
      case 'rare': return '#9C27B0';
      case 'legendary': return '#F44336';
      default: return '#757575';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <View style={[styles.placeholder, { backgroundColor: getRarityColor(marineLife.rarity) }]}>
          <Text style={styles.placeholderText}>{marineLife.name.charAt(0)}</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name}>{marineLife.name}</Text>
        <Text style={styles.zone}>{marineLife.zone}</Text>
        <Text style={styles.details}>
          {marineLife.timeOfDay} • {marineLife.captureMethod}
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, marineLife.caught ? styles.caughtButton : styles.notCaughtButton]}
            onPress={() => onToggleCaught(marineLife.id)}
          >
            <Text style={[styles.buttonText, marineLife.caught ? styles.caughtText : styles.notCaughtText]}>
              {marineLife.caught ? '✓ Caught' : 'Not Caught'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, marineLife.breedingPair ? styles.breedingButton : styles.noBreedingButton]}
            onPress={() => onToggleBreeding(marineLife.id)}
          >
            <Text style={[styles.buttonText, marineLife.breedingPair ? styles.breedingText : styles.noBreedingText]}>
              {marineLife.breedingPair ? '♥ Pair' : 'No Pair'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  placeholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  zone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  details: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  caughtButton: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  notCaughtButton: {
    backgroundColor: '#FFF',
    borderColor: '#DDD',
  },
  breedingButton: {
    backgroundColor: '#FCE4EC',
    borderColor: '#E91E63',
  },
  noBreedingButton: {
    backgroundColor: '#FFF',
    borderColor: '#DDD',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  caughtText: {
    color: '#4CAF50',
  },
  notCaughtText: {
    color: '#666',
  },
  breedingText: {
    color: '#E91E63',
  },
  noBreedingText: {
    color: '#666',
  },
});

export default MarineLifeCard;

