/**
 * Check if the line in parameter contains Tilde followed by the class name
 * 
 * @param {string} lineText - The line to check.
 * @param {string} className - The name of the main class.
 * @returns {boolean} - True if the line contains Tilde followed by the class name, false otherwise.
 */
function containsTildeFollowedByClassName(lineText, className) {
    
    // If className contains other than letters
    if (!/^[a-zA-Z]+$/.test(className)) {
        return false;
    }
    
    const regex = new RegExp(`~\\s*${className}\\s*\\(\\s*\\)`);
    return regex.test(lineText);
}

module.exports = {
    containsTildeFollowedByClassName,
};