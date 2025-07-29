#!/bin/bash

# Script Name: self_nuke_cleanup.sh
# This script performs a cleanup of non-essential files and folders,
# updates the .gitignore, and then deletes itself.

echo "Initiating self-destruct sequence for repository cleanup..."
echo "---------------------------------------------------------"

# 1. Define files and folders to be removed or ensured in .gitignore
#    We are making a best effort to add them to .gitignore first,
#    then removing them from the filesystem.

# List of files/folders to add to .gitignore (if not already there)
# Note: node_modules/ is typically already in .gitignore for Node.js projects.
# We're just ensuring these temporary/dev artifacts are also covered.
GITIGNORE_ENTRIES=(
    "node_modules/"
    "source_files_audit.zip"
    "_audit_temp_files/"
    "audit_structure.sh"
    "audit_non_images.sh"
    "project_structure.txt"
    "fix_marine_life_data.py"
    "allMarineLife_LOCAL.js"
    "allMarineLife_UPDATED.js"
    "allRecipes_LOCAL.js"
    "allMarineLife.js.bak"
    "convertPathsToLocal.js"
    "fixAssetPaths.js"
    "updateMarineLifeData.js"
    "dave_diver_fish_complete.csv"
    "test.txt"
    "src/assets/README.md"
)

# 2. Add entries to .gitignore if they don't already exist
echo "Updating .gitignore file..."
for entry in "${GITIGNORE_ENTRIES[@]}"; do
    # Check if the entry already exists in .gitignore
    if ! grep -qxF "$entry" .gitignore; then
        echo "$entry" >> .gitignore
        echo "  Added '$entry' to .gitignore."
    else
        echo "  '$entry' already exists in .gitignore."
    fi
done
echo "Finished updating .gitignore."
echo ""

# 3. Define the actual files and folders to delete from the filesystem
#    This list should mirror the .gitignore entries for removal.
FILES_TO_DELETE=(
    "source_files_audit.zip"
    "project_structure.txt"
    "fix_marine_life_data.py"
    "allMarineLife_LOCAL.js"
    "allMarineLife_UPDATED.js"
    "allRecipes_LOCAL.js"
    "allMarineLife.js.bak"
    "convertPathsToLocal.js"
    "fixAssetPaths.js"
    "updateMarineLifeData.js"
    "dave_diver_fish_complete.csv"
    "test.txt"
    "src/assets/README.md" # Remember this one is optional, remove from script if keeping
)

FOLDERS_TO_DELETE=(
    "node_modules"
    "_audit_temp_files"
)

# 4. Perform the deletions
echo "Deleting specified files and folders..."

# Delete files
for file in "${FILES_TO_DELETE[@]}"; do
    if [ -f "$file" ]; then # Check if it's a file and exists
        rm "$file"
        echo "  Deleted file: $file"
    else
        echo "  File not found (or already deleted): $file"
    fi
done

# Delete folders
for folder in "${FOLDERS_TO_DELETE[@]}"; do
    if [ -d "$folder" ]; then # Check if it's a directory and exists
        rm -rf "$folder"
        echo "  Deleted folder: $folder"
    else
        echo "  Folder not found (or already deleted): $folder"
    fi
done

# 5. Handle the self-deletion of this script
SCRIPT_NAME="self_nuke_cleanup.sh" # Or whatever you name this script

echo ""
echo "Committing cleanup changes to Git..."
# Add all changes, including deletions and .gitignore updates
git add .
# Commit the changes
git commit -m "Automated: Cleaned repository of temporary and dev files."

echo "Pushing cleanup changes to remote repository..."
# Push to the remote. This might require --force if Git LFS was just set up and history was migrated.
# For typical cleanup, a regular push should work if there are no large file history issues.
git push origin Audit # Assuming 'Audit' is your current branch

echo ""
echo "Initiating self-deletion of the cleanup script..."
# Use 'basename $0' to get the current script's filename
# This ensures it deletes itself even if renamed.
# We run it in a subshell or background process to allow the current script to finish execution
(rm -- "$0") & disown

echo "---------------------------------------------------------"
echo "Cleanup and self-deletion complete. Your repository should now be leaner."

exit 0