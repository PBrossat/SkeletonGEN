# SkeletonGen

SkeletonGen est une extension pour Visual Studio Code qui vous permet de générer le squelette d'un fichier .cpp à partir d'un fichier .h en un seul clic.

## Principe
Lorsque vous travaillez sur un projet en C++, vous pouvez souvent trouver des situations où vous avez besoin de créer un fichier d'en-tête (.h) et son implémentation associée (.cpp). 
Avec SkeletonGen, ce processus fastidieux est simplifié. Il vous suffit d'ouvrir votre fichier .h dans Visual Studio Code, puis d'utiliser l'extension pour générer automatiquement le squelette du fichier .cpp correspondant, en incluant les déclarations de fonctions et de classes.

## Installation
Pour utiliser SkeletonGen, suivez ces étapes simples :

Clonez le projet depuis GitHub en utilisant la commande suivante :

bash
Copy code

`
https://github.com/PBrossat/SkeletonGEN.git 
`

Ouvrez Visual Studio Code et accédez à l'onglet des extensions.

Cliquez sur le bouton ... (plus d'options) dans le coin supérieur droit, puis sélectionnez Installer depuis un fichier VSIX.

Sélectionnez le fichier package_skeletonGen.vsix dans le répertoire du projet SkeletonGen que vous avez cloné précédemment.

Dans le cas où vous implémenter de nouvelles fonctionnalités, vous pouvez créer votre propre fichier vsix en suivant ces deux étapes :

### installation de vsce :

`
npm install -g vsce
`

### création du fichier vsix dans le répertoire courrant:


`
vsce package
`

L'extension SkeletonGen est maintenant installée et prête à être utilisée !

## Utilisation
Une fois l'extension installée, suivez ces étapes pour générer le squelette d'un fichier .cpp à partir d'un fichier .h :

Ouvrez le fichier .h pour lequel vous souhaitez générer le squelette du fichier .cpp dans Visual Studio Code (un exemple est fourni dans le répertoire test pour que vous puissez tester avec).

Utilisez la commande de votre choix pour lancer SkeletonGen. Vous pouvez le faire via le menu contextuel, le raccourci clavier associé ou en utilisant la palette de commandes de Visual Studio Code.

SkeletonGen analysera le fichier .h et générera automatiquement le squelette du fichier .cpp correspondant dans le même répertoire.

Vous pouvez maintenant ouvrir le fichier .cpp nouvellement généré et commencer à implémenter les fonctions et les méthodes nécessaires.


## Limitations

Veuillez noter que la fonction permettant de générer les surcharges d'opérateurs n'est pas encore pleinement fonctionnelle.
Aussi, le logo de l'extension ne s'affiche pas comme je le souhaite dans la barre d'outil de vscode.
En attendant, nous vous remercions de votre patience et vous encourageons à utiliser les autres fonctionnalités de l'extension qui marchent bel et bien.

