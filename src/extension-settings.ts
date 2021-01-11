import * as vscode from 'vscode';

export type RobotTypes = 
"MZ07-01" |
"MZ01-01" |
"MZ12-01" |
"MZ25-01";

export class ExtensionSettings {
    constructor() {
        const settings = vscode.workspace.getConfiguration("nrl-settings");
    }

    public targetIp: string;
    public ftpDir: string;
}