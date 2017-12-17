
//Khai báo thư viện io
var socket=io("/"); 
 // var d = new Date();
 // var t = d.getTime();

//Phòng Hiện tại

var pass="qwerty@123";
var stt;
flag_connESP=false;
$(document).ready(function(){

	$("#Led1_Sw").change(function(){
		stt="OFF";
		if(this.checked){
			stt="ON";
		}
		socket.emit("Client-Send-Server-Led-Status",{Header:{Name:"WEB",Device:"Led1"},Content:stt});

		
		$("#Led1_Status").html("<h3>"+stt+"</h3>");

	});

	$("#Led2_Sw").change(function(){
		stt="OFF";
		if(this.checked){
			stt="ON";
		}
		socket.emit("Client-Send-Server-Led-Status",{Header:{Name:"WEB",Device:"Led2"},Content:stt});
		$("#Led2_Status").html("<h3>"+stt+"</h3>");

	});

});
socket.emit("Client-Send-Get-DeviceName",{Name:"WEB",Pass:pass});

/*
socket.on("Server-Send-Get-WebName",function(){
	socket.emit("Client-Send-Get-DeviceName",{Name:"WEB",Pass:pass});
});
*/

//Kết nối đến Thiết bị ESP8266
socket.on("Server-Send-Client-ESP-Status",function(data){
	if(data=="ON"){
		//alert("ESP ONLINE");
		$("#deviceStatus").html("<h3>Thông tin thiết bị: Đã kết nối</h3>");
		$("#devicecCheckbox").prop('checked', true);
	}
	else{
		//alert("ESP Mất kết nối");
		$("#deviceStatus").html("<h3>Thông tin thiết bị: Mất kết nối</h3>");
		$("#devicecCheckbox").prop('checked', false);

	}

//Lấy thông tin nhiệt độ, độ ẩm
socket.on("Server-Send-Client-Sensor-Status",function(data){
	//alert(data.Temperature);
$("#TempStatus").html(data.Temperature);
$("#HumStatus").html(data.Humidity);

});


socket.on("Server-Send-Client-ESP-Led-Status",function(data){
	//var obj = JSON.parse(data);
	//alert(data["Led1"]);
	//alert(data["Led2"]);
	stt_off="OFF";
	stt_on="ON";
	if(data["Led1"]==stt_off){
		$("#Led1_Status").html("<h3>"+stt_off+"</h3>");
		$("#Led1_Sw").prop('checked', false);
	}
	else{
		$("#Led1_Status").html("<h3>"+stt_on+"</h3>");
		$("#Led1_Sw").prop('checked', true);
	}

	if(data["Led2"]==stt_off){
		$("#Led2_Status").html("<h3>"+stt_off+"</h3>");
		$("#Led2_Sw").prop('checked', false);
	}
	else{

		$("#Led2_Status").html("<h3>"+stt_on+"</h3>");
		$("#Led2_Sw").prop('checked', true);
	}


		//$("#deviceStatus").html("<h3>Thông tin thiết bị: Đã kết nối</h3>");
		//$("#devicecCheckbox").prop('checked', true);
	});

});



//io.sockets.emit: Send all socket
//socket.broadcast.emit: broadcast all socket
//socket.emit: self socket
//io.to("socketid").emit() : from socket to socket 