/**
 * UDP Server Sample
 */

// import * as dgram from "dgram";
const dgram = require("dgram");

const porta = 3000;
//const hostA = "192.168.1.10";
const hostA = "127.0.0.1";

const data = [...Array(30)].map((v, i) => `data_${i}`).join(',');

const socket = dgram.createSocket("udp4");

socket.on("listening", () => {
  const address = socket.address();
  console.log(
    "UDP socket listening on " + address.address + ":" + address.port
  );
});

socket.on("message", (message, remote) => {
  console.log(remote.address + ":" + remote.port + " - " + message);


  socket.send(
    // "res: " + message,
    // message,
    data,
    0,
    // message.length,
    data.length,
    remote.port,
    remote.address,
    (err, bytes) => {
      if (err) {
        throw err;
      }

      console.log("bytes: ", bytes);
    }
  );
});

socket.bind(porta, hostA, () => {
  console.log("binded");
});

// socket.send("start", 5000, '192.168.1.1', (err, bytes) => {
//   if (err) {
//     console.error(err);
//   }
//   console.log(`send bytes: ${bytes}`);
// });