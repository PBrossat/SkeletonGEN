// eslint-disable-next-line no-unused-vars
const vscode = require("vscode");
const { isComment} = require("./utils/commentUtil");
const { containsTildeFollowedByClassName } = require("./utils/destructorUtil");
const {containsClassNameFOllowedByParenthesis} = require("./utils/constructorUtil");


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

  // Browse the file line by line
  for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
    const lineText = file.lineAt(lineIndex).text;

    // Ignore comments line (c++ or c style) or destructor
    if (isComment(lineText) || containsTildeFollowedByClassName(lineText, className)) {
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
 * Create the default constructor of the class if it exist in the header file and doesn't already implement in the definition file
 * or if it's already implement in the definition file, extract the existing constructor block from the .cpp file and don't generate a new one
 *
 * @param {vscode.TextDocument} fileHeader - The TextDocument representing the header file (.h).
 * @param {vscode.TextDocument} fileDefinition - The TextDocument representing the definition file (.cpp).
 * @param {string} className - The name of the main class.
 * @returns {string} - The generated constructor.
 */
function createDefaultConstructor(fileHeader, fileDefinition, className) {
  let constructor = "";

  // If the constructor exist in the header file or doesn't already implement in the definition file
  if (
    haveDefaultConstructor(fileHeader, className) &&
    !haveDefaultConstructor(fileDefinition, className)
  ) {
    constructor += `${className}::${className}()\n{\n\t// TODO : implement the default constructor\n}\n\n`;
  }
  // If the constructor is already implement in the definition file
  else if (haveDefaultConstructor(fileDefinition, className)) {
    // Extract the existing constructor block from the .cpp file
    const constructorRegex = new RegExp(
      `(${className}::${className}\\s*\\([^\\)]*\\)\\s*{[^}]*})`
    );

    const constructorMatch = fileDefinition.getText().match(constructorRegex);

    // If the constructor block is found, append it to the generated constructor
    if (constructorMatch) {
      constructor += `${constructorMatch[1]}\n\n`;
    }
  }

  return constructor;
}

/**
 *  Extract the constructor with parameters implementation from the C++ file (.cpp) if it already exists else, creates a skeleton.
 *
 * @param {vscode.TextDocument} file - The TextDocument representing the definition file (.cpp).
 * @param {{constructorParameters: string}} constructor - An object representing a constructor with parameters, containing constructorParameters.
 * @param {string} className - The name of the main class.
 * @returns {string} - The generated constructor with parameters.
 */
function createConstructorWithParametersSkeleton(file, constructor, className) {
  let constructorWithParametersSkeleton = "";

  const param = constructor.constructorParameters.replace(/([()])/g, "\\$1"); // Escape the parentheses

  // Create a regex to find the method implementation
  const constructorWithParametersRegex = new RegExp(
    `(${className}::${className}\\s*${param}\\s*{[^}]*})`
  );

  const constructorWithParametersAlreadyImplemented = file
    .getText()
    .match(constructorWithParametersRegex);

  // If the constructor with parameters is already implemented, we keep the implementation and append it to the skeleton
  if (constructorWithParametersAlreadyImplemented) {
    constructorWithParametersSkeleton = `${constructorWithParametersAlreadyImplemented[1]}\n\n`;
  }
  // If the method is not implemented, we create a skeleton
  else {
    constructorWithParametersSkeleton += `${className}::${className}${constructor.constructorParameters}\n`;
    constructorWithParametersSkeleton += `{\n\t// TODO : implement the constructor with parameters\n} `;
    constructorWithParametersSkeleton += `\n\n`;
  }

  return constructorWithParametersSkeleton;
}

/**
 * Get all the constructor with parameters of the class 
 *
 * @param {vscode.TextDocument} file - The TextDocument representing the header file (.h).
 * @param {string} className - The name of the main class.
 * @returns {Array<{ constructorParameters: string }>} - An array of objects representing constructor with parameters, each containing parameters of the constructor.
 */
function getAllConstructorWithParameters(file, className) {
  
  const lineCount = file.lineCount;

  const result = [];

  // Browse the file line by line
  for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
    const lineText = file.lineAt(lineIndex).text;

    // Ignore comments line (c++ or c style) or destructor
    if (isComment(lineText) || containsTildeFollowedByClassName(lineText, className) ) {
      continue;
    }

    // If the constructor is found ([className]([parameters]))
    const constructorRegex = new RegExp(
      `\\b(?:inline\\s+)?${className}\\s*\\([^)]+\\)`,
      "g"
    );
    const matchResult = lineText.match(constructorRegex);

    if (matchResult) {
      // If it's inline, skip it
      if (/\binline\b/.test(lineText)) {
        continue;
      }

      // Get the parameters (if exist)
      const constructorParameters = lineText.match(/\([^\)]*\)/)[0]; // get the parameters (if exist)

      result.push({
        constructorParameters,
      });
    }
  }

  return result;
}




module.exports = {
  createDefaultConstructor,
  getAllConstructorWithParameters,
  createConstructorWithParametersSkeleton,
};
