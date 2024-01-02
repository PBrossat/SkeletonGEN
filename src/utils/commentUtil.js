/**
 * Check if the line in parameter is a comment line (//)
 * 
 * @param {string} lineText
 * @returns {boolean} - True if the line is a comment, false otherwise.
 */
function isCommentLine(lineText) {
    return lineText.trim().startsWith('//');
}

/**
 * Update the flag isBlockComment according to the current line.
 * 
 * @param {string} lineText - The current line text.
 * @param {boolean} isBlockComment - The current flag value.
 * @returns {boolean} - True if the current line is on a block comment, false otherwise.
 */
function updateFlagIsBlockComment(lineText, isBlockComment) {
    
    // If the line contains both /* and */, it means that the block comment is finished
    if (lineText.includes("/*") && lineText.includes("*/")) {
        isBlockComment = true;
    }

    // If the line contains /* but not */, it means that the block comment is not finished
    if (lineText.includes("/*") && !lineText.includes("*/")) {
        isBlockComment = true;
    }

    // If the line contains */ but not /*, it means that the block comment is finished
    if (!lineText.includes("/*") && lineText.includes("*/")) {
        isBlockComment = false;
    }

    return isBlockComment;
}

module.exports = {
    isCommentLine,
    updateFlagIsBlockComment,
};