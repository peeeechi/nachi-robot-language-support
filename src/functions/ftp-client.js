const ftp = require('ftp');
const fs = require('fs');

const client = new ftp();

const serverIp          = "192.168.1.1";
const serverPort        = 21;
const userName          = "Anonymous";
const password          = "";

// const ftpDir       = `ftp://${serverIp}\\WORK\\PROGRAM`;
const ftpDir       = `WORK/PROGRAM`;

const programPrefix = "MZ07-01";
const readProgramNo     = 6102;
const readFileName      = `${programPrefix}-A.${readProgramNo}`;

const sendFileName = "MZ07-01-A.6103";



client.connect({
    host: serverIp,
    port: serverPort,
    user: userName,
    password: password,
    // connTimeout: 2000,
});

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
    
    
    // file 送信
    // client.put(sendFileName, `${ftpDir}/${sendFileName}`, (error) => {
    //     if (error) {
    //         throw error;
    //     }
    //     client.end();
    //     console.log('done.');
    // });
});