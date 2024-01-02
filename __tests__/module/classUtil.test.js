const myModule = require('../../src/utils/classUtil');
const { expect } = require('@jest/globals');
const vscode = require('vscode');


describe("classUtil Tests", () => {
    test("getClassName", async () => {
        
        const pathHello = vscode.Uri.file("../test-data/classUtil_test_data/Hello.h");
        const pathHello2 = vscode.Uri.file("../test-data/classUtil_test_data/Hello2.h");
        const pathWorld = vscode.Uri.file("../test-data/classUtil_test_data/World.h");
        const pathEmpty = vscode.Uri.file("../test-data/classUtil_test_data/Empty.h");
        const pathEmpty2 = vscode.Uri.file("../test-data/classUtil_test_data/Empty2.h");

        
        const docHello = await vscode.workspace.openTextDocument(pathHello);
        const docHello2 = await vscode.workspace.openTextDocument(pathHello2);
        const docWorld = await vscode.workspace.openTextDocument(pathWorld);
        const docEmpty = await vscode.workspace.openTextDocument(pathEmpty);
        const docEmpty2 = await vscode.workspace.openTextDocument(pathEmpty2);

        expect(myModule.getClassName(docHello)).toBe("Hello");
        expect(myModule.getClassName(docHello2)).toBe("Hello");
        expect(myModule.getClassName(docWorld)).toBe("World");
        expect(myModule.getClassName(docEmpty)).toBe("");
        expect(myModule.getClassName(docEmpty2)).toBe("");

    });
});
