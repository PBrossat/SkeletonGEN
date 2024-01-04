// eslint-disable-next-line no-unused-vars
const vscode = require("vscode");
const {
  isCommentLine,
  updateFlagIsBlockComment,
} = require("./utils/commentUtil");
const { containsTildeFollowedByClassName } = require("./utils/destructorUtil");
const {
  containsClassNameFOllowedByParenthesis,
} = require("./utils/constructorUtil");

/**
 * Check if the default constructor exist in the file (.h or .cpp depending on the typeFile)
 * Also check that the constructor is not in a comment or in a block comment in both files
 *
 * @param {vscode.TextDocument} file - The TextDocument representing the file (.h or .cpp).
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

    // If the file contain [className][spaces]() (and so [className]::[className][spaces]() works too)
    if (containsClassNameFOllowedByParenthesis(lineText, className)) {
      return true;
    }
  }

  // If the constructor is not found in both files
  return false;
}

/**
 * Method to check if the default constructor is already implemented in the definition file (.cpp) and extract the implementation (if it exists)
 *
 * @param {vscode.TextDocument} file - The TextDocument representing the C++ file (definition file).
 * @param {string} className - The name of the main class.
 * @returns {string[]} - An array containing the constructor implementation if it exists, empty array otherwise
 */
function defaultConstructorAlreadyImplemented(file, className) {
  const lineCount = file.lineCount;
  const result = [];
  let isBlockComment = false;

  // Regex to find the constructor ([className]::[className]())
  const constructorRegex = new RegExp(
    `\\b${className}\\s*::\\s*${className}\\s*\\(\\s*\\)`
  );

  // Browse the file line by line
  for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
    const lineText = file.lineAt(lineIndex).text;

    // Update the flag isBlockComment if the line contains /* or */
    isBlockComment = updateFlagIsBlockComment(lineText, isBlockComment);

    // If the constructor is found ([className]::[className]())
    if (lineText.match(constructorRegex)) {
      if (isBlockComment) {
        result.push("/*");
      }

      // If the line contains {, increment the number of open brackets
      let numberOfOpenBrackets = lineText.includes("{") ? 1 : 0;

      result.push(lineText);

      // Browse the file line by line starting from the next line
      for (
        let nextLineIndex = lineIndex + 1;
        nextLineIndex < lineCount;
        nextLineIndex++
      ) {
        const currentLineText = file.lineAt(nextLineIndex).text;

        isBlockComment = updateFlagIsBlockComment(
          currentLineText,
          isBlockComment
        );

        // If the line is on a comment, we increment the number of lines of the constructor implementation and add the comment line to the result
        if (isCommentLine(currentLineText)) {
          result.push(currentLineText);
          continue;
        }

        // If the line contains {, increment the number of open brackets
        if (currentLineText.includes("{")) {
          numberOfOpenBrackets++;
        }

        // If the line contains }, decrement the number of open brackets
        if (currentLineText.includes("}")) {
          numberOfOpenBrackets--;
        }

        // The constructor implementation is finished
        if (numberOfOpenBrackets === 0) {
          result.push(currentLineText);

          // If the method implementation is in a block comment, we add the closing comment tag
          if (isBlockComment) {
            result.push("*/");
          }

          return result; // Not necessary to browse the rest of the file
        }

        // We continue to browse the file
        result.push(currentLineText);
      }
    }
  }

  return result.length !== 0 ? result : [];
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
function createDefaultConstructorSkeleton(
  fileHeader,
  fileDefinition,
  className
) {
  let defaultConstructorSkeleton = "";
  const haveDefaultConstructorInHeader = haveDefaultConstructor(
    fileHeader,
    className
  );

  const arrayOfDefaultConstructor = defaultConstructorAlreadyImplemented(
    fileDefinition,
    className
  );

  // Check if the default constructor is already implemented in the definition file (if the array is empty, it's not implemented)
  const isDefaultConstructorImplemented =
    arrayOfDefaultConstructor.length !== 0;

  // If the default constructor exist in .h and already implemented in .cpp, we keep the implementation and append it to the skeleton
  if (haveDefaultConstructorInHeader && isDefaultConstructorImplemented) {
    for (let i = 0; i < arrayOfDefaultConstructor.length; i++) {
      defaultConstructorSkeleton += `${arrayOfDefaultConstructor[i]}\n`;
    }
    defaultConstructorSkeleton += `\n`;
  }
  // If the default constructor exist in .h and not implemented in .cpp, we create a skeleton
  else if (haveDefaultConstructorInHeader && !isDefaultConstructorImplemented) {
    defaultConstructorSkeleton += `${className}::${className}()\n`;
    defaultConstructorSkeleton += `{\n\t// TODO : implement the default constructor\n} `;
    defaultConstructorSkeleton += `\n\n`;
  }

  return defaultConstructorSkeleton;
}

module.exports = {
  createDefaultConstructorSkeleton,
};
