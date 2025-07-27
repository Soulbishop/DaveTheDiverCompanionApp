// FILE: updateMarineLifeData.js
// CREATE THIS NEW FILE IN YOUR PROJECT ROOT

const fs = require('fs');
const path = require('path');

// --- List of all actual filenames provided from the directory ---
const imageFilenames = [
  "PU_Alaska_Pollock.png", "PU_American_Lobster.png", "PU_Arctic_Telescope_Fish.png",
  "PU_Atlantic_Anglerfish.png", "PU_Atlantic_Bonito.png", "PU_Atlantic_Mackerel.png",
  "PU_Aurora_Jellyfish.png", "PU_Barbed_Eel.png", "PU_Barrel_Jellyfish.png",
  "PU_Barreleye.png", "PU_Big-Belly_Seahorse.png", "PU_Bigeye_Scad.png",
  "PU_Bigeye_Trevally.png", "PU_Black_Tiger_Shrimp.png", "PU_Black_and_White_Snapper.png",
  "PU_Blackfin_Barracuda.png", "PU_Blacktip_Reefshark.png", "PU_Blobfish.png",
  "PU_Blood-belly_Comb_Jellyfish.png", "PU_Bloodskin_Shark.png", "PU_Blue_Lobster.png",
  "PU_Blue_Tang.png", "PU_Bluefin_Tuna.png", "PU_Bluehead_Tilefish.png",
  "PU_Bluespotted_Stargazer.png", "PU_Bony_Wreckfish.png", "PU_Box_Jellyfish.png",
  "PU_Bursting_Anglerfish.png", "PU_California_Spiny_Lobster.png", "PU_Cardinal_Fish.png",
  "PU_Cerebral_Crab.png", "PU_Chambered_Nautilus.png", "PU_Clearfin_Lionfish.png",
  "PU_Clione.png", "PU_Clione_Queen.png", "PU_Clown_Frogfish.png", "PU_Clownfish.png",
  "PU_Comb_Jelly.png", "PU_Comber.png", "PU_Concertina_Barracuda.png",
  "PU_Cookiecutter_Shark.png", "PU_Copper_Shark.png", "PU_Coral_Trout.png",
  "PU_Cortex_Decorator.png", "PU_Crowned_Seahorse.png", "PU_Crystal_Lobster.png",
  "PU_Cuttlefish.png", "PU_Devil_Scorpionfish.png", "PU_Dollocaris_Ingens.png",
  "PU_Dumbo_Octopus.png", "PU_Dunkleosteus.png", "PU_Dusky_Grouper.png",
  "PU_Dwarf_Seahorse.png", "PU_Eastern_Rock_Lobster.png", "PU_Emperor_Angelfish.png",
  "PU_Entangled_Crab.png", "PU_Enthralled_Stonefish.png", "PU_Fan_Lobster.png",
  "PU_Fanged_Cod.png", "PU_Fangtooth.png", "PU_Flame_Angelfish.png",
  "PU_Fried_Egg_Jellyfish.png", "PU_Frilled_Shark.png", "PU_Gazing_Shark.png",
  "PU_Gelatinous_Stonefish.png", "PU_Giant_Squid.png", "PU_Giant_Trevally.png",
  "PU_Giant_Wolf_Eel.png", "PU_Giraffe_Seahorse.png", "PU_Gnashing_Perch.png",
  "PU_Goblin_Shark.png", "PU_Great_Barracuda.png", "PU_Great_White_Shark_Klaus.png",
  "PU_Green_Humphead_Parrotfish.png", "PU_Green_Sea_Urchin.png", "PU_Grey_Triggerfish.png",
  "PU_Grotesque_Mackerel.png", "PU_Harlequin_Hind.png", "PU_Hedgehog_Seahorse.png",
  "PU_Host_Eel.png", "PU_Humboldt_Squid.png", "PU_Imperious_Lobster.png",
  "PU_Jayakar's_Seahorse.png", "PU_Kronosaurus.png", "PU_Lagoon_Triggerfish.png",
  "PU_Lined_Seahorse.png", "PU_Long-Snouted_Seahorse.png", "PU_Longfin_Batfish.png",
  "PU_Longnose_Sawshark.png", "PU_Longspine_Porcupinefish.png", "PU_Longspine_Squirrelfish.png",
  "PU_Lumpfish.png", "PU_Lusca.png", "PU_Mackerel_Scad.png", "PU_Malignant_Pincer.png",
  "PU_Many_Eyed_Mackerel.png", "PU_Marbled_Electric_Ray.png", "PU_Marlin.png",
  "PU_Mediterranean_Parrotfish.png", "PU_Megalograptus.png", "PU_Megamouth_Shark.png",
  "PU_Moray_Eel.png", "PU_Narrow-Barred_Spanish_Mackerel.png", "PU_Norway_Lobster.png",
  "PU_Orbicular_Batfish.png", "PU_Ornate_Wrasse.png", "PU_Pacific_Fanfish.png",
  "PU_Pacific_Seahorse.png", "PU_Painted_Comber.png", "PU_Parhelion_Jellyfish.png",
  "PU_Peacock_Squid.png", "PU_Pelican_Eel.png", "PU_Perished_Loosejaw.png",
  "PU_Pikaia.png", "PU_Purple_Sea_Urchin.png", "PU_Pyramid_Butterflyfish.png",
  "PU_Radiant_Squid.png", "PU_Rainbow_Wrasse.png", "PU_Red-banded_Lobster.png",
  "PU_Red_Bream.png", "PU_Red_Lionfish.png", "PU_Redtoothed_Triggerfish.png",
  "PU_Rhinochimaeridae.png", "PU_Sailfish.png", "PU_Sallow_Sailfish.png",
  "PU_Sally_Lightfoot_Crab.png", "PU_Salmon_Snailfish.png", "PU_Savage_Barracuda.png",
  "PU_Scouring_Bass.png", "PU_Sea_Goldie.png", "PU_Sea_Toad.png",
  "PU_Seizing_Snailfish.png", "PU_Shattered_Wreckfish.png", "PU_Sheepshead.png",
  "PU_Shortfin_Mako.png", "PU_Small_Spotted_Dart.png", "PU_Smooth_Hammerhead.png",
  "PU_Snub-nosed_Spiny_Eel.png", "PU_Spear_Squid.png", "PU_Spider_Crab.png",
  "PU_Spiny_Seahorse.png", "PU_Splintered_Crab.png", "PU_Spotted_Seahorse.png",
  "PU_Sprouting_Eel.png", "PU_Starry_Puffer.png", "PU_Stingray.png",
  "PU_Striped_Catfish.png", "PU_Striped_Red_Mullet.png", "PU_Three-Headed_Cod.png",
  "PU_Threetooth_Puffer.png", "PU_Thresher_Shark.png", "PU_Tiger-Tail_Seahorse.png",
  "PU_Tiger_Shark.png", "PU_Titan_Triggerfish.png", "PU_Tokummia_Katalepsis.png",
  "PU_Translucent_Sturgeon.png", "PU_Tropical_Rock_Lobster.png", "PU_Truck_Hermit_Crab.png",
  "PU_Tusked_Grouper.png", "PU_Vampire_Squid.png", "PU_Voltaic_Grouper.png",
  "PU_Waptia_Fieldensis.png", "PU_White_Seahorse.png", "PU_White_Shrimp.png",
  "PU_White_Spotted_Jellyfish.png", "PU_White_Trevally.png", "PU_Whiteleg_Shrimp.png",
  "PU_Whitetip_Reefshark.png", "PU_Withered_Ray.png", "PU_Yellow_Tang.png",
  "PU_Yellowback_Fusilier.png", "PU_Yellowfin_Tuna.png", "PU_Zebra_Seahorse.png",
  "PU_Zebra_Shark.png"
];

// --- Configuration ---
const GITHUB_BASE_URL = "https://github.com/Soulbishop/DaveTheDiverCompanionApp/blob/Ui-Edits/assets/detailed_marine_life_art/";
const SOURCE_DATA_PATH = path.join(__dirname, 'src', 'data', 'allMarineLife.js' );
const OUTPUT_DATA_PATH = path.join(__dirname, 'allMarineLife_UPDATED.js');

// --- Helper Function ---
// Normalizes fish name to the expected filename format, including the "PU_" prefix.
function getExpectedFilename(fishName) {
  // Special case for "Jayakar's Seahorse" which has an apostrophe
  const sanitizedName = fishName.replace(/'/g, "\\'");
  return `PU_${sanitizedName.replace(/ /g, '_')}.png`;
}

// --- Main Logic ---
try {
  console.log(`Reading data from: ${SOURCE_DATA_PATH}`);
  let fileContent = fs.readFileSync(SOURCE_DATA_PATH, 'utf8');
  
  // Strip the JavaScript export/variable assignment to parse as JSON
  const jsonString = fileContent
    .substring(fileContent.indexOf('['), fileContent.lastIndexOf(']') + 1)
    // This regex handles the `require(...)` statements which are not valid JSON
    .replace(/require\((['"`]).*?\1\)/g, '""'); 

  const allMarineLife = JSON.parse(jsonString);
  console.log(`Successfully parsed ${allMarineLife.length} marine life entries.`);

  let updatedCount = 0;
  let notFound = [];

  const filenameSet = new Set(imageFilenames);

  const updatedMarineLife = allMarineLife.map(fish => {
    // Use the original `image_filename` from your data as the key for matching
    const expectedFilename = `PU_${fish.image_filename}`;
    
    if (filenameSet.has(expectedFilename)) {
      updatedCount++;
      const newFish = { ...fish };
      newFish.detailed_marine_life_art = `${GITHUB_BASE_URL}${expectedFilename}?raw=true`;
      // We must also fix the local_thumbnail path to be a string literal for JSON.stringify
      newFish.local_thumbnail = `require('../assets/marine_life_thumbs/${fish.image_filename}')`;
      return newFish;
    } else {
      notFound.push({ name: fish.name, expectedFile: expectedFilename });
      const originalFish = { ...fish };
      originalFish.local_thumbnail = `require('../assets/marine_life_thumbs/${fish.image_filename}')`;
      return originalFish;
    }
  });

  // --- Reporting ---
  console.log("\n--- SCRIPT COMPLETE ---");
  console.log(`Total fish processed: ${allMarineLife.length}`);
  console.log(`Successfully matched and updated: ${updatedCount}`);
  console.log(`Images not found: ${notFound.length}`);

  if (notFound.length > 0) {
    console.log("\n--- DETAILS ON MISSING IMAGES ---");
    console.log("The following fish could not be matched to a filename you provided:");
    notFound.forEach(item => {
      console.log(`  - Fish Name: "${item.name}" -> Expected File: "${item.expectedFile}"`);
    });
    console.log("\nThis is not an error. These fish will continue to use their original thumbnail image in the detail view.");
  }

  // --- File Output ---
  // Convert the updated array back into a string, then restore the `require` statements
  let outputContent = `const allMarineLife = ${JSON.stringify(updatedMarineLife, null, 2)};\n\nexport default allMarineLife;`;
  outputContent = outputContent.replace(/"require\((['"`]).*?\1\)"/g, (match) => match.substring(1, match.length - 1));

  fs.writeFileSync(OUTPUT_DATA_PATH, outputContent, 'utf8');
  console.log(`\nSuccessfully generated updated file at: ${OUTPUT_DATA_PATH}`);
  console.log("Please review the new file and then use it to replace your existing data file.");

} catch (error) {
  console.error("\n--- AN ERROR OCCURRED ---");
  console.error(error);
  console.error("\nPlease ensure the script is run from the project root and that the path to 'allMarineLife.js' is correct.");
}
