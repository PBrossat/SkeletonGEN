// eslint-disable-next-line no-unused-vars
const vscode = require("vscode");
const {
  isCommentLine,
  updateFlagIsBlockComment,
} = require("./utils/commentUtil");
const { containsTildeFollowedByClassName } = require("./utils/destructorUtil");
const { browseFileToGetImplementation } = require("./utils/browserFile");

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
    if (isCommentLine(lineText) || isBlockComment) {
      continue;
    }

    // If the file contain ~[className]() (and so [className]::~[className]() works too)
    if (containsTildeFollowedByClassName(lineText, className)) {
      return true;
    }
  }
  return false;
}

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
  let destructorSkeleton = "";

  const destructorRegex = new RegExp(
    `(${className}::~${className}\\s*\\(\\s*\\))`
  );

  const haveDestructorInHeader = haveDestructor(fileHeader, className);

  const arrayOfDestructor = browseFileToGetImplementation(
    fileDefinition,
    className,
    destructorRegex
  );

  // Check if the destructor is already implemented in the .cpp file (if the array is not empty)
  const isDestructorAlreadyImplemented = arrayOfDestructor.length !== 0;

  // If the destructor exist in .h and already implemented in .cpp, we keep the implementation and append it to the skeleton
  if (haveDestructorInHeader && isDestructorAlreadyImplemented) {
    for (let i = 0; i < arrayOfDestructor.length; i++) {
      destructorSkeleton += `${arrayOfDestructor[i]}\n`;
    }
    destructorSkeleton += `\n`;
  }
  // If the destructor exist in .h and not implemented in .cpp, we create the skeleton
  else if (haveDestructorInHeader && !isDestructorAlreadyImplemented) {
    destructorSkeleton = `${className}::~${className}()\n`;
    destructorSkeleton += `{\n\t// TODO : implement the destructor\n}\n\n`;
  }

  return destructorSkeleton;
}

module.exports = {
  createDestructor,
};
