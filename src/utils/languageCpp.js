const reservedWords = [
  "void",
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
];

function isReservedWord(word) {
  return reservedWords.includes(word);
}

module.exports = {
  isReservedWord,
};
