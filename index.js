
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 3000

var salida;
var turno;
var estado;


express()
  .use(express.static(path.join(__dirname, 'public')))  
  .get('/', function(req, res){ 
  
  turno = req.query.turno  
  estado = req.query.estado
  
  init(); 
  res.send(String(salida)); 
  
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))


  function init(){
      console.log("si");
      salida=53;
      console.log(turno);
      console.log(estado);
  }
  