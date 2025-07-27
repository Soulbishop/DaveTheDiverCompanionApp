// FILE: convertPathsToLocal.js
// FINAL, ROBUST VERSION

const fs = require('fs');
const path = require('path');

console.log("--- Starting Asset Path Conversion Script (v3) ---");

// --- Function to process the Marine Life data file ---
function processMarineLifeFile() {
    const sourcePath = path.join(__dirname, 'src', 'data', 'allMarineLife.js');
    const outputPath = path.join(__dirname, 'allMarineLife_LOCAL.js');

    try {
        console.log(`\nProcessing Marine Life file: ${sourcePath}`);
        let fileContent = fs.readFileSync(sourcePath, 'utf8');
        
        // This regex finds the line with "image_filename" to extract the filename
        const filenameRegex = /"image_filename":\s*"([^"]+)"/g;
        
        // We will build the new file content line by line
        let newFileContent = "";
        const lines = fileContent.split('\n');
        
        for (const line of lines) {
            let newLine = line;

            // Is this a local_thumbnail line?
            if (line.trim().startsWith('"local_thumbnail"')) {
                const match = /"image_filename":\s*"([^"]+)"/.exec(fileContent);
                // Find the corresponding image_filename from the whole file content (a bit inefficient but safe)
                // This is a simplification; a better approach would be to process object by object.
                // Let's try a simpler replacement first.
                // This replaces the path inside require()
                newLine = line.replace(/require\((['"`]).*?assets/g, "require($1../assets");
            }
            
            // Is this the end of an object, where we should add the new property?
            if (line.trim() === "},") {
                // This is complex. Let's try a different approach.
            }
            newFileContent += newLine + '\n';
        }

        // Let's try a simpler, global replace strategy which is less error prone.
        let updatedContent = fileContent;

        // 1. Fix all local_thumbnail paths
        updatedContent = updatedContent.replace(
            /("local_thumbnail":\s*require\()(['"`])(.*?)(['"`])\)/g,
            (match, prefix, quote1, oldPath, quote2) => {
                const filename = path.basename(oldPath);
                return `${prefix}${quote1}../assets/marine_life_thumbs/${filename}${quote2})`;
            }
        );

        // 2. Add the detailed_marine_life_art property
        updatedContent = updatedContent.replace(
            /("local_thumbnail":\s*require\([^)]+\),?)/g,
            (match, thumbnailLine) => {
                const filenameMatch = /marine_life_thumbs\/([^"']+)\.png/.exec(thumbnailLine);
                if (filenameMatch && filenameMatch[1]) {
                    const filename = filenameMatch[1];
                    const detailedArtLine = `\n    "detailed_marine_life_art": require('../assets/detailed_marine_life_art/PU_${filename}.png'),`;
                    // Ensure the original line has a comma
                    const newThumbnailLine = thumbnailLine.endsWith(',') ? thumbnailLine : thumbnailLine + ',';
                    return newThumbnailLine + detailedArtLine;
                }
                return match; // Return original if no match
            }
        );

        fs.writeFileSync(outputPath, updatedContent, 'utf8');
        console.log(`  - Successfully generated new file at: ${outputPath}`);

    } catch (error) {
        console.error(`\n--- ERROR processing Marine Life data ---`);
        console.error(error);
    }
}

// --- Function to process the Recipes data file ---
function processRecipesFile() {
    const sourcePath = path.join(__dirname, 'src', 'data', 'allRecipes.js');
    const outputPath = path.join(__dirname, 'allRecipes_LOCAL.js');

    try {
        console.log(`\nProcessing Recipes file: ${sourcePath}`);
        let fileContent = fs.readFileSync(sourcePath, 'utf8');
        
        // Correct the paths for recipe images
        const updatedContent = fileContent.replace(
            /require\(".\/assets\/recipe_images\//g,
            'require("../assets/recipe_images/'
        );

        fs.writeFileSync(outputPath, updatedContent, 'utf8');
        console.log(`  - Corrected paths in recipe file.`);
        console.log(`  - New file generated at: ${outputPath}`);

    } catch (error) {
        console.error(`\n--- ERROR processing Recipes data ---`);
        console.error(error);
    }
}


// --- Run the processing for both files ---
processMarineLifeFile();
processRecipesFile();

console.log("\n--- Script Finished ---");
