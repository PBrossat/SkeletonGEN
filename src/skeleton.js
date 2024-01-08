// eslint-disable-next-line no-unused-vars
const vscode = require("vscode");

// Import
const {
  createConstructorWithParametersSkeleton,
} = require("./constructorParam");
const { createDefaultConstructorSkeleton } = require("./defaultConstructor");
const { createDestructor } = require("./destructor");
const { createMethodSkeleton } = require("./methods");
const { createIncludeSkeleton } = require("./include");

/**
 * Create the skeleton of the class
 *
 * @param {vscode.TextDocument} fileHeader - The TextDocument representing the header file (.h).
 * @param {vscode.TextDocument} fileDefinition - The TextDocument representing the definition file (.cpp).
 * @param {string} nameFile - The name of the file class.
 * @param {string} className - The name of the main class.
 * @param {{returnType: string, methodName: string, parameters: string, isConstMethod: boolean, methodInComment: boolean }[]} methods - The methods of the class (without constructor and destructor)
 * @returns {string} - The generated skeleton.
 */
function createSkeleton(
  fileHeader,
  fileDefinition,
  nameFile,
  className,
  methods,
  constructorsWithParameters
) {
  let skeleton = "";

  // Create the include
  skeleton += createIncludeSkeleton(fileDefinition, nameFile);

  // Create the constructor
  skeleton += createDefaultConstructorSkeleton(
    fileHeader,
    fileDefinition,
    className
  );

  //Create the destructor
  skeleton += createDestructor(fileHeader, fileDefinition, className);

  // Create the constructor with parameters
  for (let i = 0; i < constructorsWithParameters.length; i++) {
    skeleton += createConstructorWithParametersSkeleton(
      fileDefinition,
      constructorsWithParameters[i],
      className
    );
  }

  // Create all the methods
  for (let i = 0; i < methods.length; i++) {
    skeleton += createMethodSkeleton(fileDefinition, methods[i], className);
  }

  // Remove the two last \n of the skeleton from the last creation
  skeleton = skeleton.slice(0, -2);

  return skeleton;
}

module.exports = {
  createSkeleton,
};
