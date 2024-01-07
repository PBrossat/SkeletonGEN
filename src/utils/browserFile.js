// eslint-disable-next-line no-unused-vars
const vscode = require("vscode");
const { isCommentLine, updateFlagIsBlockComment } = require("./commentUtil");

/**
 * Method to check if the method, constructor or destructor is already implemented in the definition file (cpp file) and extract the implementation (if it exists)
 *
 * @param {vscode.TextDocument} file - The file we want to browse
 * @param {string} className - The name of the main class
 * @param {string} methodSignature - The signature of the method without spaces
 * @returns {string[]} An array containing the implementation if it exists, empty array otherwise
 */
function browseFileToGetImplementation(file, className, methodSignature) {
  const lineCount = file.lineCount;
  const result = [];
  let isBlockComment = false;

  // Browse the file line by line
  for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
    const lineText = file.lineAt(lineIndex).text;

    // Remove all spaces from lineText to match with same signature but not same indentation
    const lineTextWithoutSpaces = lineText.replace(/\s/g, "");

    // Update the flag isBlockComment if the line contains /* or */
    isBlockComment = updateFlagIsBlockComment(lineText, isBlockComment);

    // If the current line is equal to the method signature without spaces, we found the implementation
    if (lineTextWithoutSpaces === methodSignature) {
      
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

        // If the line is on a comment, we increment the number of lines of the constructor implementation and add the comment line to the result
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

        // The constructor implementation is finished
        if (numberOfOpenBrackets === 0) {
          result.push(currentLineText);

          // If the method implementation is in a block comment, we add the closing comment tag
          if (isBlockComment) {
            result.push("*/");
          }

          return result;
        }

        // We continue to browse the file
        result.push(currentLineText);
      }
    }
  }
  return result;
}

module.exports = {
  browseFileToGetImplementation,
};
