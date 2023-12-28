// eslint-disable-next-line no-unused-vars
const vscode = require("vscode");

/**
 * Extracts and parses method signatures from a C++ file (.h).
 *
 * @param {vscode.TextDocument} file - The TextDocument representing the C++ file.
 * @returns {Array<{ returnType: string, methodName: string, parameters: string }>} - An array of objects representing method signatures, each containing returnType, methodName, and parameters.
 */
function getAllMethodsWithSignature(file) {
  const fileContent = file.getText();

  const methods = fileContent.match(
    /\b\s*(?:inline\s+)?\s*[a-zA-Z0-9_]+\s+[a-zA-Z0-9_]+\s*\([^\)]*\)/g
  ); // [return type] [method name] ([parameters])

  const result = [];

  // Create a template array with : return type, method name, parameters
  for (let i = 0; i < methods.length; i++) {
    // If the method is inline, skip it
    if (/\binline\b/.test(methods[i])) {
      continue;
    }
    const returnType = methods[i].match(/[a-zA-Z0-9_]+/)[0]; // get the return type
    const methodName = methods[i].split(" ")[1].split("(")[0]; // get the method name
    const parameters = methods[i].match(/\([^\)]*\)/)[0]; // get the parameters (if exist)

    result.push({
      returnType,
      methodName,
      parameters,
    });
  }

  return result;
}

/**
 * Extracts the method implementation from the C++ file (.cpp) if it already exists else, creates a skeleton.
 *
 * @param {vscode.TextDocument} file - The TextDocument representing the C++ file.
 * @param {{ returnType: string, methodName: string, parameters: string }} method - An object representing a method signature, containing returnType, methodName, and parameters.
 * @param {string} className - The name of the main class.
 * @returns {string} - True if the method is already implemented, false otherwise.
 */
function createMethodSkeleton(file, method, className) {
  let methodSkeleton = "";

  const parameters = method.parameters.replace(/([()])/g, "\\$1"); // Escape the parentheses

  // Create a regex to find the method implementation
  const methodRegex = new RegExp(
    `(${method.returnType}\\s*${className}::${method.methodName}\\s*${parameters}\\s*{[^}]*})`
  );

  const methodAlreadyImplemented = file.getText().match(methodRegex);

  // If the method is already implemented, we keep the implementation and append it to the skeleton
  if (methodAlreadyImplemented) {
    methodSkeleton = `${methodAlreadyImplemented[1]}\n\n`;
  }
  // If the method is not implemented, we create a skeleton
  else {
    methodSkeleton += `${method.returnType} ${className}::${method.methodName}${method.parameters}\n`;
    methodSkeleton += `{\n\t// TODO : implement the method : ${method.methodName} \n} `;
    methodSkeleton += `\n\n`;
  }

  return methodSkeleton;
}

/**
 *
 * @param {vscode.TextDocument} file - The TextDocument representing the C++ file.
 * @returns {string} - The name of the class.
 */
function getClassName(file) {
  const fileContent = file.getText();
  const className = fileContent.match(/class\s+([a-zA-Z0-9_]+)/)[1]; // class [space] name
  return className;
}

module.exports = {
  getAllMethodsWithSignature,
  getClassName,
  createMethodSkeleton,
};
