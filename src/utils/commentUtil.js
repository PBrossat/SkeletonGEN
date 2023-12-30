/**
 * Check if the line in parameter is a comment (c++ or c style)
 * 
 * @param {string} lineText
 * @returns {boolean} - True if the line is a comment, false otherwise.
 */
function isComment(lineText) {
    return lineText.trim().startsWith('//') || lineText.trim().startsWith('/*') || lineText.trim().startsWith('*');
}

module.exports = {
    isComment,
};