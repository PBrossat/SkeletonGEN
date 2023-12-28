// eslint-disable-next-line no-unused-vars
const vscode = require("vscode");

// Import
const { createConstructor } = require("./constructor");
const { createDestructor } = require("./destructor");
const { createMethodSkeleton } = require("./Methods");

/**
 *
 * @param {vscode.TextDocument} fileHeader - The TextDocument representing the header file (.h).
 * @param {vscode.TextDocument} fileDefinition - The TextDocument representing the definition file (.cpp).
 * @param {string} nameFile - The name of the file class.
 * @param {string} className - The name of the main class.
 * @param {Array<{ returnType: string, methodName: string, parameters: string }>} methods - The methods of the class (without constructor and destructor)
 * @returns {string} - The generated skeleton.
 */
function createSkeleton(
  fileHeader,
  fileDefinition,
  nameFile,
  className,
  methods
) {
  let skeleton = "";

  skeleton += `#include "${nameFile}.h"\n#include <iostream>\nusing namespace std;\n\n`;

  // Create the constructor
  skeleton += createConstructor(fileHeader, fileDefinition, className);

  //Create the destructor
  skeleton += createDestructor(fileHeader, fileDefinition, className);

  // Create all the methods
  for (let i = 0; i < methods.length; i++) {
    skeleton += createMethodSkeleton(fileDefinition, methods[i], className);
  }

  return skeleton;
}

module.exports = {
  createSkeleton,
};
