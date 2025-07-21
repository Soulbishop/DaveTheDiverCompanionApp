// FILE LOCATION: src/screens/MarineLifeScreen.js
// REPLACE THE ENTIRE EXISTING FILE WITH THIS CODE

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

// FIX: Statically require all images for Metro Bundler with the CORRECT relative path
// This maps each image filename (string) to its required module.
const marineLifeThumbnails = {
  'American_Lobster.png': require('../../assets/marine_life_thumbs/American_Lobster.png'),
  'Barrel_Jellyfish.png': require('../../assets/marine_life_thumbs/Barrel_Jellyfish.png'),
  'Big_Belly_Seahorse.png': require('../../assets/marine_life_thumbs/Big_Belly_Seahorse.png'),
  'Black_and_White_Snapper.png': require('../../assets/marine_life_thumbs/Black_and_White_Snapper.png'),
  'Blacktip_Reefshark.png': require('../../assets/marine_life_thumbs/Blacktip_Reefshark.png'),
  'Blue_Lobster.png': require('../../assets/marine_life_thumbs/Blue_Lobster.png'),
  'Blue_Tang.png': require('../../assets/marine_life_thumbs/Blue_Tang.png'),
  'Bluefin_Tuna.png': require('../../assets/marine_life_thumbs/Bluefin_Tuna.png'),
  'Box_Jellyfish.png': require('../../assets/marine_life_thumbs/Box_Jellyfish.png'),
  'Cardinal_Fish.png': require('../../assets/marine_life_thumbs/Cardinal_Fish.png'),
  'Clearfin_Lionfish.png': require('../../assets/marine_life_thumbs/Clearfin_Lionfish.png'),
  'Clownfish.png': require('../../assets/marine_life_thumbs/Clownfish.png'),
  'Comber.png': require('../../assets/marine_life_thumbs/Comber.png'),
  'Copper_Shark.png': require('../../assets/marine_life_thumbs/Copper_Shark.png'),
  'Emperor_Angelfish.png': require('../../assets/marine_life_thumbs/Emperor_Angelfish.png'),
  'European_Lobster.png': require('../../assets/marine_life_thumbs/European_Lobster.png'),
  'Flame_Angelfish.png': require('../../assets/marine_life_thumbs/Flame_Angelfish.png'),
  'Fried_Egg_Jellyfish.png': require('../../assets/marine_life_thumbs/Fried_Egg_Jellyfish.png'),
  'Great_White_Shark_Klaus.png': require('../../assets/marine_life_thumbs/Great_White_Shark_Klaus.png'),
  'Green_Humphead_Parrotfish.png': require('../../assets/marine_life_thumbs/Green_Humphead_Parrotfish.png'),
  'Green_Sea_Urchin.png': require('../../assets/marine_life_thumbs/Green_Sea_Urchin.png'),
  'Jayakars_Seahorse.png': require('../../assets/marine_life_thumbs/Jayakars_Seahorse.png'),
  'Lagoon_Triggerfish.png': require('../../assets/marine_life_thumbs/Lagoon_Triggerfish.png'),
  'Long_Snouted_Seahorse.png': require('../../assets/marine_life_thumbs/Long_Snouted_Seahorse.png'),
  'Longfin_Batfish.png': require('../../assets/marine_life_thumbs/Longfin_Batfish.png'),
  'Longspine_Porcupinefish.png': require('../../assets/marine_life_thumbs/Longspine_Porcupinefish.png'),
  'Longspine_Squirrelfish.png': require('../../assets/marine_life_thumbs/Longspine_Squirrelfish.png'),
  'Mantis_Shrimp.png': require('../../assets/marine_life_thumbs/Mantis_Shrimp.png'),
  'Marbled_Electric_Ray.png': require('../../assets/marine_life_thumbs/Marbled_Electric_Ray.png'),
  'Marlin.png': require('../../assets/marine_life_thumbs/Marlin.png'),
  'Mediterranean_Parrotfish.png': require('../../assets/marine_life_thumbs/Mediterranean_Parrotfish.png'),
  'Moray_Eel.png': require('../../assets/marine_life_thumbs/Moray_Eel.png'),
  'Orbicular_Batfish.png': require('../../assets/marine_life_thumbs/Orbicular_Batfish.png'),
  'Ornate_Wrasse.png': require('../../assets/marine_life_thumbs/Ornate_Wrasse.png'),
  'Pacific_Seahorse.png': require('../../assets/marine_life_thumbs/Pacific_Seahorse.png'),
  'Purple_Sea_Urchin.png': require('../../assets/marine_life_thumbs/Purple_Sea_Urchin.png'),
  'Pyramid_Butterflyfish.png': require('../../assets/marine_life_thumbs/Pyramid_Butterflyfish.png'),
  'Rainbow_Wrasse.png': require('../../assets/marine_life_thumbs/Rainbow_Wrasse.png'),
  'Red_Lionfish.png': require('../../assets/marine_life_thumbs/Red_Lionfish.png'),
  'Red_banded_Lobster.png': require('../../assets/marine_life_thumbs/Red_banded_Lobster.png'),
  'Redtoothed_Triggerfish.png': require('../../assets/marine_life_thumbs/Redtoothed_Triggerfish.png'),
  'Salema_Porgy.png': require('../../assets/marine_life_thumbs/Salema_Porgy.png'),
  'Sea_Goldie.png': require('../../assets/marine_life_thumbs/Sea_Goldie.png'),
  'Sheepshead.png': require('../../assets/marine_life_thumbs/Sheepshead.png'),
  'Shortfin_Mako.png': require('../../assets/marine_life_thumbs/Shortfin_Mako.png'),
  'Small_Spotted_Dart.png': require('../../assets/marine_life_thumbs/Small_Spotted_Dart.png'),
  'Starry_Puffer.png': require('../../assets/marine_life_thumbs/Starry_Puffer.png'),
  'Stingray.png': require('../../assets/marine_life_thumbs/Stingray.png'),
  'Striped_Catfish.png': require('../../assets/marine_life_thumbs/Striped_Catfish.png'),
  'Thresher_Shark.png': require('../../assets/marine_life_thumbs/Thresher_Shark.png'),
  'Titan_Triggerfish.png': require('../../assets/marine_life_thumbs/Titan_Triggerfish.png'),
  'Truck_Hermit_Crab.png': require('../../assets/marine_life_thumbs/Truck_Hermit_Crab.png'),
  'White_Shrimp.png': require('../../assets/marine_life_thumbs/White_Shrimp.png'),
  'Whiteleg_Shrimp.png': require('../../assets/marine_life_thumbs/Whiteleg_Shrimp.png'),
  'Whitetip_Reefshark.png': require('../../assets/marine_life_thumbs/Whitetip_Reefshark.png'),
  'Yellow_Tang.png': require('../../assets/marine_life_thumbs/Yellow_Tang.png'),
  'Yellowback_Fusilier.png': require('../../assets/marine_life_thumbs/Yellowback_Fusilier.png'),
  'Yellowfin_Tuna.png': require('../../assets/marine_life_thumbs/Yellowfin_Tuna.png'),
  'Zebra_Shark.png': require('../../assets/marine_life_thumbs/Zebra_Shark.png'),
  'Atlantic_Anglerfish.png': require('../../assets/marine_life_thumbs/Atlantic_Anglerfish.png'),
  'Atlantic_Bonito.png': require('../../assets/marine_life_thumbs/Atlantic_Bonito.png'),
  'Atlantic_Mackerel.png': require('../../assets/marine_life_thumbs/Atlantic_Mackerel.png'),
  'Bigeye_Scad.png': require('../../assets/marine_life_thumbs/Bigeye_Scad.png'),
  'Bigeye_Trevally.png': require('../../assets/marine_life_thumbs/Bigeye_Trevally.png'),
  'Black_Tiger_Shrimp.png': require('../../assets/marine_life_thumbs/Black_Tiger_Shrimp.png'),
  'Blackfin_Barracuda.png': require('../../assets/marine_life_thumbs/Blackfin_Barracuda.png'),
  'Bluehead_Tilefish.png': require('../../assets/marine_life_thumbs/Bluehead_Tilefish.png'),
  'California_Spiny_Lobster.png': require('../../assets/marine_life_thumbs/California_Spiny_Lobster.png'),
  'Clown_Frogfish.png': require('../../assets/marine_life_thumbs/Clown_Frogfish.png'),
  'Coral_Trout.png': require('../../assets/marine_life_thumbs/Coral_Trout.png'),
  'Crystal_Lobster.png': require('../../assets/marine_life_thumbs/Crystal_Lobster.png'),
  'Cuttlefish.png': require('../../assets/marine_life_thumbs/Cuttlefish.png'),
  'Devil_Scorpionfish.png': require('../../assets/marine_life_thumbs/Devil_Scorpionfish.png'),
  'Dusky_Grouper.png': require('../../assets/marine_life_thumbs/Dusky_Grouper.png'),
  'Dwarf_Seahorse.png': require('../../assets/marine_life_thumbs/Dwarf_Seahorse.png'),
  'Fan_Lobster.png': require('../../assets/marine_life_thumbs/Fan_Lobster.png'),
  'Giant_Squid.png': require('../../assets/marine_life_thumbs/Giant_Squid.png'),
  'Giant_Trevally.png': require('../../assets/marine_life_thumbs/Giant_Trevally.png'),
  'Giraffe_Seahorse.png': require('../../assets/marine_life_thumbs/Giraffe_Seahorse.png'),
  'Great_Barracuda.png': require('../../assets/marine_life_thumbs/Great_Barracuda.png'),
  'Grey_Triggerfish.png': require('../../assets/marine_life_thumbs/Grey_Triggerfish.png'),
  'Harlequin_Hind.png': require('../../assets/marine_life_thumbs/Harlequin_Hind.png'),
  'Hedgehog_Seahorse.png': require('../../assets/marine_life_thumbs/Hedgehog_Seahorse.png'),
  'Humboldt_Squid.png': require('../../assets/marine_life_thumbs/Humboldt_Squid.png'),
  'Longnose_Sawshark.png': require('../../assets/marine_life_thumbs/Longnose_Sawshark.png'),
  'Lusca.png': require('../../assets/marine_life_thumbs/Lusca.png'),
  'Mackerel_Scad.png': require('../../assets/marine_life_thumbs/Mackerel_Scad.png'),
  'Narrow_Barred_Spanish_Mackerel.png': require('../../assets/marine_life_thumbs/Narrow_Barred_Spanish_Mackerel.png'),
  'Painted_Comber.png': require('../../assets/marine_life_thumbs/Painted_Comber.png'),
  'Sailfish.png': require('../../assets/marine_life_thumbs/Sailfish.png'),
  'Sally_Lightfoot_Crab.png': require('../../assets/marine_life_thumbs/Sally_Lightfoot_Crab.png'),
  'Smooth_Hammerhead.png': require('../../assets/marine_life_thumbs/Smooth_Hammerhead.png'),
  'Spear_Squid.png': require('../../assets/marine_life_thumbs/Spear_Squid.png'),
  'Spiny_Seahorse.png': require('../../assets/marine_life_thumbs/Spiny_Seahorse.png'),
  'Striped_Red_Mullet.png': require('../../assets/marine_life_thumbs/Striped_Red_Mullet.png'),
  'Tiger_Shark.png': require('../../assets/marine_life_thumbs/Tiger_Shark.png'),
  'Tiger_Tail_Seahorse.png': require('../../assets/marine_life_thumbs/Tiger_Tail_Seahorse.png'),
  'Tropical_Rock_Lobster.png': require('../../assets/marine_life_thumbs/Tropical_Rock_Lobster.png'),
  'White_Spotted_Jellyfish.png': require('../../assets/marine_life_thumbs/White_Spotted_Jellyfish.png'),
  'White_Trevally.png': require('../../assets/marine_life_thumbs/White_Trevally.png'),
  'Zebra_Seahorse.png': require('../../assets/marine_life_thumbs/Zebra_Seahorse.png'),
  'Blood_belly_Comb_Jellyfish.png': require('../../assets/marine_life_thumbs/Blood_belly_Comb_Jellyfish.png'),
  'Bluespotted_Stargazer.png': require('../../assets/marine_life_thumbs/Bluespotted_Stargazer.png'),
  'Chambered_Nautilus.png': require('../../assets/marine_life_thumbs/Chambered_Nautilus.png'),
  'Clione.png': require('../../assets/marine_life_thumbs/Clione.png'),
  'Clione_Queen.png': require('../../assets/marine_life_thumbs/Clione_Queen.png'),
  'Comb_Jelly.png': require('../../assets/marine_life_thumbs/Comb_Jelly.png'),
  'Cookiecutter_Shark.png': require('../../assets/marine_life_thumbs/Cookiecutter_Shark.png'),
  'Crowned_Seahorse.png': require('../../assets/marine_life_thumbs/Crowned_Seahorse.png'),
  'Eastern_Rock_Lobster.png': require('../../assets/marine_life_thumbs/Eastern_Rock_Lobster.png'),
  'Fangtooth.png': require('../../assets/marine_life_thumbs/Fangtooth.png'),
  'Frilled_Shark.png': require('../../assets/marine_life_thumbs/Frilled_Shark.png'),
  'Giant_Wolf_Eel.png': require('../../assets/marine_life_thumbs/Giant_Wolf_Eel.png'),
  'Goblin_Shark.png': require('../../assets/marine_life_thumbs/Goblin_Shark.png'),
  'Lined_Seahorse.png': require('../../assets/marine_life_thumbs/Lined_Seahorse.png'),
  'Megamouth_Shark.png': require('../../assets/marine_life_thumbs/Megamouth_Shark.png'),
  'Norway_Lobster.png': require('../../assets/marine_life_thumbs/Norway_Lobster.png'),
  'Pacific_Fanfish.png': require('../../assets/marine_life_thumbs/Pacific_Fanfish.png'),
  'Red_Bream.png': require('../../assets/marine_life_thumbs/Red_Bream.png'),
  'Rhinochimaeridae.png': require('../../assets/marine_life_thumbs/Rhinochimaeridae.png'),
  'Salmon_Snailfish.png': require('../../assets/marine_life_thumbs/Salmon_Snailfish.png'),
  'Sea_Toad.png': require('../../assets/marine_life_thumbs/Sea_Toad.png'),
  'Spider_Crab.png': require('../../assets/marine_life_thumbs/Spider_Crab.png'),
  'Spotted_Seahorse.png': require('../../assets/marine_life_thumbs/Spotted_Seahorse.png'),
  'Threetooth_Puffer.png': require('../../assets/marine_life_thumbs/Threetooth_Puffer.png'),
  'White_Seahorse.png': require('../../assets/marine_life_thumbs/White_Seahorse.png'),
  'Barreleye.png': require('../../assets/marine_life_thumbs/Barreleye.png'),
  'Blobfish.png': require('../../assets/marine_life_thumbs/Blobfish.png'),
  'Dumbo_Octopus.png': require('../../assets/marine_life_thumbs/Dumbo_Octopus.png'),
  'Peacock_Squid.png': require('../../assets/marine_life_thumbs/Peacock_Squid.png'),
  'Pelican_Eel.png': require('../../assets/marine_life_thumbs/Pelican_Eel.png'),
  'Vampire_Squid.png': require('../../assets/marine_life_thumbs/Vampire_Squid.png'),
  'Alaska_Pollock.png': require('../../assets/marine_life_thumbs/Alaska_Pollock.png'),
  'Antarctic_Octopus.png': require('../../assets/marine_life_thumbs/Antarctic_Octopus.png'),
  'Arctic_Cod.png': require('../../assets/marine_life_thumbs/Arctic_Cod.png'),
  'Arctic_Telescope_Fish.png': require('../../assets/marine_life_thumbs/Arctic_Telescope_Fish.png'),
  'Capelin.png': require('../../assets/marine_life_thumbs/Capelin.png'),
  'Gelatinous_Snailfish.png': require('../../assets/marine_life_thumbs/Gelatinous_Snailfish.png'),
  'Golden_King_Crab.png': require('../../assets/marine_life_thumbs/Golden_King_Crab.png'),
  'Greenland_Shark.png': require('../../assets/marine_life_thumbs/Greenland_Shark.png'),
  'Haddock.png': require('../../assets/marine_life_thumbs/Haddock.png'),
  'Horsehair_Crab.png': require('../../assets/marine_life_thumbs/Horsehair_Crab.png'),
  'Ice_Fish.png': require('../../assets/marine_life_thumbs/Ice_Fish.png'),
  'Leafy_Seadragon.png': require('../../assets/marine_life_thumbs/Leafy_Seadragon.png'),
  'Lumpfish.png': require('../../assets/marine_life_thumbs/Lumpfish.png'),
  'Narwhal.png': require('../../assets/marine_life_thumbs/Narwhal.png'),
  'Phantom_Jellyfish.png': require('../../assets/marine_life_thumbs/Phantom_Jellyfish.png'),
  'Polar_Eelpout.png': require('../../assets/marine_life_thumbs/Polar_Eelpout.png'),
  'Porbeagle_Shark.png': require('../../assets/marine_life_thumbs/Porbeagle_Shark.png'),
  'Snow_Crab.png': require('../../assets/marine_life_thumbs/Snow_Crab.png'),
  'Snub_nosed_Spiny_Eel.png': require('../../assets/marine_life_thumbs/Snub_nosed_Spiny_Eel.png'),
  'Starry_Skate.png': require('../../assets/marine_life_thumbs/Starry_Skate.png'),
  'Weedy_Seadragon.png': require('../../assets/marine_life_thumbs/Weedy_Seadragon.png'),
  'Allenypterus.png': require('../../assets/marine_life_thumbs/Allenypterus.png'),
  'Anomalocaris.png': require('../../assets/marine_life_thumbs/Anomalocaris.png'),
  'Dollocaris_Ingens.png': require('../../assets/marine_life_thumbs/Dollocaris_Ingens.png'),
  'Drepanaspis.png': require('../../assets/marine_life_thumbs/Drepanaspis.png'),
  'Dunkleosteus.png': require('../../assets/marine_life_thumbs/Dunkleosteus.png'),
  'Falcatus.png': require('../../assets/marine_life_thumbs/Falcatus.png'),
  'Helicoprion.png': require('../../assets/marine_life_thumbs/Helicoprion.png'),
  'Kronosaurus.png': require('../../assets/marine_life_thumbs/Kronosaurus.png'),
  'Megalograptus.png': require('../../assets/marine_life_thumbs/Megalograptus.png'),
  'Pikaia.png': require('../../assets/marine_life_thumbs/Pikaia.png'),
  'Qingmendous.png': require('../../assets/marine_life_thumbs/Qingmendous.png'),
  'Ruby_Seadragon.png': require('../../assets/marine_life_thumbs/Ruby_Seadragon.png'),
  'Tokummia_Katalepsis.png': require('../../assets/marine_life_thumbs/Tokummia_Katalepsis.png'),
  'Waptia_Fieldensis.png': require('../../assets/marine_life_thumbs/Waptia_Fieldensis.png'),
  'Xenacanthus.png': require('../../assets/marine_life_thumbs/Xenacanthus.png'),
  'Yawie.png': require('../../assets/marine_life_thumbs/Yawie.png'),
  'Aurora_Jellyfish.png': require('../../assets/marine_life_thumbs/Aurora_Jellyfish.png'),
  'Barbed_Eel.png': require('../../assets/marine_life_thumbs/Barbed_Eel.png'),
  'Bloodskin_Shark.png': require('../../assets/marine_life_thumbs/Bloodskin_Shark.png'),
  'Bony_Wreckfish.png': require('../../assets/marine_life_thumbs/Bony_Wreckfish.png'),
  'Bursting_Anglerfish.png': require('../../assets/marine_life_thumbs/Bursting_Anglerfish.png'),
  'Cerebral_Crab.png': require('../../assets/marine_life_thumbs/Cerebral_Crab.png'),
  'Concertina_Barracuda.png': require('../../assets/marine_life_thumbs/Concertina_Barracuda.png'),
  'Cortex_Decorator.png': require('../../assets/marine_life_thumbs/Cortex_Decorator.png'),
  'Entangled_Crab.png': require('../../assets/marine_life_thumbs/Entangled_Crab.png'),
  'Enthralled_Stonefish.png': require('../../assets/marine_life_thumbs/Enthralled_Stonefish.png'),
  'Fanged_Cod.png': require('../../assets/marine_life_thumbs/Fanged_Cod.png'),
  'Gazing_Shark.png': require('../../assets/marine_life_thumbs/Gazing_Shark.png'),
  'Gelatinous_Stonefish.png': require('../../assets/marine_life_thumbs/Gelatinous_Stonefish.png'),
  'Gnashing_Perch.png': require('../../assets/marine_life_thumbs/Gnashing_Perch.png'),
  'Grotesque_Mackerel.png': require('../../assets/marine_life_thumbs/Grotesque_Mackerel.png'),
  'Host_Eel.png': require('../../assets/marine_life_thumbs/Host_Eel.png'),
  'Imperious_Lobster.png': require('../../assets/marine_life_thumbs/Imperious_Lobster.png'),
  'Malignant_Pincer.png': require('../../assets/marine_life_thumbs/Malignant_Pincer.png'),
  'Many_Eyed_Mackerel.png': require('../../assets/marine_life_thumbs/Many_Eyed_Mackerel.png'),
  'Parhelion_Jellyfish.png': require('../../assets/marine_life_thumbs/Parhelion_Jellyfish.png'),
  'Perished_Loosejaw.png': require('../../assets/marine_life_thumbs/Perished_Loosejaw.png'),
  'Radiant_Squid.png': require('../../assets/marine_life_thumbs/Radiant_Squid.png'),
  'Sallow_Sailfish.png': require('../../assets/marine_life_thumbs/Sallow_Sailfish.png'),
  'Savage_Barracuda.png': require('../../assets/marine_life_thumbs/Savage_Barracuda.png'),
  'Scouring_Bass.png': require('../../assets/marine_life_thumbs/Scouring_Bass.png'),
  'Seizing_Snailfish.png': require('../../assets/marine_life_thumbs/Seizing_Snailfish.png'),
  'Shattered_Wreckfish.png': require('../../assets/marine_life_thumbs/Shattered_Wreckfish.png'),
  'Splintered_Crab.png': require('../../assets/marine_life_thumbs/Splintered_Crab.png'),
  'Sprouting_Eel.png': require('../../assets/marine_life_thumbs/Sprouting_Eel.png'),
  'Three_Headed_Cod.png': require('../../assets/marine_life_thumbs/Three_Headed_Cod.png'),
  'Translucent_Sturgeon.png': require('../../assets/marine_life_thumbs/Translucent_Sturgeon.png'),
  'Tusked_Grouper.png': require('../../assets/marine_life_thumbs/Tusked_Grouper.png'),
  'Voltaic_Grouper.png': require('../../assets/marine_life_thumbs/Voltaic_Grouper.png'),
  'Withered_Ray.png': require('../../assets/marine_life_thumbs/Withered_Ray.png'),
};


const MarineLifeScreen = ({ marineLifeList, setMarineLifeList }) => {
  const [filteredMarineLife, setFilteredMarineLife] = useState(marineLifeList);
  const [selectedFish, setSelectedFish] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, caught, uncaught, breeding

  // Load marine life data when component mounts
  useEffect(() => {
    loadMarineLifeData();
  }, []);

  // Update filtered list when marineLifeList or filters change
  useEffect(() => {
    applyFilters();
  }, [marineLifeList, searchText, filterType]);

  // Update selectedFish when marineLifeList changes (modal bug fix)
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
        // Merge user data with base marine life data
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

  const applyFilters = () => {
    let filtered = marineLifeList;

    // Apply search filter
    if (searchText) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.zone.toLowerCase().includes(searchText.toLowerCase())
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

    setFilteredMarineLife(filtered);
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
        {/* 🖼️ CHANGE: Show local thumbnails in grid for ALL marine life */}
        {item.image_filename && marineLifeThumbnails[item.image_filename] ? (
          <Image
            source={marineLifeThumbnails[item.image_filename]} // FIX APPLIED HERE
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
        {/* Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{selectedFish.name}</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={closeFishCard}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        {/* 🖼️ CHANGE: Show placeholder in modal for ALL marine life until better images found */}
        <View style={styles.modalImageContainer}>
          <View style={styles.modalPlaceholderImage}>
            <Text style={styles.modalPlaceholderText}>🐟</Text>
            <Text style={styles.comingSoonText}>Image Coming Soon</Text>
          </View>
        </View>

        {/* Fish Details */}
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

          {/* Recipes */}
          {selectedFish.recipes && selectedFish.recipes.length > 0 && (
            <View style={styles.recipesContainer}>
              <Text style={styles.recipesTitle}>Used in Recipes:</Text>
              {selectedFish.recipes.map((recipe, index) => (
                <Text key={index} style={styles.recipeItem}>• {recipe}</Text>
              ))}
            </View>
          )}

          {/* Toggle Switches */}
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
      {/* Header with Statistics */}
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

      {/* Search and Filter Controls */}
      <View style={styles.controlsContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search marine life..."
          value={searchText}
          onChangeText={setSearchText}
        />

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
      </View>

      {/* Marine Life Grid */}
      <FlatList
        data={filteredMarineLife}
        renderItem={renderMarineLifeItem}
        keyExtractor={item => item.name}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Fish Detail Modal */}
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
  filterContainer: {
    flexDirection: 'row',
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
  // 🖼️ UPDATED: Grid image styling with proper sizing for ALL thumbnails
  fishImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f8f8f8', // Light background for padding
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
  // Modal Styles
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
  // 🖼️ UPDATED: Modal placeholder styling for ALL marine life
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
