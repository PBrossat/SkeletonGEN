// eslint-disable-next-line no-unused-vars
const vscode = require("vscode");
const {
  isCommentLine,
  updateFlagIsBlockComment,
} = require("./utils/commentUtil");
const { isReservedWord } = require("./utils/languageCpp");

/**
 *  Extracts and parses operator overloading from a C++ file (.h).
 *  It ignores inline methods and comments methods.
 *
 * @param {vscode.TextDocument} file - The TextDocument representing the C++ file.
 * @param {string} className - The name of the main class.
 */
function getOperatorOveloading(file, className) {
  const lineCount = file.lineCount;

  const result = [];

  let isBlockComment = false;

  // Browse the file line by line
  principalLoop: for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
    const lineText = file.lineAt(lineIndex).text;

    // Special case : if the line starts with #, we skip it
    if (lineText.startsWith("#")) {
      continue;
    }

    // Update the flag isBlockComment if the line contains /* or */
    isBlockComment = updateFlagIsBlockComment(lineText, isBlockComment);

    // If the method is found ([inline] [friend] [return type] "operator" [operator sign] ([parameters])[const])
    const operatorRegex = new RegExp(
      /\b\s*(const\s+)?\s*(?:inline\s+)?\s*(static\s+)?\s*(virtual\s+)?\s*(unsigned|short|long)?\s*[a-zA-Z0-9_]+\s*(?:[&*]\s*)?operator+\s*([=<>!]+|\+\+|--|\+=|-=|\*=|\/=|%=|<<|>>)\s*\([^\)]*\)(?:\s*const)?/g
    );

    let operatorMatch = operatorRegex.exec(lineText);

    if (operatorMatch) {
      const operatorOverloadingDeclaration = operatorMatch[0];

      let returnType = "";
      let typeOfOperator = "";
      let parametersMatch = operatorOverloadingDeclaration.match(/\([^\)]*\)/); // Get the parameters of operator overloading
      let parameters = parametersMatch ? parametersMatch[0] : "";

      // Special case : if parameters have default values, we remove the default values
      // Because we don't need them to create the skeleton
      if (parameters.includes("=")) {
        let removedElement = false;
        for (let i = 0; i < parameters.length; i++) {
          const element = parameters[i];

          if (element === "=") {
            removedElement = true;
          }
          if (element === "," || element === ")") {
            removedElement = false;
          }
          if (removedElement) {
            parameters = parameters.replace(element, " ");
          }
        }

        // removed the unnecessary spaces
        parameters = parameters
          .replace(/\s*(,\s*)/g, ",")
          .replace(/\s*\)/g, ")");

        // after each comma, we add a space (for the formatting)
        parameters = parameters.replace(/,/g, ", ");
      }

      let isConstOperatorOverloading = false;
      const OperatorOverloadingInComment =
        isCommentLine(lineText) || isBlockComment; // check if the operator overloading is in a comment

      let isConstMethod = false;
      const methodInComment = isCommentLine(lineText) || isBlockComment; // check if the method is in a comment

      // Split the method declaration in two parts : the left part (return type + method name) and the right part (parameters + const)
      const splitedArray = operatorOverloadingDeclaration.split("(");

      const leftPartOfSignature = splitedArray[0].split(" "); // The return type, the method name and could be other keywords from C++
      // TODO: Making this more readable
      const rightPartOfSignature = splitedArray[1].split(")")[1]; // Could be "const" or nothing

      // TODO
    }
  }

  return result;
}

module.exports = { getOperatorOveloading };
