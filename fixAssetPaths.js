// FILE: fixAssetPaths.js
// CREATE THIS NEW FILE IN YOUR PROJECT ROOT

const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;
const filesToScan = [];
const allowedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json'];

// --- 1. Find all relevant files in the project ---
function findFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        // Skip node_modules and the root assets folder itself
        if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'assets') {
            findFiles(fullPath);
        } else if (allowedExtensions.includes(path.extname(entry.name))) {
            filesToScan.push(fullPath);
        }
    }
}

console.log("Starting asset path scan...");
findFiles(projectRoot);
console.log(`Found ${filesToScan.length} files to check.`);

// --- 2. Define path patterns and replacements ---
const replacements = [
    // Pattern 1: For root-level files like app.json
    // Matches: "./src/assets/..."
    {
        pattern: /(["'])(\.\/assets\/)/g,
        replacement: "$1./src/assets/",
        description: "Root path './src/assets/'"
    },
    // Pattern 2: For files one level deep (e.g., in /src)
    // Matches: "./src/assets/..."
    {
        pattern: /(["'])(\.\.\/assets\/)/g,
        replacement: "$1./assets/", // From within /src, the path to /src/assets is just ./assets
        description: "Relative path './src/assets/'"
    },
     // Pattern 3: For files two levels deep (e.g., in /src/data)
    // Matches: "./assets/..."
    {
        pattern: /(["'])(\.\.\/\.\.\/assets\/)/g,
        replacement: "$1../assets/", // From within /src/data, the path to /src/assets is ../assets
        description: "Relative path './assets/'"
    }
];

let modifiedFiles = [];

// --- 3. Process each file ---
for (const filePath of filesToScan) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;

        // Apply all replacement patterns
        for (const rule of replacements) {
            content = content.replace(rule.pattern, rule.replacement);
        }

        // If content has changed, write it back and log the change
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            modifiedFiles.push(path.relative(projectRoot, filePath));
        }
    } catch (error) {
        console.error(`Could not process file: ${filePath}`, error);
    }
}

// --- 4. Final Report ---
if (modifiedFiles.length > 0) {
    console.log("\n--- SCRIPT COMPLETE ---");
    console.log(`Successfully updated paths in ${modifiedFiles.length} file(s):`);
    modifiedFiles.forEach(file => console.log(`  - ${file}`));
    console.log("\nIt is recommended to review these changes with 'git diff' before committing.");
} else {
    console.log("\n--- SCRIPT COMPLETE ---");
    console.log("No files needed modification. Your asset paths appear to be correct already.");
}
