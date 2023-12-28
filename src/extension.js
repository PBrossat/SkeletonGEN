const vscode = require("vscode");
const { workspace } = vscode;
const { TextEncoder } = require("util");

// Import all the functions
const { createSkeleton } = require("./skeleton");
const {
  getAllMethodsWithSignature,
  getClassName,
} = require("./Methods");

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

      // Display a message box to the user
      vscode.window.showInformationMessage("Your .cpp file is ready !");

      const pathNewFile = editor.document.fileName.replace(/\.[^/.]+$/, ""); // To be sure that the new file will be created in the same folder

      // Get the name of the file without extension
      const nameFile = pathNewFile.split("/").pop(); // Name of the file without the all path

      // Create a new file .cpp with the same name and the correct extension (.cpp)
      const cppFile = vscode.Uri.file(`${pathNewFile}.cpp`);

      const fileHeader = editor.document; // the Header file (.h)

      let fileDefinition;
      try {
        fileDefinition = await vscode.workspace.openTextDocument(cppFile);
      } catch (error) {
        // Handle errors, e.g., the file doesn't exist yet
        console.error(error.message);
        return;
      }

      // Create the skeleton of the file
      const cppFileContent = createSkeleton(
        fileHeader,
        fileDefinition,
        nameFile,
        getClassName(fileHeader),
        getAllMethodsWithSignature(fileHeader)
      );

      // Write the skeleton in the new file
      workspace.fs.writeFile(cppFile, new TextEncoder().encode(cppFileContent));
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
