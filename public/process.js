
//Khai báo thư viện io
var socket=io.connect("/"); 

var alert_success='<div class="alert alert-success alert-dismissable fade in"> <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> <strong>Success! </strong>';
var alert_warning='<div class="alert alert-warning alert-dismissable fade in">  <a href="#" class="close" id ="x" data-dismiss="alert" aria-label="close">&times;</a>    <strong>Cảnh báo! </strong>';
var alert_danger='<div class="alert alert-danger alert-dismissable fade in">  <a href="#" class="close" id ="x" data-dismiss="alert" aria-label="close">&times;</a>    <strong>Lỗi! </strong>';


var pass="qwerty@123";
var stt;
flag_connESP=false;

//Thông tin cấu hình thiết bị
var SSID=			"";
var SSID_Password=	"";
var Server_IP=		"";
var Server_Port=	"";

// Thông tin Sensor
var Sensor_Freq=	"";
var Sensor_t=		"";
var Sensor_h=		"";


//Loại Thông tin Sensor cần lấy theo Ngày, Giờ
var date=			"Date";
var hour=			"Hour";

$(document).ready(function(){
	openTab("#Control");
	//Tab Cấu hình thiết bị
	$("#btntabSetting").click(function(){
	openTab("#Setting");

	});


	//Tab Điều khiển thiết bị
	$("#btntabControl").click(function(){
		openTab("#Control");
	});


	//Tab Thu thập dữ liệu
	$("#btntabData").click(function(){
		openTab("#Data");
		socket.emit("Client-Send-getData",hour);
		
	});	

	//Tab Thu thập dữ liệu theo giờ
	$("#btnSensorbyTime").click(function(){
		socket.emit("Client-Send-getData",hour);
		
	});	

	//Tab Thu thập dữ liệu theo ngày
	$("#btnSensorbyDate").click(function(){
		socket.emit("Client-Send-getData",date);
		
	});	



	//btn Lưu Cấu hình Wifi :Database
	$("#btnEsp").click(function(){
		$("#alertBtn").html("");

		SSID=				$("#SSID").val();
		SSID_Password=		$("#SSID_Password").val();
		Server_IP=			$("#Server_IP").val();
		Server_Port=		$("#Server_Port").val();
		socket.emit("Client-Send-DBNetworkConfig",{SSID:SSID,SSID_Password:SSID_Password,Server_IP:Server_IP,Server_Port:Server_Port});

		s=alert_success+'Đã lưu cấu hình</div>';
		$("#alertBtn").append(s);
		hideAlert();
	});	
	

	//btn Lưu Cấu hình thời gian cập nhật: Sensor_Freq :Database
	$("#btnSensor").click(function(){
		$("#alertBtn").html("");
		Sensor_Freq=$("#Sensor_Freq").val();
		socket.emit("Client-Send-DBSensor_FreqConfig",Sensor_Freq);


		s=alert_success+'Đã lưu cấu hình</div>';
		$("#alertBtn").append(s);
		hideAlert();
	});	

	//btn Lưu Cấu hình nhiệt độ, độ ẩm -->Relay :Database
	$("#btnRelay").click(function(){
		$("#alertBtn").html("");
		Sensor_t=$("#Sensor_t").val();
		Sensor_h=$("#Sensor_h").val();
		//alert(Sensor_h);
		socket.emit("Client-Send-DBRelayActive",{Sensor_t:Sensor_t,Sensor_h:Sensor_h});


		s=alert_success+'Đã lưu cấu hình</div>';
		$("#alertBtn").append(s);
		hideAlert();
	});	



	//btn Lưu Cấu hình Wifi : thiết bị
	$("#btnEspSyn").click(function(){
		SSID=				$("#SSID").val();
		SSID_Password=		$("#SSID_Password").val();
		Server_IP=			$("#Server_IP").val();
		Server_Port=		$("#Server_Port").val();

		socket.emit("Client-Send-SynNetworkConfig",{SSID:SSID,SSID_Password:SSID_Password,Server_IP:Server_IP,Server_Port:Server_Port});
	});	

	//btn Lưu Cấu hình thời gian cập nhật: Sensor_Freq : thiết bị
	$("#btnSensorSyn").click(function(){
		Sensor_Freq=$("#Sensor_Freq").val();
		socket.emit("Client-Send-SynSensor_FreqConfig",{Sensor_Freq:Sensor_Freq});
	});


	//btn Lưu Cấu hình nhiệt độ, độ ẩm -->Relay :  thiết bị
	$("#btnRelaySyn").click(function(){
		Sensor_t=$("#Sensor_t").val();
		Sensor_h=$("#Sensor_h").val();
		socket.emit("Client-Send-SynRelayActive",{Sensor_t:Sensor_t,Sensor_h:Sensor_h});
	});



	$("#RelayCheckbox").change(function(){
		stt="OFF";
		if(this.checked){
			stt="ON";
		}
		socket.emit("Client-Send-Server-testRelay",{testRelay:stt});
	});





});


//Lấy thông tin từ Database
socket.on("Server-Send-Client-DeviceConfig",function(data){

		//Thông tin Wifi
		$("#SSID").val(data.SSID);
		$("#SSID_Password").val(data.SSID_Password);

		//THông tin Server
		$("#Server_IP").val(data.Server_IP);
		$("#Server_Port").val(data.Server_Port);
		

		$("#Sensor_Freq").val(data.Sensor_Freq);

		$("#Sensor_t").val(data.Sensor_t);
		$("#Sensor_h").val(data.Sensor_h);

});


//Trang thái Kết nối đến Thiết bị ESP8266
socket.on("Server-Send-Client-ESP-Status",function(data){
	if(data=="ON"){
		//alert("ESP ONLINE");
		$("#deviceStatus").html("<h3>Thông tin thiết bị: Đã kết nối</h3>");
		$("#deviceCheckbox").prop('checked', true);

		// Thông báo
		$("#alertBtn").html("");
		s=alert_success+'Thiết bị đã được kết nối</div>';
		$("#alertBtn").append(s);
		hideAlert();
	}
	else{
		//alert("ESP Mất kết nối");
		$("#deviceStatus").html("<h3>Thông tin thiết bị: Mất kết nối</h3>");
		$("#deviceCheckbox").prop('checked', false);
		// Thông báo
		$("#alertBtn").html("");
		s=alert_danger+'Thiết bị mất kết nối</div>';
		$("#alertBtn").append(s);
		hideAlert();
	}
});


//Thiết bị Hồi đáp
socket.on("DeviceRespond",function(data){

	if(data.Data=="Sensor_Freq"){
			// Thông báo
			$("#alertBtn").html("");
			s=alert_success+'Đã đồng bộ thời gian cập nhật</div>';
			$("#alertBtn").append(s);
			hideAlert();
	}
	else if(data.Data=="Sensor_th"){
			$("#alertBtn").html("");
			s=alert_success+'Đã đồng bộ cấu hình Relay</div>';
			$("#alertBtn").append(s);
			hideAlert();
	}
	else if(data.Data=="Esp8266"){
			$("#alertBtn").html("");
			s=alert_success+'Đã đồng bộ Cấu hình Network</div>';
			$("#alertBtn").append(s);
			hideAlert();
	}
	else if(data.Data=="RelayActive"){
			$("#alertBtn").html("");
			$("#RelayCheckbox").prop('checked', true);

			s=alert_warning+'Quạt thông gió đã được kích hoạt tự động</div>';
			$("#alertBtn").append(s);
			hideAlert();
	}
	else if(data.Data=="testRelay"){
			$("#alertBtn").html("");
			stt="";
			if(data.Status=="ON"){
				$("#RelayCheckbox").prop('checked', true);
				stt="Đã bật";
			}
			else if(data.Status=="OFF"){
				stt="Đã Tắt";
				$("#RelayCheckbox").prop('checked', false);
			}

			s=alert_success+'Quạt thông gió'+stt+'</div>';
			$("#alertBtn").append(s);
			hideAlert();
	}
});


//Nhận thông tin nhiệt độ, độ ẩm từ Server
socket.on("Server-Send-Client-Sensor-Status",function(data){
//alert(data.Temperature);


socket.emit("Client-Send-getData",hour);
});



//Gửi dữ liệu Sensor đến client
socket.on("Server-Send-Client-dataSensor",function(data){
	//alert(data.Type);
	if(data.Type=="Hour"){
		func_drawTempChartbyHour(data);
	}

	else if (data.Type=="Date"){
		//func_drawTempChartbyDate(data);

	}
});

//Vẽ biểu đồ nhiệt độ, độ ẩm theo ngày
function func_drawTempChartbyHour(data){
	//alert("Conn");
	
	var HourArray=[];

	//Nhiệt độ theo h
	var DataTempArraybyHour=[];

	//Độ ẩm theo h
	var DataHumiArraybyHour=[];


	var currentHour = new Date().getHours();
	for (var i =0;i<=currentHour;i++) {
		HourArray.push(String(i));
		DataTempArraybyHour.push('0');
		DataHumiArraybyHour.push('0');

	}
	//alert(DataArraybyHour);

	//alert(DataTempArraybyHour);
	//alert(HourArray);


	for (var i =0;i< data.Data.length;i++) {
		var pos=HourArray.indexOf(String(data.Data[i].Hour));
		if(pos>=0){
			DataTempArraybyHour[pos]=String((data.Data[i].t/data.Data[i].count).toFixed(1));
			DataHumiArraybyHour[pos]=String((data.Data[i].h/data.Data[i].count).toFixed(1));
		}

			//alert(data.Data[i].Hour+" - "+data.Data[i].count+"-"+(data.Data[i].t/data.Data[i].count).toFixed(1)+"|"+(data.Data[i].h/data.Data[i].count).toFixed(1));
	}


	$("#ChartbyTime").html("");
	$("#ChartbyTime").html("");

	var drawTempChartbyHour=`
	<script>
	  Highcharts.chart('tempcontainer', {
	    chart: {
	        type: 'line'
	    },
	    title: {
	        text: 'nhiệt độ trung bình theo giờ'
	    },
	    xAxis: {
	        categories: [`+HourArray+`]
	    },
	    yAxis: {
	        title: {
	            text: 'Nhiệt độ (°C)'
	        }
	    },
	    plotOptions: {
	        line: {
	            dataLabels: {
	                enabled: true
	            },
	            enableMouseTracking: false
	        }
	    },
	    series: [{
	        name: ' ',
	        data: [`+DataTempArraybyHour+`]
	    }]
	});
	</script>`;


	var drawHumiChartbyHour=`
	<script>
	  Highcharts.chart('humicontainer', {
	    chart: {
	        type: 'line'
	    },
	    title: {
	        text: 'Độ ẩm không khí trung bình theo giờ'
	    },
	    xAxis: {
	        categories: [`+HourArray+`]
	    },
	    yAxis: {
	        title: {
	            text: 'Độ ẩm (%)'
	        }
	    },
	    plotOptions: {
	        line: {
	            dataLabels: {
	                enabled: true
	            },
	            enableMouseTracking: false
	        }
	    },
	    series: [{
	        name: ' ',
	        data: [`+DataHumiArraybyHour+`]
	    }]
	});
	</script>`;

	$("#ChartbyTime").append(drawTempChartbyHour);
	$("#ChartbyTime").append(drawHumiChartbyHour);
}



//Vẽ biểu đồ nhiệt độ, độ ẩm theo ngày
function func_drawTempChartbyDate(data){
	//alert("Conn");
	
	var DateArray=[];

	//Nhiệt độ theo ngày
	var DataTempArraybyDate=[];

	//Độ ẩm theo ngày
	var DataHumiArraybyDate=[];	


	var currentDate = new Date().getDate();
	for (var i =1;i<=currentHour;i++) {
		currentDate.push(String(i));
		DataTempArraybyDate.push('0');
		DataHumiArraybyDate.push('0');

	}
	//alert(DataArraybyHour);

	//alert(DataTempArraybyHour);
	//alert(HourArray);


	for (var i =0;i< data.Data.length;i++) {
		var pos=DateArray.indexOf(String(data.Data[i].Date));
		if(pos>=0){
			DataTempArraybyHour[pos]=String((data.Data[i].t/data.Data[i].count).toFixed(1));
			DataHumiArraybyHour[pos]=String((data.Data[i].h/data.Data[i].count).toFixed(1));
		}

			//alert(data.Data[i].Hour+" - "+data.Data[i].count+"-"+(data.Data[i].t/data.Data[i].count).toFixed(1)+"|"+(data.Data[i].h/data.Data[i].count).toFixed(1));
	}


	$("#ChartbyTime").html("");
	$("#ChartbyTime").html("");

	var drawTempChartbyHour=`
	<script>
	  Highcharts.chart('tempcontainer', {
	    chart: {
	        type: 'line'
	    },
	    title: {
	        text: 'nhiệt độ trung bình theo giờ'
	    },
	    xAxis: {
	        categories: [`+HourArray+`]
	    },
	    yAxis: {
	        title: {
	            text: 'Nhiệt độ (°C)'
	        }
	    },
	    plotOptions: {
	        line: {
	            dataLabels: {
	                enabled: true
	            },
	            enableMouseTracking: false
	        }
	    },
	    series: [{
	        name: ' ',
	        data: [`+DataTempArraybyHour+`]
	    }]
	});
	</script>`;


	var drawHumiChartbyHour=`
	<script>
	  Highcharts.chart('humicontainer', {
	    chart: {
	        type: 'line'
	    },
	    title: {
	        text: 'Độ ẩm không khí trung bình theo giờ'
	    },
	    xAxis: {
	        categories: [`+HourArray+`]
	    },
	    yAxis: {
	        title: {
	            text: 'Độ ẩm (%)'
	        }
	    },
	    plotOptions: {
	        line: {
	            dataLabels: {
	                enabled: true
	            },
	            enableMouseTracking: false
	        }
	    },
	    series: [{
	        name: ' ',
	        data: [`+DataHumiArraybyHour+`]
	    }]
	});
	</script>`;

	$("#ChartbyTime").append(drawTempChartbyHour);
	$("#ChartbyTime").append(drawHumiChartbyHour);
}





/*
var drawChartbyDate=`
<script>
  Highcharts.chart('humicontainer', {
    chart: {
        type: 'line'
    },
    title: {
        text: 'Độ ẩm không khí trung bình theo giờ'
    },
    xAxis: {
        categories: [`+DateArraybyDate+`]
    },
    yAxis: {
        title: {
            text: 'Độ ẩm (%)'
        }
    },
    plotOptions: {
        line: {
            dataLabels: {
                enabled: true
            },
            enableMouseTracking: false
        }
    },
    series: [{
        name: ' ',
        data: [`+DataArraybyDate+`]
    }]
});
</script>`;

$("#ChartbyTime").append(drawChartbyDate);

*/




socket.emit("Client-Send-Get-DeviceName",{Name:"WEB",Pass:pass});




function hideAlert(){
	window.setTimeout(function() {
		   $(".alert").fadeTo(500, 0).slideUp(500, function(){
		       $(this).remove(); 
		  });
	}, 1000);


}

// Mở nội dung theo Tab
function openTab(data){
	arr=["#Setting","#Control","#Data"];
	for (var i=0;i<arr.length;i++) {

		if(data===arr[i]){
			$(data).show();
		}
		else{
			$(arr[i]).hide();

		}		
	}
}



//io.sockets.emit: Send all socket
//socket.broadcast.emit: broadcast all socket
//socket.emit: self socket
//io.to("socketid").emit() : from socket to socket 