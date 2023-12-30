// eslint-disable-next-line no-unused-vars
const vscode = require('vscode');

/**
 * Gets the name of the class from the given TextDocument.
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
    getClassName,
};