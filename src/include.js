// eslint-disable-next-line no-unused-vars
const vscode = require("vscode");
const { isCommentLine } = require("./utils/commentUtil");

/**
 * Extracts include from a C++ file (.cpp).
 *
 * @param {vscode.TextDocument} file - The TextDocument representing the C++ file.
 * @returns {string[]} - An array of string representing the include (and using) of the file.
 */
function getInclude(file) {
  const lineCount = file.lineCount;
  const result = [];

  const includeRegex = new RegExp(
    /^\s*(#include\s*<[^>]*>|#include\s*"[^"]*")\s*$/
  );

  const usingRegex = new RegExp(/^\s*using\b/gm);

  for (let lineIndex = 0; lineIndex < lineCount; lineIndex++) {
    const lineText = file.lineAt(lineIndex).text;

    const matchResultInclude = lineText.match(includeRegex);
    const matchResultUsing = lineText.match(usingRegex);
    const isIncludeOrUsing = matchResultInclude || matchResultUsing;

    if (isIncludeOrUsing || (isCommentLine(lineText) && isIncludeOrUsing)) {
      result.push(lineText);
    }
  }
  return result;
}

/**
 * Create the skeleton of the include of the class
 *
 * @param {vscode.TextDocument} file - The TextDocument representing the C++ file.
 * @param {string} nameFile - The name of the file class.
 * @returns {string} - The generated skeleton.
 */
function createIncludeSkeleton(file, nameFile) {
  const include = getInclude(file);
  let skeleton = "";

  if (include.length !== 0) {
    for (let i = 0; i < include.length; i++) {
      skeleton += `${include[i]}\n`;
    }
    skeleton += `\n`;
  } else {
    skeleton += `#include "${nameFile}.h"\n#include <iostream>\nusing namespace std;\n\n`;
  }
  return skeleton;
}

module.exports = {
  createIncludeSkeleton,
};
