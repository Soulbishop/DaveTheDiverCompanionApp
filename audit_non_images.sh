#!/bin/bash

# This script gathers non-image files from the project,
# places them into a temporary structure, and then zips them up.
# This version keeps the original folder structure INSIDE the zip file
# to prevent "duplicate name" errors and provide a clearer audit.

# Define the name of the output zip file
OUTPUT_ZIP_FILE="source_files_audit.zip"
# Define a temporary directory to store the files before zipping
TEMP_DIR="_audit_temp_files"

echo "Starting to gather files for audit..."
echo "Excluding common image formats and packaging into '${OUTPUT_ZIP_FILE}' (preserving folder structure inside zip)."
echo "---------------------------------------------------------"

# Clean up any previous temporary directory or zip file
rm -rf "${TEMP_DIR}" "${OUTPUT_ZIP_FILE}" 2>/dev/null

# Create the temporary directory where we'll copy the files
mkdir "${TEMP_DIR}"

# Find all files but exclude directories and common image extensions.
# Copy them to the temp directory while preserving their original folder structure.
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
# We remove the '-j' flag to PRESERVE the directory names inside the zip file.
# We zip the contents of TEMP_DIR, ensuring the output zip is in the parent directory.
(cd "${TEMP_DIR}" && zip -r "../${OUTPUT_ZIP_FILE}" .)

# Clean up the temporary directory after zipping
rm -rf "${TEMP_DIR}"

echo "---------------------------------------------------------"
echo "Audit files successfully gathered and zipped into '${OUTPUT_ZIP_FILE}'."
echo "You can now download this file from your Code Space."