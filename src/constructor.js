// eslint-disable-next-line no-unused-vars
const vscode = require("vscode");

/**
 * Create the constructor of the class if it exist in the header file and doesn't already implement in the definition file
 * or if it's already implement in the definition file, extract the existing constructor block from the .cpp file and don't generate a new one
 *
 * @param {vscode.TextDocument} fileHeader - The TextDocument representing the header file (.h).
 * @param {vscode.TextDocument} fileDefinition - The TextDocument representing the definition file (.cpp).
 * @param {string} className - The name of the main class.
 * @returns {string} - The generated constructor.
 */
function createConstructor(fileHeader, fileDefinition, className) {
  let constructor = "";

  // If the constructor exist in the header file or doesn't already implement in the definition file
  if (
    haveConstructor(fileHeader, 0, className) &&
    !haveConstructor(fileDefinition, 1, className)
  ) {
    constructor += `${className}::${className}()\n{\n\t// TODO : implement the constructor\n}\n\n`;
  }
  // If the constructor is already implement in the definition file
  else if (haveConstructor(fileDefinition, 1, className)) {
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
 *
 * @param {vscode.TextDocument} file
 * @param int typeFile : 0 = header, 1 = definition
 * @returns boolean
 */
function haveConstructor(file, typeFile, className) {
  const fileContent = file.getText();
  let constructorMatch = null;

  // if it's a .h file
  if (typeFile === 0) {
    constructorMatch = fileContent.match(
      new RegExp(`(${className})\\s*\\(\\s*\\)`)
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
  createConstructor,
};
