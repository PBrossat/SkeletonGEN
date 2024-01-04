// eslint-disable-next-line no-unused-vars
const vscode = require("vscode");
const {
  isCommentLine,
  updateFlagIsBlockComment,
} = require("./utils/commentUtil");
const { browseFileToGetImplementation } = require("./utils/browserFile");

/**
 * Extracts and parses method signatures from a C++ file (.h).
 * It ignores inline methods and comments methods.
 *
 * @param {vscode.TextDocument} file - The TextDocument representing the C++ file.
 * @returns {{ returnType: string, methodName: string, parameters: string, methodInComment: boolean }[]} - An array of objects representing method signatures, each containing returnType, methodName, and parameters.
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

    // If the method is found ([inline] [return type] [method name] ([parameters])[const])
    const methodRegex = new RegExp(
      /\b\s*(?:inline\s+)?\s*(virtual\s+)?\s*(unsigned|short|long)?\s*[a-zA-Z0-9_]+\s+[a-zA-Z0-9_]+\s*\([^\)]*\)(?:\s*const)?/g
    );

    const matchResult = lineText.match(methodRegex);

    if (matchResult) {
      const methodDeclaration = matchResult[0];
      
      // Ensure 'inline' is before the return type in the method declaration
      const inlineIndex = methodDeclaration.indexOf('inline');
      //const virtualIndex = methodDeclaration.indexOf('virtual');
      const nameMethodIndex = methodDeclaration.indexOf(
        matchResult[0].split(" ")[1].split("(")[0]
      );

      console.log(
        inlineIndex,
        nameMethodIndex,
        matchResult[0].split(" ")[1].split("(")[0]
      );

      if(inlineIndex !== -1 && inlineIndex < nameMethodIndex) {
        continue;
      }
      


      const returnType = matchResult[0].match(/[a-zA-Z0-9_]+/)[0]; // get the return type
      const methodName = matchResult[0].split(" ")[1].split("(")[0]; // get the method name
      const parameters = matchResult[0].match(/\([^\)]*\)/)[0]; // get the parameters (if exist)
      const methodInComment = isCommentLine(lineText) || isBlockComment; // check if the method is in a comment
      const isConst = /\bconst\b/.test(lineText); // check if the method is const

      result.push({
        returnType,
        methodName,
        parameters,
        methodInComment,
        isConst,
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
    methodSkeleton += `${method.returnType} ${className}::${method.methodName}${method.parameters}\n`;
    methodSkeleton += `{\n\t// TODO : implement the method : ${method.methodName} \n} `;
    methodSkeleton += `\n\n`;
  }

  return methodSkeleton;
}

module.exports = {
  getAllMethodsWithSignature,
  createMethodSkeleton,
};
