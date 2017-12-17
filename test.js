var x=require('./sql.js')


x.getConfig(function(content) {
   console.log("---------------Get Config from DB");
 
   console.log(content);
});



//console.log("DAta")
//console.log(conf)