// eslint-disable-next-line no-unused-vars
const vscode = require("vscode");

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
    haveDestructor(fileHeader, 0, className) &&
    !haveDestructor(fileDefinition, 1, className)
  ) {
    destructor += `${className}::~${className}()\n{\n\t// TODO : implement the destructor\n}\n\n`;
  }
  // If the destructor is already implement in the definition file
  else if (haveDestructor(fileDefinition, 1, className)) {
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
 * @param {number} typeFile 0 = header, 1 = definition
 * @returns {boolean}
 */
function haveDestructor(file, typeFile, className) {
  const fileContent = file.getText();
  let destructorMatch = null;

  // if it's a .h file
  if (typeFile === 0) {
    destructorMatch = fileContent.match(
      new RegExp(`(${className})\\s*\\(\\s*\\)`)
    ); // [className] ()
  }
  // if it's a .cpp file
  else if (typeFile === 1) {
    destructorMatch = fileContent.match(
      new RegExp(`(${className})\\s*::~\\s*(${className})\\s*\\(\\s*\\)`)
    ); // [className]::~[className]()
  }

  return destructorMatch !== null;
}

module.exports = {
  createDestructor,
};
