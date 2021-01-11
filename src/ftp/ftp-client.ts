import * as ftp from 'ftp';
import * as fs from 'fs';


const client            = new ftp();
const serverIp          = "192.168.1.1";
const serverPort        = 21;
const userName          = "Anonymous";
const password          = "";

const ftpDir       = `WORK/PROGRAM`;

const programPrefix = "MZ07-01";
const readProgramNo     = 6102;
const readFileName      = `${programPrefix}-A.${readProgramNo}`;

const sendFileName = "MZ07-01-A.6103";

/**
 * send the file using ftp
 * @param option ftp options
 * @param sendFileSrcPath source file path
 * @param destFilePath destination file path
 */
export async function sendFileFTP(option: ftp.Options, sendFileSrcPath: string, destFilePath: string) {
    
    return new Promise<void>((resolve: () => void, hasError: (e: Error) => void) => {
        
        client.connect(option);
        client.on("ready", () => {
            client.put(sendFileName, `${ftpDir}/${sendFileName}`, (error) => {
                client.end();
                
                if (error) {
                    hasError(error);
                }
                else {
                    resolve();
                }
            });        
        });
    });
}

/**
 * get the file using ftp
 * @param option 
 * @param getFilePath 
 * @param saveFilePath 
 */
export async function receiveFileFTP(option: ftp.Options, getFilePath: string, saveFilePath: string) {

    return new Promise<void>((resolve: () => void, hasError: (e: Error) => void) => {
        client.connect(option);
        client.on("ready", () => {
            client.get(getFilePath, (err, stream) => {
                if (err) {
                    client.end();
                    hasError(err);
                }
                stream.once('close', function() {client.end();});
                stream.pipe(fs.createWriteStream(saveFilePath));

                resolve();
            });
        });
    });
}

/**
 * get the dirctory info using ftp
 * @param option 
 * @param dirName 
 */
export async function lsWithFTP(option: ftp.Options, dirName: string) {
    return new Promise<ftp.ListingElement[]>((resolve, hasError) => {

        client.connect(option);
        client.on("ready", () => {
            client.list(dirName, (err, list) => {

                client.end();
                if (err) {
                    hasError(err);
                } else {
                    resolve(list);
                }
            })
        })
    });
}





console.log(`connect to ${serverIp}:${serverPort}`);

client.on("ready", () => {

    client.list(ftpDir, (err, ls) => {
        console.dir(ls.map(v => v.name));
    });
    

    // file 取得
    client.get(`${ftpDir}/${programPrefix}-A.${readProgramNo}`, (err, stream) => {
        if (err) {
            throw err;
        }
        stream.once('close', function() {client.end();});
        stream.pipe(fs.createWriteStream(`./${readFileName}`));

        console.log('done.');
    });
    
    
    
});