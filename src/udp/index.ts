import * as dgram from 'dgram';




export function executeRemoteCompile(programNo: number, remoteIp: string, remotePort:number) {
    const socket = dgram.createSocket("udp4");

    socket.on("message", (message, remote) => {
        console.log(remote.address + ":" + remote.port + " - " + message);

        
        
    });
    
    
    socket.bind();

    const sendData = Uint8Array.from([]);
    
    const offset = 0;

    
    socket.send(sendData, 0, sendData.length, remotePort, remoteIp, (err, bytes) => {
        if (err) throw err;
    });

    socket.on("message", (resData: Buffer, remote: dgram.RemoteInfo) => {

    });

    socket.on("close", (resData: Buffer, remote: dgram.RemoteInfo) => {

    });

}



