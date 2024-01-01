// eslint-disable-next-line no-unused-vars
const vscode = require("vscode");
const { isCommentLine, updateFlagIsBlockComment } = require("./utils/commentUtil");
const { containsTildeFollowedByClassName } = require("./utils/destructorUtil");

/**
 * Create the destructor of the class if it exist in the header file and doesn't already implement in the definition file
 * or if it's already implement in the definition file, extract the existing destructor block from the .cpp file and don't generate a new one
 *
 * @param {vscode.TextDocument} fileHeader - The TextDocument representing the header file (.h).
 * @param {vscode.TextDocument} fileDefinition - The TextDocument representing the definition file (.cpp).
 * @param {string} className - The name of the main class.
 * @returns {string} - The generated destructor.
 */
function createDestructor(fileHeader, fileDefinition, className) {
  let destructor = "";

  // If the destructor exist in the header file and doesn't already implement in the definition file
  if (
    haveDestructor(fileHeader, className) &&
    !haveDestructor(fileDefinition, className)
  ) {
    destructor += `${className}::~${className}()\n{\n\t// TODO : implement the destructor\n}\n\n`;
  }
  // If the destructor is already implement in the definition file
  else if (haveDestructor(fileDefinition, className)) {
    // Extract the existing destructor block from the .cpp file
    const destructorRegex = new RegExp(
      `(${className}::~${className}\\s*\\([^\\)]*\\)\\s*{[^}]*})`
    );

    const destructorMatch = fileDefinition.getText().match(destructorRegex);

    // If the destructor block is found, append it to the generated destructor
    if (destructorMatch) {
      destructor += `${destructorMatch[1]}\n\n`;
    }
  }

  return destructor;
}

/**
 * @description Check if the destructor exist in the file (.h or .cpp depending on the typeFile)
 *
 * @param {vscode.TextDocument} file
 * @returns {boolean}
 */
function haveDestructor(file, className) {
  // Get the number of lines in the file
  const lineCount = file.lineCount;

  let isBlockComment = false;

  // Browse the file line by line
  for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
    const lineText = file.lineAt(lineIndex).text;

    // Update the flag isBlockComment if the line contains /* or */
    isBlockComment = updateFlagIsBlockComment(lineText, isBlockComment);

    // Ignore comments line (c++ or c style) or comment block
    if(isCommentLine(lineText) || isBlockComment){
      continue;
    }

    // If the file contain ~[className]() (and so [className]::~[className]() works too)
    if (containsTildeFollowedByClassName(lineText, className)) {
      return true;
    }
  }
  return false;
}

module.exports = {
  createDestructor,
};
