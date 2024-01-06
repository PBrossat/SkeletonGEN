// eslint-disable-next-line no-unused-vars
const vscode = require("vscode");
const {
  isCommentLine,
  updateFlagIsBlockComment,
} = require("./utils/commentUtil");
const { browseFileToGetImplementation } = require("./utils/browserFile");
const { isReservedWord } = require("./utils/languageCpp");

/**
 * Extracts and parses method signatures from a C++ file (.h).
 * It ignores inline methods and comments methods.
 * If you read this, first you are a very curious person (I like that), second I appologize for the mess in this function but it works.
 *
 * @param {vscode.TextDocument} file - The TextDocument representing the C++ file.
 * @returns {{returnType: string, methodName: string, parameters: string, isConstMethod: boolean, methodInComment: boolean }[]} - An array of objects representing method signatures with other essential informations
 */
function getAllMethodsWithSignature(file) {
  const lineCount = file.lineCount;

  const result = [];

  let isBlockComment = false;

  // Browse the file line by line
  principalLoop: for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
    const lineText = file.lineAt(lineIndex).text;

    // Special case : if the line starts with #, we skip it
    if(lineText.startsWith("#")){
      continue;
    }

    // Update the flag isBlockComment if the line contains /* or */
    isBlockComment = updateFlagIsBlockComment(lineText, isBlockComment);

    // If the method is found ([inline] [return type] [method name] ([parameters])[const])
    const methodRegex = new RegExp(
      /\b\s*(?:inline\s+)?\s*(static\s+)?\s*(virtual\s+)?\s*(unsigned|short|long)?\s*[a-zA-Z0-9_]+\s*(?:[&*]\s*)?[a-zA-Z0-9_&*]+\s*\([^\)]*\)(?:\s*const)?/g
    );

    const matchResult = lineText.match(methodRegex);

    if (matchResult) {

      const methodDeclaration = matchResult[0]; 

      let returnType = "";
      let methodName = "";
      const parameters = methodDeclaration.match(/\([^\)]*\)/)[0]; // get the parameters (if exist)
      let isConstMethod = false;
      const methodInComment = isCommentLine(lineText) || isBlockComment; // check if the method is in a comment

      // Split the method declaration in two parts : the left part (return type + method name) and the right part (parameters + const)
      const splitedArray = methodDeclaration.split(parameters); 

      const leftPartOfSignature = splitedArray[0].split(" "); // The return type, the method name and could be other keywords from C++
      const rightPartOfSignature = splitedArray[1]; // Could be "const" or nothing

      // Browse the left part of the method declaration
      for (let i = 0; i < leftPartOfSignature.length; i++) {
        const element = leftPartOfSignature[i];

        // If the element is a reserved word (or contains * or &), we add it to the return type
        if (isReservedWord(element)) {
          if (element === "inline") continue principalLoop; // If the method is inline, we skip it because the implementation is already in the header file
          if (element === "virtual" || element === "static") continue ; // If the method is virtual, we don't add it to the return type
          returnType += `${element} `;
        }   
        // Special case (auto format) : if the element starts with * or & (ex : *nameMethod or &nameMethod)
        else if (element[0] === "*" || element[0] === "&") {

          const firstChar = element[0];
          const restOfElement = element.slice(1); 

          returnType += `${firstChar}`;
          methodName += `${restOfElement}`;
        } 
        // This cas is for custom Return type (when we return a class for example)
        else if (!isReservedWord(element) && i !== leftPartOfSignature.length - 1) {
          returnType += `${element} `;
        }
        // It's the method name
        else {
          returnType = returnType.trimEnd(); // Remove the last space from the return type
          methodName = `${element}`;
        }
      }

      // Browse the right part of the method declaration if it exists
      if (rightPartOfSignature) {
        if (rightPartOfSignature.includes("const")) {
          isConstMethod = true;
        }
      }

      result.push({
        returnType,
        methodName,
        parameters,
        isConstMethod,
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
 * @param {{isVirtualMethod: boolean, returnType: string, methodName: string, parameters: string, isConstMethod: boolean, methodInComment: boolean }} method - An object representing a method signature, containing returnType, methodName, and parameters.
 * @param {string} className - The name of the main class.
 * @returns {string} - The skeleton of the method.
 */
function createMethodSkeleton(file, method, className) {
  let methodSkeleton = "";

  const parameters = method.parameters.replace(/([()])/g, "\\$1"); // Escape the parentheses

  const methodRegex = new RegExp(
    `(${method.returnType}\\s*${className}::${method.methodName}\\s*${parameters})`
  );

  const arrayMethodImplemented = browseFileToGetImplementation(
    file,
    className,
    methodRegex
  );

  const isMethodAlreadyImplemented = arrayMethodImplemented.length !== 0;

  // If the method is already implemented, we keep the implementation and append it to the skeleton
  if (isMethodAlreadyImplemented) {
    for (let i = 0; i < arrayMethodImplemented.length; i++) {
      methodSkeleton += `${arrayMethodImplemented[i]}\n`;
    }
    methodSkeleton += `\n`;
  }
  // If the method is not implemented and not in a comment in the header file, we create a skeleton
  else if (!method.methodInComment && !isMethodAlreadyImplemented) {
    methodSkeleton += `${method.returnType} ${className}::${method.methodName}${method.parameters}`;
    if (method.isConstMethod) methodSkeleton += `const`;
    methodSkeleton += `\n{\n\t// TODO : implement the method : ${method.methodName} \n} `;
    methodSkeleton += `\n\n`;
  }

  return methodSkeleton;
}

module.exports = {
  getAllMethodsWithSignature,
  createMethodSkeleton,
};
