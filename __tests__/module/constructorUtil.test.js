const myModule = require('../../src/utils/constructorUtil');
const { expect } = require('@jest/globals');

describe("constructorUtil Tests", () => {
    test("containsClassNameFollowedByParenthesis", () => {
        // True cases
        expect(myModule.containsClassNameFOllowedByParenthesis("MyClass();", "MyClass")).toBe(true);
        expect(myModule.containsClassNameFOllowedByParenthesis("MyClass   ();", "MyClass")).toBe(true);
        expect(myModule.containsClassNameFOllowedByParenthesis(" new MyClass   ();", "MyClass")).toBe(true);
        expect(myModule.containsClassNameFOllowedByParenthesis("~MyClass();", "MyClass")).toBe(true);
    
        // False cases
        expect(myModule.containsClassNameFOllowedByParenthesis("MyClass(int a, int b);", "MyClass")).toBe(false); // false because the constructor has parameters
        expect(myModule.containsClassNameFOllowedByParenthesis("~MyClass();", "OtherClass")).toBe(false); // false because the class name is not the same
        expect(myModule.containsClassNameFOllowedByParenthesis("~ MyClass();", "OtherClass")).toBe(false);
        expect(myModule.containsClassNameFOllowedByParenthesis("~ MyClass();", "MyClass ")).toBe(false);
        expect(myModule.containsClassNameFOllowedByParenthesis("~ MyClass();", "MyClass()")).toBe(false); // false because the class name contains other than letters
    });
    

});