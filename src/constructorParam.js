// eslint-disable-next-line no-unused-vars
const vscode = require("vscode");
const {
  isCommentLine,
  updateFlagIsBlockComment,
} = require("./utils/commentUtil");
const { containsTildeFollowedByClassName } = require("./utils/destructorUtil");
const { browseFileToGetImplementation } = require("./utils/browserFile");

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

  let isBlockComment = false;

  // Browse the file line by line
  for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
    const lineText = file.lineAt(lineIndex).text;

    // Update the flag isBlockComment if the line contains /* or */
    isBlockComment = updateFlagIsBlockComment(lineText, isBlockComment);

    // Ignore destructor
    if (containsTildeFollowedByClassName(lineText, className)) {
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
      const constructorInComment = isCommentLine(lineText) || isBlockComment; // check if the constructor is in a comment

      result.push({
        constructorParameters,
        constructorInComment,
      });
    }
  }

  return result;
}


function createConstructorWithParametersSkeleton(file, constructor, className) {
  let constructorParametersSkeleton = "";

  const parameters = constructor.constructorParameters.replace(/\s/g, "");

  // Regex to find the constructor with parameters ([className] :: [className] ([parameters]))
  const constructorWithParam = `${className}::${className}${parameters}`

  const arrayConstructorParameterImplemented =
    browseFileToGetImplementation(file, className, constructorWithParam);

  const isConstructorAlreadyImplemented =
    arrayConstructorParameterImplemented.length !== 0;

  // If the constructor is already implemented, we return the implementation
  if (isConstructorAlreadyImplemented) {
    for (let i = 0; i < arrayConstructorParameterImplemented.length; i++) {
      constructorParametersSkeleton +=
        arrayConstructorParameterImplemented[i] + "\n";
    }
    constructorParametersSkeleton += "\n";
  }
  // If the method is not in comment in .h file and not already implemented in .cpp file, we create a skeleton 
  else if (!constructor.constructorInComment && !isConstructorAlreadyImplemented) {
    constructorParametersSkeleton += `${className}::${className}${constructor.constructorParameters}\n`;
    constructorParametersSkeleton += `{\n\t// TODO : implement the constructor with parameters \n}\n\n`;
    }

  return constructorParametersSkeleton;
}

module.exports = {
  getAllConstructorWithParameters,
  createConstructorWithParametersSkeleton,
};
