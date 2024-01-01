/**
 * Check if the line in parameter is a comment line (//)
 * 
 * @param {string} lineText
 * @returns {boolean} - True if the line is a comment, false otherwise.
 */
function isCommentLine(lineText) {
    return lineText.trim().startsWith('//');
}


function updateFlagIsBlockComment(lineText, isBlockComment) {
    if (lineText.includes("/*")) {
        isBlockComment = true;
    }

    if (lineText.includes("*/")) {
        isBlockComment = false;
    }

    return isBlockComment;
}

module.exports = {
    isCommentLine,
    updateFlagIsBlockComment,
};