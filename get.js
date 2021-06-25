

function getP1(){

    let params = new URLSearchParams(location.search);
    var turno= params.get('turno');
    var estado = params.get('estado');

    console.log(turno);
    console.log(estado);
    document.getElementById("log").innerHTML+=53;


}


/**
 * @param String name
 * @return String
 */
function getParameterByName(name) {
    console.log("hola mundo js");
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + estado + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));

    console.log(results);


    let params = new URLSearchParams(location.search);
    var contract = params.get('contrato');
    
}

getP1();



