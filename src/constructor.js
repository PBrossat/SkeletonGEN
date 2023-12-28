// eslint-disable-next-line no-unused-vars
const vscode = require("vscode");

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
    haveDefaultConstructor(fileHeader, 0, className) &&
    !haveDefaultConstructor(fileDefinition, 1, className)
  ) {
    constructor += `${className}::${className}()\n{\n\t// TODO : implement the constructor\n}\n\n`;
  }
  // If the constructor is already implement in the definition file
  else if (haveDefaultConstructor(fileDefinition, 1, className)) {
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
  const fileContent = file.getText();

  const constructorRegex = new RegExp(
    `\\b(?:inline\\s+)?${className}\\s*\\([^)]+\\)`,
    "g"
  ); // [inline] [className] ([parameters]) (inline is optional)

  const constructorMatches = fileContent.match(constructorRegex);

  const result = [];

  // Create a template array with : parameters of the constructor (if exist)
  for (let i = 0; i < constructorMatches.length; i++) {
    // If the method is inline, skip it
    if (/\binline\b/.test(constructorMatches[i])) {
      continue;
    }

    const constructorParameters = constructorMatches[i].match(/\([^\)]*\)/)[0]; // get the parameters (if exist)

    result.push({
      constructorParameters,
    });
  }

  return result;
}

/**
 * Check if the default constructor exist in the file (.h or .cpp depending on the typeFile)
 *
 * @param {vscode.TextDocument} file
 * @param int typeFile : 0 = header, 1 = definition
 * @returns boolean
 */
function haveDefaultConstructor(file, typeFile, className) {
  const fileContent = file.getText();
  let constructorMatch = null;

  // if it's a .h file
  if (typeFile === 0) {
    constructorMatch = fileContent.match(
      new RegExp(`\\b${className}\\s*\\(\\s*\\)`)
    ); // [className] ()
  }
  // if it's a .cpp file
  else if (typeFile === 1) {
    constructorMatch = fileContent.match(
      new RegExp(`(${className})\\s*::\\s*(${className})\\s*\\(\\s*\\)`)
    ); // [className]::[className]()
  }

  return constructorMatch !== null;
}

module.exports = {
  createDefaultConstructor,
  getAllConstructorWithParameters,
  createConstructorWithParametersSkeleton,
};
