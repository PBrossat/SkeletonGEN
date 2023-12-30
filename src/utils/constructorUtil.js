/**
*  Check if the line in parameter contains the class name followed by a parenthesis
* 
* @param {string} lineText - The line to check.
* @param {string} className - The name of the main class.
* @returns {boolean} - True if the line contains the class name followed by a parenthesis, false otherwise.
*/
function containsClassNameFOllowedByParenthesis(lineText, className) {
    const regex = new RegExp(`\\b${className}\\s*\\(\\s*\\)`);
    return regex.test(lineText);
}

module.exports = {
    containsClassNameFOllowedByParenthesis,
};