const serialport = require("serialport");

// serialport.list((err, ports) => {
//     ports.forEach(port => {
//         console.log(port);
//     });
// })

(async () => {
  var plist = await serialport.list();

  plist.forEach(port => {

    if (port.vendorId != null) {
      console.log(port.path);

    }
  });
})();