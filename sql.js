/*
thai.itplus@gmail.com



MySQL




*/

var mysql = require('mysql');
var myDB="iot";

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  //database: myDB
});

sqlArr=['CREATE TABLE IF NOT EXISTS `config` (  `SSID` varchar(100) COLLATE utf8_vietnamese_ci DEFAULT NULL,  `SSID_Password` varchar(100) COLLATE utf8_vietnamese_ci DEFAULT NULL,`Server_IP` varchar(100) DEFAULT NULL,`Server_Port` varchar(100) DEFAULT NULL,  `Sensor_Freq` int(11) DEFAULT NULL,  `Sensor_t` float DEFAULT NULL,  `Sensor_h` float DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_vietnamese_ci;',
'CREATE TABLE IF NOT EXISTS `data` (`Time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  `h` float NOT NULL,  `t` float NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_vietnamese_ci;'
];




con.connect(function(err) {
  if (err) throw err;
  con.query("CREATE DATABASE IF NOT EXISTS "+myDB+"", function (err, result) {
    if (err) throw err;
    else {
      con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "123456",
      database: myDB
      });

      console.log("------------------------");
      console.log(" Database Connected! ");
      console.log("------------------------");

      sql="SET GLOBAL time_zone = '+7:00';";
      con.query(sql, function (err, result) {
              if (err) throw err;
              console.log("Set time_zone!");
            });       
      
      for (var i =0; i<sqlArr.length; i++) {
        con.query(sqlArr[i], function (err, result) {
        if (err) throw err;
        console.log("Table checked!");
      });       
      }

    }

  });
});


exports.getDeviceConfig =function (callback) {
        con.query('SELECT * FROM config',function(err, rows) {
            if (err) {
                callback(err,null);
            } else 
                callback(rows);
        });
}


//Database: Cấu hình thông số Wifi 
exports.setNetworkConfig =function (SSID,SSID_Password,Server_IP,Server_Port) {
    checkDataExists("SSID, SSID_Password","config",function(data){
              if(data.length) {
                console.log("Update");
                //console.log(Sensor_Freq);
                var sql = "update config set SSID='"+SSID+"',SSID_Password='"+SSID_Password+"',Server_IP='"+Server_IP+"',Server_Port='"+Server_Port+"'";
              }

              else {
                console.log("Insert");
                var sql = "INSERT INTO config (SSID, SSID_Password,Server_IP,Server_Port) VALUES ('"+SSID+"','"+SSID_Password+"','"+Server_IP+"','"+Server_Port+"')";
              }
              sqlExec(sql);
    });

  }


//Database: Thời gian Sensor send data-->Server
exports.setSensorFreqConfig =function (Sensor_Freq) {
    checkDataExists("Sensor_Freq","config",function(data){
              if(data.length) {
                console.log("Update");
                //console.log(Sensor_Freq);
                var sql = "update config set Sensor_Freq='"+Sensor_Freq+"'";
              }

              else {
                console.log("Insert");
                var sql = "INSERT INTO config (Sensor_Freq) VALUES ('"+Sensor_Freq+"')";
              }
              sqlExec(sql);
    });

  }


//Database: setRelayActive <== Nhiệt độ:Sensor_t, Độ ẩm:Sensor_h
exports.setRelayActive =function (Sensor_t,Sensor_h) {
    checkDataExists("Sensor_t, Sensor_h","config",function(data){
              if(data.length) {
                console.log("Update");
                console.log(data);
                var sql = "update config set Sensor_t='"+Sensor_t+"',Sensor_h='"+Sensor_h+"'";
              }

              else {
                console.log("Insert");
                var sql = "INSERT INTO config (Sensor_t, Sensor_h) VALUES ('"+Sensor_t+"','"+Sensor_h+"')";
              }
              sqlExec(sql);
    });
  }


///Database: update Nhiệt độ:t, Độ ẩm:h
exports.updateSensor =function (t,h) {
                console.log("Insert Data");
                var sql = "INSERT INTO data(t,h) values('"+t+"','"+h+"')";
                sqlExec(sql);
  }



exports.getdatafromcurrentDateHour =function (data,callback) {
  sql='SELECT hour(Time) as Hour ,count(hour(Time)) as count, sum(t) as t,sum(h) as h FROM `data` WHERE date(Time)=date(NOW()) group by Hour';
  if(data=="Date"){
    //chưa xong
    sql='SELECT * FROM `data` WHERE month(Time)=month(NOW())';
  }
    con.query(sql,function(err, rows) {
      if (err) {
          callback(err,null);
      } else {
          //console.log(rows)
          callback(rows);
        }
                
        });
}


//Thực thi SQL
function sqlExec(sql){
          //console.log("SQL: "+sql);
          con.query(sql, function (err, result) {
          if (err) throw err;
          console.log("OK!");
          });


}

//Check checkDataExists
function checkDataExists(data,Db,callback){
  var sql = "select "+data+" from "+Db;
  con.query(sql,function(err, rows) {
            if (err) {
                callback(err,null);
            }
            else 
              callback(rows);
        });
}

/*
con.query('SELECT * FROM config', function(err, result, field)
{

        if (err) 
            callback(err,null);
        else
        //callback(result[0].SSID);
        //console.log("Inside");
        //console.log(result[0].SSID);
        callback(err,null);
        
	});
*/