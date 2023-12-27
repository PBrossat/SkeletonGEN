const vscode = require("vscode");
const { workspace } = vscode;
const { TextEncoder } = require("util");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log('Congratulations, your extension "skeletongen" is now active!');

  let disposable = vscode.commands.registerCommand(
    "skeletongen.SkeletonGEN",
    function () {
      // The code you place here will be executed every time your command is executed

      // Display a message box to the user
      vscode.window.showInformationMessage("SkeletonGEN!");

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

      // Get the name of the file without extension
      const pathNewFile = editor.document.fileName.replace(/\.[^/.]+$/, ""); // To be sure that the new file will be created in the same folder

      const nameFile = pathNewFile.split("/").pop(); // Name of the file without the all path

      // Create a new file .cpp with the same name and the correct extension (.cpp)
      const newCppFilePath = vscode.Uri.file(`${pathNewFile}.cpp`);

      // Create the skeleton of the file
      const cppFileContent = createSkeleton(
        editor.document,
        nameFile,
        getClassName(editor.document),
        getAllMethodsWithSignature(editor.document)
      );

      // Create a new file .cpp with the same name and the correct extension (.cpp)
      workspace.fs.writeFile(
        newCppFilePath,
        new TextEncoder().encode(cppFileContent)
      );
    }
  );

  context.subscriptions.push(disposable);
}

function getClassName(file) {
  const fileContent = file.getText();
  const className = fileContent.match(/class\s+([a-zA-Z0-9_]+)/)[1]; // class [space] name
  return className;
}

// Find all the methods with any return type (don't work with void)
function getAllMethodsWithSignature(file) {
  const fileContent = file.getText();

  const methods = fileContent.match(
    /\b\s*(?:inline\s+)?\s*[a-zA-Z0-9_]+\s+[a-zA-Z0-9_]+\s*\([^\)]*\)/g
  ); // [return type] [method name] ([parameters])

  const result = [];

  // Create a template array with : return type, method name, parameters
  for (let i = 0; i < methods.length; i++) {
    // If the method is inline, skip it
    if (/\binline\b/.test(methods[i])) {
      continue;
    }
    const returnType = methods[i].match(/[a-zA-Z0-9_]+/)[0]; // get the return type
    const methodName = methods[i].split(" ")[1].split("(")[0]; // get the method name
    const parameters = methods[i].match(/\([^\)]*\)/)[0]; // get the parameters (if exist)

    result.push({
      returnType,
      methodName,
      parameters,
    });
  }

  return result;
}

function haveConstructor(file) {
  const fileContent = file.getText();
  const constructorMatch = fileContent.match(/([a-zA-Z0-9_]+)\s*\(\s*\)/); // [name] ()

  return constructorMatch !== null;
}

function haveDestructor(file) {
  const fileContent = file.getText();
  const destructorMatch = fileContent.match(/~([a-zA-Z0-9_]+)\s*\(\s*\)/); // ~[name] ()

  return destructorMatch !== null;
}

function createSkeleton(file, nameFile, className, methods) {
  let skeleton = "";

  skeleton += `#include "${nameFile}.h"\n #include <iostream>\nusing namespace std;\n\n`;

  // Create the constructor
  if (haveConstructor(file)) {
    skeleton += `${className}::${className}() {\n\n}\n\n`;
  }

  // Create the destructor
  if (haveDestructor(file)) {
    skeleton += `${className}::~${className}() {\n\n}\n\n`;
    console.log("je suis ici");
  }

  // Create all the methods
  for (let i = 0; i < methods.length; i++) {
    const { returnType, methodName, parameters } = methods[i];

    skeleton += `${returnType} ${className}::${methodName}${parameters} {
        "TODO: Implement the method";
      }\n\n`;
  }

  return skeleton;
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
