const vscode = require("vscode");
const { workspace } = vscode;
const { TextEncoder } = require("util");

// Import all the functions
const { createSkeleton } = require("./skeleton");
const { getAllMethodsWithSignature } = require("./Methods");
const { getAllConstructorWithParameters } = require("./constructor");
const { getClassName } = require("./utils/classUtil");




// TODO : Add icon to the extension
// TODO : Jest test for the extension (all the functions)
// TODO : When change signature of a method, change the signature in the .cpp file (if the method already exists)

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "skeletongen.SkeletonGEN",
    async function () {
      // The code you place here will be executed every time your command is executed

      // Get the active text editor
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        vscode.window.showInformationMessage("No editor is active.");
        return;
      }

      // Get the extension of the file open in the editor
      const fileExtension = editor.document.fileName.split(".").pop();

      // If the extension is not .h, show an error message
      if (fileExtension !== "h") {
        vscode.window.showErrorMessage("The file extension is not .h");
        return;
      }

      const pathNewFile = editor.document.fileName.replace(/\.[^/.]+$/, ""); // To be sure that the new file will be created in the same folder

      // Get the name of the file without extension
      const nameFile = pathNewFile.split("/").pop(); // Name of the file without the all path

      // Create a new file .cpp with the same name and the correct extension (.cpp)
      const cppFile = vscode.Uri.file(`${pathNewFile}.cpp`);

      // Check if the .cpp file already exists
      let cppFileExists = false;
      try {
        await workspace.fs.readFile(cppFile);
        cppFileExists = true;
      } catch (error) {
        // If an error occurs, the file doesn't exist
        cppFileExists = false;
      }

      // If the .cpp file doesn't exist, create it
      if (!cppFileExists) {
        try {
          await workspace.fs.writeFile(cppFile, new Uint8Array());
          vscode.window.showInformationMessage("The .cpp file has been created");
        } catch (error) {
          vscode.window.showErrorMessage("Error creating .cpp file:", error.message);
          return;
        }
      }


      const fileHeader = editor.document; // the Header file (.h)

      let fileDefinition;
      try {
        fileDefinition = await vscode.workspace.openTextDocument(cppFile);
      } catch (error) {
        // Handle errors, e.g., the file doesn't exist yet
        vscode.window.showErrorMessage("Error opening .cpp file :", error.message);
        return;
      }

      // Create the skeleton of the file
      const cppFileContent = createSkeleton(
        fileHeader,
        fileDefinition,
        nameFile,
        getClassName(fileHeader),
        getAllMethodsWithSignature(fileHeader), // Get all the methods of the class
        getAllConstructorWithParameters(fileHeader, getClassName(fileHeader)) // Get all the constructors with parameters of the class
      );

      
      // Write the skeleton in the new file
      try {
        await workspace.fs.writeFile(cppFile, new TextEncoder().encode(cppFileContent));
      }
      catch (error) {
        vscode.window.showErrorMessage("Error writing in .cpp file :", error.message);
        return;
      }

      // Display a succes message box to the user
      vscode.window.showInformationMessage("Your .cpp file is ready !");
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
