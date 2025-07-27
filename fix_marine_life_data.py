# fix_marine_life_data.py

import os

def fix_marine_life_data(file_path):
    """
    Fixes common issues in the allMarineLife.js data file:
    1. Corrects specific image require paths (underscore to hyphen).
    2. Removes redundant 'detailed_marine_life_art' URL entries.
    """
    try:
        with open(file_path, 'r') as f:
            lines = f.readlines()

        new_lines = []
        filename_mismatches_fixed = 0
        redundant_urls_removed = 0

        # Define specific filename corrections (old_name: new_name)
        # These are based on the errors observed and the file tree provided.
        filename_corrections = {
            "PU_Big_Belly_Seahorse.png": "PU_Big-Belly_Seahorse.png",
            "PU_Long_Snouted_Seahorse.png": "PU_Long-Snouted_Seahorse.png",
            "PU_Red_banded_Lobster.png": "PU_Red-banded_Lobster.png",
            "PU_Tiger_Tail_Seahorse.png": "PU_Tiger-Tail_Seahorse.png",
            "PU_Snub_nosed_Spiny_Eel.png": "PU_Snub-nosed_Spiny_Eel.png",
            # Add any other specific filename corrections here if you encounter more
        }

        # Iterate through each line to apply fixes
        i = 0
        while i < len(lines):
            line = lines[i]

            # --- Fix 1: Filename Mismatches ---
            # Check for and apply specific filename corrections in require statements
            for old_name, new_name in filename_corrections.items():
                if f"require('../assets/detailed_marine_life_art/{old_name}')" in line:
                    line = line.replace(old_name, new_name)
                    filename_mismatches_fixed += 1
                    print(f"Fixed filename: {old_name} -> {new_name}")
                    break # Only one correction per line for efficiency

            # --- Fix 2: Redundant URL Entries ---
            # Check if the current line is a redundant URL entry
            # It will always follow a 'require' statement for the same key.
            # We look for lines containing '"detailed_marine_life_art": "https://github.com/'
            if '"detailed_marine_life_art": "https://github.com/' in line:
                # This is a redundant URL line, so we skip adding it to new_lines
                redundant_urls_removed += 1
                # print(f"Removed redundant URL: {line.strip()}") # Uncomment for detailed logging
            else:
                new_lines.append(line) # Keep the line if it's not a redundant URL

            i += 1

        # Write the modified content back to the file
        with open(file_path, 'w') as f:
            f.writelines(new_lines)

        print("\n--- Fix Summary ---")
        print(f"Successfully processed: {file_path}")
        print(f"Filename mismatches corrected: {filename_mismatches_fixed}")
        print(f"Redundant URL entries removed: {redundant_urls_removed}")
        print("Please rebuild your app.")

    except FileNotFoundError:
        print(f"Error: File not found at {file_path}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    # Define the path to your allMarineLife.js file
    # Adjust this path if your script is not in the root directory of your project
    # Assuming the script is in the root and the data file is in src/data/
    marine_life_data_path = 'src/data/allMarineLife.js'
    fix_marine_life_data(marine_life_data_path)

