// eslint-disable-next-line no-unused-vars
const vscode = require("vscode");
const { isCommentLine, updateFlagIsBlockComment } = require("./utils/commentUtil");


/**
 * Extracts and parses method signatures from a C++ file (.h). 
 * It ignores inline methods and comments methods.
 *
 * @param {vscode.TextDocument} file - The TextDocument representing the C++ file.
 * @returns {Array<{ returnType: string, methodName: string, parameters: string, methodInComment: boolean }>} - An array of objects representing method signatures, each containing returnType, methodName, and parameters.
 */
function getAllMethodsWithSignature(file) {
  const lineCount = file.lineCount;

  const result = [];

  let isBlockComment = false;

  // Browse the file line by line
  for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
    const lineText = file.lineAt(lineIndex).text;

    // Update the flag isBlockComment if the line contains /* or */
    isBlockComment = updateFlagIsBlockComment(lineText, isBlockComment);

    // If the method is found ([return type] [method name] ([parameters]))
    const methodRegex = new RegExp(/\b\s*(?:inline\s+)?\s*[a-zA-Z0-9_]+\s+[a-zA-Z0-9_]+\s*\([^\)]*\)/g);

    const matchResult = lineText.match(methodRegex);

    if (matchResult) {
      // If it's inline, skip it
      if (/\binline\b/.test(lineText)) {
        continue;
      }

      const returnType = matchResult[0].match(/[a-zA-Z0-9_]+/)[0]; // get the return type
      const methodName = matchResult[0].split(" ")[1].split("(")[0]; // get the method name
      const parameters = matchResult[0].match(/\([^\)]*\)/)[0]; // get the parameters (if exist)
      const methodInComment = isCommentLine(lineText) || isBlockComment; // check if the method is in a comment

      result.push({
        returnType,
        methodName,
        parameters,
        methodInComment,
      });
    }
  }

  return result;
}


/**
 * Extracts the method implementation from the C++ file (.cpp) if it already exists else, creates a skeleton.
 *
 * @param {vscode.TextDocument} file - The TextDocument representing the C++ file.
 * @param {{ returnType: string, methodName: string, parameters: string , methodInComment : Boolean}} method - An object representing a method signature, containing returnType, methodName, and parameters.
 * @param {string} className - The name of the main class.
 * @returns {string} - True if the method is already implemented, false otherwise.
 */
function createMethodSkeleton(file, method, className) {
  let methodSkeleton = "";

  const isMethodAlreadyImplemented = MethodAlreadyImplemented(file, method, className);

  // If the method is already implemented, we keep the implementation and append it to the skeleton
  if (isMethodAlreadyImplemented) {
    methodSkeleton = `${isMethodAlreadyImplemented[1]}\n\n`;
  }
  // If the method is not implemented and not in a comment, we create a skeleton
  else if (!method.methodInComment && !isMethodAlreadyImplemented){
    methodSkeleton += `${method.returnType} ${className}::${method.methodName}${method.parameters}\n`;
    methodSkeleton += `{\n\t// TODO : implement the method : ${method.methodName} \n} `;
    methodSkeleton += `\n\n`;
  }

  return methodSkeleton;
}

/**
 * Method to check if a method is already implemented in the C++ file (.cpp).
 * 
 * @param {vscode.TextDocument} file - The TextDocument representing the C++ file (definition file).
 * @param {{ returnType: string, methodName: string, parameters: string, methodInComment : boolean  }} method - An object representing a method signature, containing returnType, methodName, and parameters.
 * @param {string} className - The name of the main class.
 * @returns {Array} - An array containing the method implementation if it exists, null otherwise.
 */
function MethodAlreadyImplemented(file, method, className) {

  const parameters = method.parameters.replace(/([()])/g, "\\$1"); // Escape the parentheses

  // Create a regex to find the method implementation
  const methodRegex = new RegExp(
    `(${method.returnType}\\s*${className}::${method.methodName}\\s*${parameters}\\s*{[^}]*})`
  );

  const methodAlreadyImplemented = file.getText().match(methodRegex);

  return methodAlreadyImplemented; 
}


module.exports = {
  getAllMethodsWithSignature,
  createMethodSkeleton,
};
