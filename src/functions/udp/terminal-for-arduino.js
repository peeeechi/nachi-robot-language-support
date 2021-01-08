/**
 * UDP Server Sample
 */

// import * as dgram from "dgram";
const dgram = require("dgram");

const porta = 3000;
const hostA = "192.168.1.30";


var flg = false;
var before = Date.now();
// const hostA = "127.0.0.1";


const socket = dgram.createSocket("udp4");

socket.on("listening", () => {
  const address = socket.address();
  console.log(
    "UDP socket listening on " + address.address + ":" + address.port
  );
});

socket.on("message", (message, remote) => {

  const now = Date.now();


  console.log( now - before + " -- " + remote.address + ":" + remote.port + " - " + message);
  before = now;

  // socket.send(
  //   // "res: " + message,
  //   // message,
  //   data,
  //   0,
  //   // message.length,
  //   data.length,
  //   remote.port,
  //   remote.address,
  //   (err, bytes) => {
  //     if (err) {
  //       throw err;
  //     }

  //     console.log("bytes: ", bytes);
  //   }
  // );
});

socket.bind(porta, hostA, () => {
  console.log("binded");
});

setInterval(() => {
  const sendMessage = flg? "4,e": "3,e";
  flg = !flg;
  socket.send(sendMessage, 8888, '192.168.1.100', (err, bytes) => {
    if (err) {
      console.error(err);
    }
  });
}, 5000);
