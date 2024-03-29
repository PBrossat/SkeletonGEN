const vscode = require("vscode");
const { workspace, window } = vscode;
const { TextEncoder } = require("util");

// Import all the functions
const { createSkeleton } = require("./skeleton");
const { getAllMethodsWithSignature } = require("./methods");
const { getAllConstructorWithParameters } = require("./constructorParam");
const { getClassName } = require("./utils/classUtil");
const { getOperatorOveloading } = require("./operator");

// TODO: Add icon to the extension
// (TODO: Jest test for the extension (all the functions))
// (TODO: When change signature of a method, change the signature in the .cpp file (if the method already exists))
// TODO: Gest the operator surcharges
// TODO: Gest method with key word const on left part of sinature

/**
 * This method is called when the extension is activated.
 *
 * @param {vscode.ExtensionContext} context - The context of the extension.
 */
function activate(context) {
  // Create a status bar item
  const statusBarItem = window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  ); // 100 is the most right position

  // Set the text of the status bar item
  statusBarItem.text = "$(icon-skeletongen) SkeletonGEN"; // TODO Fixe
  statusBarItem.command = "skeletongen.SkeletonGEN";
  statusBarItem.tooltip = "Generate the skeleton of the .cpp file";
  statusBarItem.show(); // Show the status bar item

  let disposable = vscode.commands.registerCommand(
    "skeletongen.SkeletonGEN",
    async function () {
      // The code you place here will be executed every time your command is executed

      // Get the active text editor
      const editor = window.activeTextEditor;

      if (!editor) {
        window.showInformationMessage("No editor is active.");
        return;
      }

      // Get the extension of the file open in the editor
      const fileExtension = editor.document.fileName.split(".").pop();

      // If the extension is not .h, show an error message
      if (fileExtension !== "h") {
        window.showErrorMessage("The file extension is not .h");
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
          window.showInformationMessage("The .cpp file has been created");
        } catch (error) {
          window.showErrorMessage("Error creating .cpp file:", error.message);
          return;
        }
      }

      const fileHeader = editor.document; // the Header file (.h)

      let fileDefinition;
      try {
        fileDefinition = await vscode.workspace.openTextDocument(cppFile);
      } catch (error) {
        // Handle errors, e.g., the file doesn't exist yet
        window.showErrorMessage("Error opening .cpp file :", error.message);
        return;
      }

      // Create the skeleton of the file
      const cppFileContent = createSkeleton(
        fileHeader,
        fileDefinition,
        nameFile,
        getClassName(fileHeader),
        getAllMethodsWithSignature(fileHeader, getClassName(fileHeader)), // Get all the methods of the class
        getAllConstructorWithParameters(fileHeader, getClassName(fileHeader)) // Get all the constructors with parameters of the class
      );

      // Write the skeleton in the new file
      try {
        await workspace.fs.writeFile(
          cppFile,
          new TextEncoder().encode(cppFileContent)
        );
      } catch (error) {
        window.showErrorMessage("Error writing in .cpp file :", error.message);
        return;
      }

      // Display a succes message box to the user
      window.showInformationMessage("Your .cpp file is ready !");
    }
  );

  context.subscriptions.push(disposable);
}

module.exports = {
  activate,
};
