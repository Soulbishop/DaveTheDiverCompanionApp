#!/bin/bash

# This script gathers non-image files from the project,
# places them into a temporary structure, and then zips them up.
# This is useful for auditing code and data without large image assets.

# Define the name of the output zip file
OUTPUT_ZIP_FILE="source_files_audit.zip"
# Define a temporary directory to store the files before zipping
TEMP_DIR="_audit_temp_files"

echo "Starting to gather files for audit..."
echo "Excluding common image formats and packaging into '${OUTPUT_ZIP_FILE}'."
echo "---------------------------------------------------------"

# Clean up any previous temporary directory or zip file
# This ensures a fresh start each time you run the script.
rm -rf "${TEMP_DIR}" "${OUTPUT_ZIP_FILE}" 2>/dev/null

# Create the temporary directory where we'll copy the files
mkdir "${TEMP_DIR}"

# Find all files but exclude directories and common image extensions.
# The 'find' command is powerful for traversing directories.
#   '.'             : Start searching from the current directory.
#   '-type f'       : Only consider files (not directories).
#   '-not -path "*/.git/*"' : Exclude anything inside the .git directory.
#   '-not -name "*.png"' : Exclude files ending with .png.
#   '-not -name "*.jpg"' : Exclude files ending with .jpg.
#   '-not -name "*.jpeg"' : Exclude files ending with .jpeg.
#   '-not -name "*.gif"' : Exclude files ending with .gif.
#   '-print0'       : Print filenames separated by a null character,
#                     which is safer for filenames with spaces or special characters.
# The 'xargs -0' reads these null-separated filenames.
# The 'cp -t "${TEMP_DIR}" --parents' copies them to the temp directory
# while preserving their original folder structure relative to the project root.
# This ensures that even though they are dumped into one zip, their original
# path info is maintained within the temporary directory.
find . -type f \
    -not -path "*/.git/*" \
    -not -name "*.png" \
    -not -name "*.jpg" \
    -not -name "*.jpeg" \
    -not -name "*.gif" \
    -not -name "*.zip" \
    -not -name "*.pdf" \
    -not -name "*.xlsx" \
    -print0 | xargs -0 cp -t "${TEMP_DIR}" --parents

# Now, create the zip file from the contents of the temporary directory.
# 'zip -r' creates a recursive zip archive.
# '-j' is important here: it "junk" the directory names, meaning it stores
# only the name of the file and not its path (flattening the structure).
# If you wanted to keep the folder structure *inside* the zip, you'd remove '-j'.
# But since you asked to "just dump all the files into 1 zip", -j is key.
# We then navigate into the temp directory to zip its contents directly.
(cd "${TEMP_DIR}" && zip -r -j "../../${OUTPUT_ZIP_FILE}" .)

# Clean up the temporary directory after zipping
rm -rf "${TEMP_DIR}"

echo "---------------------------------------------------------"
echo "Audit files successfully gathered and zipped into '${OUTPUT_ZIP_FILE}'."
echo "You can now download this file from your Code Space."