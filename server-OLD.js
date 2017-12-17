//Làm việc với MySQL
var x=require('./sql.js')

var express = require('express');//Importing Express
var app = express();//Getting App From Express
var fs = require('fs');//Importing File System Module To Access Files
const port = 81;//Creating A Constant For Providing The Port
//Routing Request : http://localhost:port/
app.get('/',function(request,response){
  //Telling Browser That The File Provided Is A HTML File
  response.writeHead(200,{"Content-Type":"text/html"});
  //Passing HTML To Browser
  response.write(fs.readFileSync("./trangchu.html"));
  //Ending Response
  response.end();
})

//Xử lý database

function getDeviceConfig(){
 x.getDeviceConfig(function(content) {
   console.log("---------------Get Config from DB");
   io.to(roomWEB).emit("Server-Send-Client-DeviceConfig",content);
   console.log(content);
}
});



//Khai báo thư mục toàn cục
app.use(express.static("./public"));
var server =require("http").Server(app);
var io = require("socket.io")(server);
var result=0;
server.listen(process.env.PORT || port);


console.log("Server listening at port: "+ port);

//Nhận : Kết nối socket mới
io.on("connection", function (socket){
  console.log(" New connection: "+socket.id);

  //Nhận : Đăng xuất
  socket.on("disconnect",function(){
        console.log("disconnect: "+socket.id);
    });

});
//io.sockets.emit: Send all socket
//socket.broadcast.emit: broadcast all socket
//socket.emit: self socket
//io.to("socketid").emit() : from socket to socket
