import * as vscode from 'vscode';

export type RobotTypes = 
"MZ07-01" |
"MZ01-01" |
"MZ12-01" |
"MZ25-01";

const configKeys = {
    robotIp: {
        key: "Robot ip address",
        default: "127.0.0.1",
    },
    ftpWorkDir: {
        key: "FTP work directory path",
        default: "WORK",
    },
    ftpUserName: {
        key: "FTP user name",
        default: "Anonymous",
    },
    ftpPassword: {
        key: "FTP password",
        default: "",
    },
    robotType: {
        key: "Robot type",
        default: "MZ07-01" as RobotTypes,
    }
}

export default class ExtensionSettings {
    constructor() {
        this.settings = vscode.workspace.getConfiguration("nrl-settings");
    }

    private settings: vscode.WorkspaceConfiguration;
     
    public get robotIp() : string {
        return this.settings.get(configKeys.robotIp.key, configKeys.robotIp.default);
    }
    public set robotIp(v: string) {
        this.settings.update(configKeys.robotIp.key, v);
    }
    
    public get ftpWorkDir() : string {
        return this.settings.get(configKeys.ftpWorkDir.key, configKeys.ftpWorkDir.default);
    }
    public set ftpWorkDir(v: string) {
        this.settings.update(configKeys.ftpWorkDir.key, v);
    }
    
    public get ftpUserName() : string {
        return this.settings.get(configKeys.ftpUserName.key, configKeys.ftpUserName.default);
    }
    public set ftpUserName(v: string) {
        this.settings.update(configKeys.ftpUserName.key, v);
    }

    public get ftpPassword() : string {
        return this.settings.get(configKeys.ftpPassword.key, configKeys.ftpPassword.default);
    }
    public set ftpPassword(v: string) {
        this.settings.update(configKeys.ftpPassword.key, v);
    }

    public get robotType() : RobotTypes {
        return this.settings.get(configKeys.robotType.key, configKeys.robotType.default);
    }
    public set robotType(v: RobotTypes) {
        this.settings.update(configKeys.robotType.key, v);
    }
    
    // public ftpDir: string;
}