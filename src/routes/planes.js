const express = require("express");
const routes = express.Router();
const pool = require("../databases");
const https = require('https');
const xml2js = require('xml2js');
var builder = new xml2js.Builder();

routes.get('/planes', async function (req, res) {
    const planes =  await pool.query('Select * from planes');
    res.send(planes);
})

routes.post('/saveUser', async function (req, res) {
    console.log("response_cliente: ",req.body);
    const nombrePlan =null;
    const precio = null;
    const nombreCliente = null;
    const tipoDocumentCliente = null;
    const cedulaCliente=null;
    const emailCliente=null;
    const telefonoCliente=null;
    const fecInicPlan = null;
    const fecFinPlan = null;
    const user =  await pool.query('Insert into comprasPlanes (nombre_plan,precio,nombre_cliente,tipo_documento_cliente,cedula_cliente, email_cliente,fecha_inicio_compra_plan,fecha_fin_vencimiento_plan) values(?,',nombrePlan,',?,',precio,',?,',nombreCliente,',?,',tipoDocumentCliente,',?,',cedulaCliente,',?,',emailCliente,',?,',telefonoCliente,',?,',fecInicPlan,',?',fecFinPlan,') from planes');
    res.send(user);
})


routes.post('/trm', async function (request, response) {
    let xmlDataString = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:act="http://action.trm.services.generic.action.superfinanciera.nexura.sc.com.co/">
    <soapenv:Header/>
        <soapenv:Body>
            <act:queryTCRM>
            </act:queryTCRM>
        </soapenv:Body>
    </soapenv:Envelope>`;

 var request_url = new URL('https://www.superfinanciera.gov.co');
 const options = {
     hostname: request_url.hostname,
     path: '/SuperfinancieraWebServiceTRM/TCRMServicesWebService/TCRMServicesWebService',
     method: 'POST',
     headers: {
         'Content-Type': 'text/xml',
         'Content-Length': xmlDataString.length,
     }
 };

var dataQueue = ""; 
var soapBody = "";
let req = https.request(options, (res) => {
     console.log('statusCode:', res.statusCode);
     console.log('headers:', res.headers);

     res.on('data', (d) => {
        dataQueue += d;
    });
    res.on("end", function () {
        var options = {explicitArray: false, tagNameProcessors: [xml2js.processors.stripPrefix] };
        xml2js.parseString(dataQueue, options,(error, result) => {
             if(error === null) {
                soapBody = result.Envelope;
                if (soapBody.$) {
                    delete soapBody.$;
                }
                console.log(builder.buildObject(soapBody));
            }
            else {
                console.log(error);
            } 
        });
        response.status(res.statusCode).send(soapBody);
    });
 });

 req.on('error', (e) => {
     console.error(e);
 });

 req.write(xmlDataString);
 req.end();
})

module.exports = routes;