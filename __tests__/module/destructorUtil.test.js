const myModule = require('../../src/utils/destructorUtil');
const { expect } = require('@jest/globals');

describe("destructorUtil Tests", () => {
    test("containsTildeFollowedByClassName", () => {
        // True cases
        expect(myModule.containsTildeFollowedByClassName("~ MyClass()", "MyClass")).toBe(true);
        expect(myModule.containsTildeFollowedByClassName("~   MyClass  ()", "MyClass")).toBe(true);
        expect(myModule.containsTildeFollowedByClassName("~ MyClass  (  )", "MyClass")).toBe(true);
        expect(myModule.containsTildeFollowedByClassName("~MyClass()", "MyClass")).toBe(true);

        // False cases
        expect(myModule.containsTildeFollowedByClassName("~MyClass()", "OtherClass")).toBe(false);
        expect(myModule.containsTildeFollowedByClassName("~ MyClass()", "OtherClass")).toBe(false);
        expect(myModule.containsTildeFollowedByClassName("~ MyClass()", "MyClass ")).toBe(false); 
        expect(myModule.containsTildeFollowedByClassName("~ MyClass()", "MyClass()")).toBe(false); // false because the class name contains other than letters
    });
});