#!/bin/bash

# A philosophical inquiry into the structure of our digital realm,
# now with the wisdom of permanence.
# This script unveils the directory tree of the current Git branch
# and diligently records it into a file, allowing for deeper contemplation
# and shared understanding.

OUTPUT_FILE="project_structure.txt"

echo "Initiating the structural survey of the current Git branch..."
echo "Output will be saved to: ${OUTPUT_FILE}"
echo "---------------------------------------------------------"

# The core of our oracle remains the same: 'git ls-tree' to extract
# the essence of our committed files and directories.
# The 'tree --fromfile /dev/stdin' transmutes this raw essence
# into a hierarchical, visually intuitive form.
# The crucial addition is the redirection operator '>'. This simple symbol
# is profound, for it directs the stream of knowledge, normally bound for the
# terminal's transient display, into the enduring vessel of our chosen file.
git ls-tree -r --name-only HEAD | tree --fromfile /dev/stdin > "${OUTPUT_FILE}"

# We also want to provide immediate feedback to the terminal,
# confirming the successful completion and the location of our new artifact.
echo "---------------------------------------------------------"
echo "The structural survey is complete. The insights have been recorded in '${OUTPUT_FILE}'."
echo "You can now view this file in your Code Space explorer."