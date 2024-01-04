// eslint-disable-next-line no-unused-vars
const vscode = require("vscode");
const {
  isCommentLine,
  updateFlagIsBlockComment,
} = require("./utils/commentUtil");
const { containsTildeFollowedByClassName } = require("./utils/destructorUtil");

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

function constructorParametersAlreadyImplemented(file, constructor, className) {
  const lineCount = file.lineCount;
  const result = [];
  let isBlockComment = false;

  const parameters = constructor.constructorParameters.replace(
    /([()])/g,
    "\\$1"
  ); // Escape the parentheses

  // Regex to find the constructor with parameters ([className] :: [className] ([parameters]))
  const methodRegex = new RegExp(
    `(${className}\\s*::\\s*${className}\\s*${parameters})`
  );

  // Browse the file line by line in order to find the method implementation (if it exists)
  for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
    const lineText = file.lineAt(lineIndex).text;

    // Update the flag isBlockComment if the line contains /* or */
    isBlockComment = updateFlagIsBlockComment(lineText, isBlockComment);

    // If the method is found ([return type] [class name]::[method name] ([parameters]))
    if (lineText.match(methodRegex)) {
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

        // If the line is on a comment, we increment the number of lines of the method implementation and add the comment line to the result
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

        // The method implementation is finished
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

function createConstructorWithParametersSkeleton(file, constructor, className) {
  let constructorParametersSkeleton = "";

  const arrayConstructorParameterImplemented =
    constructorParametersAlreadyImplemented(file, constructor, className);

  const isConstructorAlreadyImplemented =
    arrayConstructorParameterImplemented.length !== 0;

  // If the constructor is already implemented, we return the implementation
  if (isConstructorAlreadyImplemented) {
    for (let i = 0; i < arrayConstructorParameterImplemented.length; i++) {
      constructorParametersSkeleton +=
        arrayConstructorParameterImplemented[i] + "\n";
    }
    constructorParametersSkeleton += "\n";
  } else if (
    !constructor.constructorInComment &&
    !isConstructorAlreadyImplemented
  ) {
    constructorParametersSkeleton += `${className}::${className}${constructor.constructorParameters}\n`;
    constructorParametersSkeleton += `{\n\t// TODO : implement the constructor with parameters \n} `;
    constructorParametersSkeleton += `\n\n`;
  }

  return constructorParametersSkeleton;
}

module.exports = {
  getAllConstructorWithParameters,
  createConstructorWithParametersSkeleton,
};
