
// eslint-disable-next-line no-unused-vars
const vscode = require("vscode");
const {
  isCommentLine,
  updateFlagIsBlockComment,
} = require("./utils/commentUtil");
const { containsTildeFollowedByClassName } = require("./utils/destructorUtil");
const {
  containsClassNameFollowedByParenthesis,
} = require("./utils/constructorUtil");
const { browseFileToGetImplementation } = require("./utils/browserFile");


/**
 * Check if the default constructor exist in the file .h
 * Also check that the constructor is not in a comment or in a block comment in the file
 *
 * @param {vscode.TextDocument} file - The TextDocument representing the header file (.h).
 * @returns {boolean} - True if the default constructor is found, false otherwise.
 */
function haveDefaultConstructor(file, className) {
  // Get the number of lines in the file
  const lineCount = file.lineCount;

  let isBlockComment = false;

  // Browse the file line by line
  for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
    const lineText = file.lineAt(lineIndex).text;

    // Update the flag isBlockComment if the line contains /* or */
    isBlockComment = updateFlagIsBlockComment(lineText, isBlockComment);

    // Ignore comments line (c++ or c style), comment block or destructor
    if (
      isCommentLine(lineText) ||
      containsTildeFollowedByClassName(lineText, className) ||
      isBlockComment
    ) {
      continue;
    }

    // If the file contain [className][spaces]()
    if (containsClassNameFollowedByParenthesis(lineText, className)) {
      return true;
    }
  }

  // If the constructor is not found in both files
  return false;
}

/**
 * Create the default constructor of the class if it exist in the header file and doesn't already implement in the definition file
 * or if it's already implement in the definition file, extract the existing constructor block from the .cpp file and don't generate a new one
 *
 * @param {vscode.TextDocument} fileHeader - The TextDocument representing the header file (.h).
 * @param {vscode.TextDocument} fileDefinition - The TextDocument representing the definition file (.cpp).
 * @param {string} className - The name of the main class.
 * @returns {string} The generated constructor.
 */
function createDefaultConstructorSkeleton(fileHeader, fileDefinition, className) {
  let defaultConstructorSkeleton = "";

  const defaultConstructorRegex = new RegExp(
    `(${className}::${className}\\s*\\(\\s*\\))`
  );

  const haveDefaultConstructorInHeader = haveDefaultConstructor(
    fileHeader,
    className
  );

  const arrayOfDefaultConstructor = browseFileToGetImplementation(
    fileDefinition,
    className,
    defaultConstructorRegex
  );

  const isDefaultConstructorImplemented = arrayOfDefaultConstructor.length !== 0;

  if (haveDefaultConstructorInHeader && isDefaultConstructorImplemented) {
    for (let i = 0; i < arrayOfDefaultConstructor.length; i++) {
      defaultConstructorSkeleton += `${arrayOfDefaultConstructor[i]}\n`;
    }
    defaultConstructorSkeleton += `\n`;
  } else if (haveDefaultConstructorInHeader && !isDefaultConstructorImplemented) {
    defaultConstructorSkeleton += `${className}::${className}()\n`;
    defaultConstructorSkeleton += `{\n\t// TODO : implement the default constructor\n}\n\n`;
  }

  return defaultConstructorSkeleton;
}

module.exports = {
  createDefaultConstructorSkeleton,
};
