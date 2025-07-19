# Dave the Diver Companion App - Phase 1 Foundation

## What This Is

This is a **clean Phase 1 foundation** - just the app structure and functionality without any fish data. You add your own data with your naming system.

## What's Included

✅ **App Structure** - Complete React Native app with navigation  
✅ **Marine Life Tracking** - Caught/breeding pair functionality  
✅ **Data Persistence** - AsyncStorage for saving progress  
✅ **Samsung Galaxy Optimization** - UI optimized for S22/S25 Ultra  
✅ **Build Pipeline** - GitHub Actions for APK generation  
✅ **Empty Data File** - Ready for your marine life data  

## What's NOT Included

❌ **No fish data** - Empty marineLife.json file  
❌ **No sample entries** - Won't interfere with your naming system  
❌ **No assumptions** - You control all data and naming  

## Quick Setup

```bash
# 1. Clone your repo and copy these files
# 2. Install dependencies
npm install

# 3. Add your marine life data to src/data/marineLife.json
# Format: [{"id": 1, "name": "YourFishName", "zone": "YourZone", ...}]

# 4. Build APK
eas build --platform android --profile preview
```

## Data Schema

Your `src/data/marineLife.json` should follow this structure:

```json
[
  {
    "id": 1,
    "name": "Your Fish Name",
    "zone": "Your Zone Name", 
    "timeOfDay": "day|night|both",
    "captureMethod": "Your Method",
    "caught": false,
    "breedingPair": false,
    "sprite": "your-image-filename.png",
    "rarity": "common|uncommon|rare|legendary"
  }
]
```

## Ready For Your Data

The app shows a "Ready for Your Data!" message when the marine life array is empty. Once you add your fish data, it will display your collection with full tracking functionality.

**This foundation respects your workflow and naming system.**

