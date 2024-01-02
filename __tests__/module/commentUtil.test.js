const myModule = require('../../src/utils/commentUtil');
const { expect } = require('@jest/globals');


describe("commentUtil Tests", () => {
    test("isCommentLine", () => {
        // True cases
        expect(myModule.isCommentLine("//")).toBe(true);
        expect(myModule.isCommentLine("//Hello world")).toBe(true);
        expect(myModule.isCommentLine("// Hello world")).toBe(true);
        expect(myModule.isCommentLine(" //Hello world")).toBe(true);
        expect(myModule.isCommentLine(" // Hello world")).toBe(true);
        expect(myModule.isCommentLine(" // ")).toBe(true);

        // False cases
        expect(myModule.isCommentLine("")).toBe(false);
        expect(myModule.isCommentLine("/")).toBe(false);
        expect(myModule.isCommentLine("Hello world")).toBe(false);
        expect(myModule.isCommentLine(" Hello world")).toBe(false);
        expect(myModule.isCommentLine(" Hello world //")).toBe(false);
    });

    test("updateFlagIsBlockComment", () => {
        // True cases
        expect(myModule.updateFlagIsBlockComment("/*", false)).toBe(true);
        expect(myModule.updateFlagIsBlockComment(" /*", false)).toBe(true);
        expect(myModule.updateFlagIsBlockComment(" /*", true)).toBe(true);
        expect(myModule.updateFlagIsBlockComment("", true)).toBe(true);
        expect(myModule.updateFlagIsBlockComment("Hello world", true)).toBe(true);
        expect(myModule.updateFlagIsBlockComment("/* hello world */", false)).toBe(true);
        expect(myModule.updateFlagIsBlockComment(" /* hello world */", false)).toBe(true);
        expect(myModule.updateFlagIsBlockComment(" /* hello /* */ ", false)).toBe(true);

        // False cases
        expect(myModule.updateFlagIsBlockComment("", false)).toBe(false);
        expect(myModule.updateFlagIsBlockComment("*/", true)).toBe(false);
        expect(myModule.updateFlagIsBlockComment("Hello world", false)).toBe(false);
        expect(myModule.updateFlagIsBlockComment("world */", true)).toBe(false);

    });
});
  
