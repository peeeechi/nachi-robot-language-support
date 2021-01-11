import * as vscode from 'vscode';
import * as path from 'path';


export async function getFiles() {
    vscode.window.showInformationMessage(vscode.workspace.name!);
    vscode.window.showInformationMessage(vscode.workspace.rootPath!);
    vscode.window.showInformationMessage(vscode.window.activeTextEditor?.document!.fileName!);
    vscode.window.showInformationMessage(path.basename(vscode.window.activeTextEditor?.document!.fileName!));
    vscode.window.showInformationMessage(path.dirname(vscode.window.activeTextEditor?.document!.fileName!));
    vscode.window.showInformationMessage(path.extname(vscode.window.activeTextEditor?.document!.fileName!));


    let select = await vscode.window.showQuickPick(["file", "select", "list"], {
        canPickMany: false,
        placeHolder: 'place holder',
    });

    if(select) vscode.window.showInformationMessage(select);
    
    let selects = await vscode.window.showOpenDialog({
        title: "test title",
        canSelectMany: false,
        openLabel: "open label 1"
    });
    
    if(selects) vscode.window.showInformationMessage( selects[0].fsPath );
}