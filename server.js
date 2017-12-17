//Làm việc với MySQL
var x=require('./sql.js')


var express = require('express');//Importing Express
var app = express();//Getting App From Express
var fs = require('fs');//Importing File System Module To Access Files
const port = 8000;//Creating A Constant For Providing The Port
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


//Khai báo thư mục toàn cục
app.use(express.static("./public"));
var server =require("http").Server(app);
var io = require("socket.io")(server);
var result=0;
server.listen(process.env.PORT || port);

app.get("/",function(req,res){
res.render("trangchu");
});

console.log("Server listening at port: "+ port);

var flag_ESPConn=false;

//Esp8266 Device
EspName="ESP";
WebName="WEB";
ServerName="SERVER";
ArduinoName="ARDUINO";

roomESP="ESPROOM";
roomWEB="WEBROOM";
roomManager="MANAGER_ROOM";

var mangClient=[];



//Nhận : Kết nối socket mới
io.on("connection", function (socket){
	console.log("New connection: "+socket.id);

		
	//mất kết nối
	socket.on("disconnect",function(){
	console.log("disconnect: "+socket.Name);

	if(socket.Name==EspName){
		console.log("ESP: Leave Room");
		//socket.leave(socket.roomESP);
		//socket.leave(socket.roomManager);
		stt="OFF";
		io.to(roomWEB).emit("Server-Send-Client-ESP-Status",stt);
		socket.leave(roomESP);

	}
	if(socket.Name==WebName){
		console.log("WEB: Leave Room");
		socket.leave(roomWEB);
	}
	});


	//Lấy thông tin thiết bị
	socket.on("Client-Send-Get-DeviceName",function(data){
		if(data.Pass=="qwerty@123"){

			console.log("New Device: "+data.Name);
			socket.Name=data.Name;

			stt="ON";


			//ESP8266 gửi xác thực kết nối
			if(socket.Name==EspName){
				console.log("ESP Connected");

				socket.join(roomESP);
				socket.roomESP=roomESP;
				socket.join(roomManager);

				Log("","","ESP ROOM:",io.sockets.adapter.rooms[roomESP]);

				//CHờ xác nhận từ ESP 8266
				flag_ESPConn=false;
				//Log(ServerName,EspName,"Send Authencation","")
				io.to(roomESP).emit("Server-Send-ESP-Connected-Status",stt);
				setTimeout(sendAuthencationtoESP, 1000);

				if(checkRoom(roomESP)){
					console.log("ESP: ONLINE, SEND TO WEB...");
					io.to(roomWEB).emit("Server-Send-Client-ESP-Status",stt);
				}
			}

			//WEB gửi xác thực kết nối
			else if(socket.Name==WebName){
				console.log("WEB Connected");

				//socket.leave(roomWEB);
				//socket.leave(roomManager);

				socket.join(roomWEB);
				socket.roomWEB=roomWEB;
				socket.join(roomManager);

				//var len = io.sockets.adapter.rooms[roomWEB].length;
				//Log("","","WEB ROOM-",io.sockets.adapter.rooms[roomWEB]);
				//Log("","","Room info: ",io.sockets.adapter.rooms);

				if(checkRoom(roomWEB)){
					if(checkRoom(roomESP)){
						console.log("ESP: ONLINE, SEND TO WEB...");
					}
					else{
						stt="OFF";
						console.log("ESP: OFFLINE, SEND TO WEB...");
					}
					io.to(roomWEB).emit("Server-Send-Client-ESP-Status",stt);
					getDeviceConfig1();


				}

			}
		}
		//Log("","","Room info: ",io.sockets.adapter.rooms);
		//console.log("roomManager: ");	console.log(io.sockets.adapter.rooms[socket.roomManager]);
		//console.log("roomESP: ");		console.log(io.sockets.adapter.rooms[socket.roomESP]);
		//console.log("roomWEB: ");		console.log(io.sockets.adapter.rooms[socket.roomWEB]);
		console.log("Room info: ");
		console.log(io.sockets.adapter.rooms);
	});


//---------------------------------BEGIN:Cấu hình thiết bị & Đồng bộ
//-------Cấu hình Database

	//Database: Lưu Cấu hình Wifi
	socket.on("Client-Send-DBNetworkConfig",function(data){
			Log(WebName,ServerName,"NetworkConfig",data);
			x.setNetworkConfig(data.SSID,data.SSID_Password,data.Server_IP,data.Server_Port);
			//x.updateSensor("33","100");

	});


	//Database: Lưu Cấu hình thời gian cập nhật: Sensor_Freq
	socket.on("Client-Send-DBSensor_FreqConfig",function(data){
			Log(WebName,ServerName,"Sensor_Freq update (minutes)",data);
			x.setSensorFreqConfig(data);
	});


	//Database: Lưu Cấu hình nhiệt độ, độ ẩm -->Relay
	socket.on("Client-Send-DBRelayActive",function(data){
			Log(WebName,ServerName,"RelayActive",data);
			x.setRelayActive(data.Sensor_t,data.Sensor_h);

	});


//-------Cấu hình thiết bị

	//Thiết bị: Lưu Cấu hình Wifi
	socket.on("Client-Send-SynNetworkConfig",function(data){
			Log(WebName,ServerName,"Device SynNetworkConfig",data);
			//Gửi xuống thiết bị
			if(checkRoom(roomESP)){
				io.to(roomESP).emit("Server-Send-ESP-SynNetworkConfig",data);
			}
	});


	//Thiết bị: Lưu Cấu hình thời gian cập nhật: Sensor_Freq
	socket.on("Client-Send-SynSensor_FreqConfig",function(data){
			Log(WebName,ServerName,"Device SynSensor_Freq update (minutes)",data);

			if(checkRoom(roomESP)){
				io.to(roomESP).emit("Server-Send-ESP-SynSensor_FreqConfig",data);
			}
	});


	//Thiết bị: Lưu Cấu hình nhiệt độ, độ ẩm -->Relay
	socket.on("Client-Send-SynRelayActive",function(data){
			Log(WebName,ServerName,"Device SynRelayActive",data);

			if(checkRoom(roomESP)){
				io.to(roomESP).emit("Server-Send-ESP-SynRelayActive",data);
			}			

	});

	//Thiết bị: Kích hoạt Relay
	socket.on("Client-Send-Server-testRelay",function(data){
			Log(WebName,ServerName,"Test Relay",data);

			if(checkRoom(roomESP)){
				io.to(roomESP).emit("Server-Send-ESP-testRelay",data);
			}			

	});

//---------------------------------END: Cấu hình thiết bị & Đồng bộ


	//Database: Client lấy Dữ liệu Sensor
	socket.on("Client-Send-getData",function(data){
			Log(WebName,ServerName,"Getdata",data);
			getdatafromcurrentDateHour1(data);

	});




	//Nhận thông tin Respond Status từ ESP
	socket.on("DeviceRespond",function(data){
			Log(EspName,ServerName,"Device Respond",data);

			if(checkRoom(roomWEB)){
				io.to(roomWEB).emit("DeviceRespond",data);
			}
			else{
				console.log("-->WEB OFFLINE!")
			}

			

	});

	//Nhận thông tin Led Status từ ESP
	socket.on("Adruino-Send-Server-Sensor-Status",function(data){
			Log(ArduinoName,ServerName,"Sensor Status",data);
			x.updateSensor(data.Temperature,data.Humidity);


			if(checkRoom(roomWEB)){
				io.to(roomWEB).emit("Server-Send-Client-Sensor-Status",data);
			}
			else{
				console.log("-->WEB OFFLINE!")
			}

	});


	socket.on("Client-Send-Server-Led-Status",function(data){
			device=data.Header.Device;

			//check(socket.roomESP);

			if(checkRoom(roomWEB)){
				if(checkRoom(roomESP)){
					Log(WebName,ServerName,device,data.Content);
					//Log("","","DUMP ROOM-"+socket.roomESP,io.sockets.adapter.rooms[socket.roomESP]);
					io.to(roomESP).emit("Server-Send-ESP-Led-Status",{Device:device,Status:data.Content});
					io.to(roomESP).emit("Server-Send-ESP-Led-Status",{Device:device,Status:data.Content});
					Log(ServerName,EspName,"Led Status",data.Content);

					//Gửi xác nhận xem ESP đang Hoạt động or NO
					//stt="ON"
					//io.to(roomESP).emit("Server-Send-ESP-Authencation","ON");

				}
				else{
					io.to(roomESP).emit("Server-Send-ESP-Led-Status",{Device:device,Status:data.Content});
					console.log("[ERR]-->ESP:OFFLINE");
				}


			}

	});
});

//Lấy danh sách Device Online
function broadcast_getName(name){
	if(name==""){
		if(mangClient.indexOf(EspName)<0){
			io.sockets.emit("Server-Send-Get-ESPName",EspName);
		}
		if(mangClient.indexOf(WebName)<0){
			io.sockets.emit("Server-Send-Get-WebName",WebName);
		}

	}
	else{
		io.sockets.emit("Server-Send-Get-DeviceName",name);
	}

}

function sendAuthencationtoESP(){
	console.log("Send Authencation to ESP");
	io.to(roomESP).emit("Server-Send-ESP-Connected-Status",stt);
}

//In ra màn hình
function Log(fromDevice,toDevice,Alert,Content){
	if(fromDevice!="" && toDevice!=""){
		console.log("["+fromDevice+" -> "+toDevice+"] - " +Alert);
	}
	else{
		console.log("["+Alert+"]");

	}
	console.log(Content);

}

//Kiểm tra Device
function checkRoom(room) {
	var roomList=io.sockets.adapter.rooms;
	var index = Object.keys(roomList).indexOf(room);
		if(index>0){
			 return true;
		}
    	return false;
}

//io.sockets.emit: Send to all sockets
//socket.broadcast.emit: broadcast to all sockets
//socket.emit: self socket
//io.to("socketid").emit() : from socket to socket


//giải nén chuỗi JSON thành các OBJECT
function ParseJson(jsondata) {
    try {
        return JSON.parse(jsondata);
    } catch (error) {
        return null;
    }
}


//Lấy thông tin Config từ Database
function getDeviceConfig1(){
	console.log("---------------Get Config from DB");

	 x.getDeviceConfig(function(data) {
	   console.log("---------------Get Config from DB");
	   
	   //Gửi tới WEB CLIENT
	   if(data.length){
	   			var json={SSID:data[0].SSID,SSID_Password:data[0].SSID_Password,Server_IP:data[0].Server_IP,Server_Port:data[0].Server_Port,Sensor_Freq:data[0].Sensor_Freq,Sensor_t:data[0].Sensor_t,Sensor_h:data[0].Sensor_h};
	   			console.log(json);
	   		   io.to(roomWEB).emit("Server-Send-Client-DeviceConfig",json);
	   }
	   
	});
}

//Lấy thông tin Sensor data từ Database
function getdatafromcurrentDateHour1(d){
	console.log("---------------Get Sensor data from DB");
	 x.getdatafromcurrentDateHour(d,function(data) {	   
	   //Gửi tới WEB CLIENT
	   if(data.length){
	   			//console.log(data);
	   			var arrData=[];
	   			for (var i =0;i< data.length;i++) {
	   				//var current = new Date(data[i].Time).getHours();
	   				console.log(data[i].Hour+"h - "+data[i].count+"Times - "+(data[i].t/data[i].count).toFixed(1)+" | "+(data[i].h/data[i].count).toFixed(1));
	   				//console.log(data);
	   			}
				io.to(roomWEB).emit("Server-Send-Client-dataSensor",{Type:d,Data:data});
	   				   		   
	   }
	   
	});
}
