const reservedWords = [
  "void",
  "bool",
  "auto",
  "int",
  "char",
  "float",
  "double",
  "short",
  "long",
  "unsigned",
  "signed",
  "const",
  "volatile",
  "inline",
  "virtual",
  "friend",
  "static",
  "*",
  "&",
];

/**
 * Check if the word is a reserved word from C++
 *
 * @param {string} word - The word to check
 * @returns {boolean} - True if the word is a reserved word, false otherwise
 */
function isReservedWord(word) {
  return reservedWords.includes(word);
}

module.exports = {
  isReservedWord,
};
