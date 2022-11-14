const express = require("express");
const routes = express.Router();
const pool = require("../databases");
const https = require('https');
const xml2js = require('xml2js');
const moment = require('moment');
var builder = new xml2js.Builder();

routes.get('/planes', async function (req, res) {
    const planes =  await pool.query('Select * from planes');
    res.send(planes);
})

routes.post('/saveUser', async function (req, res) {
    let segundoNombre = "";
    let segundoApellido = "";

    if(req.body.segundo_nombre != null || req.body.segundo_nombre != ''){
        segundoNombre = req.body.segundo_nombre;
    }
    if(req.body.segundo_apellido!=null || req.body.segundo_apellido != ''){
        segundoApellido = req.body.segundo_apellido;
    }

    const nombreCliente = req.body.primer_nombre+" "+segundoNombre+" "+req.body.primer_apellido+" "+segundoApellido;
    const nombreCliente1 = req.body.primer_nombre+" "+segundoNombre;
    const apellidoCliente = req.body.primer_apellido+" "+segundoApellido;
    const tipoDocumentCliente = req.body.tip_docum;
    const cedulaCliente = req.body.cod_docum;
    const emailCliente = req.body.email;
    const telefonoCliente = req.body.telefono;
    const direccionCliente = req.body.direccion;
    const fecInicPlan = new Date();
    let date = new Date();
    let date2 = moment(date).format('YYYY-MM-DD HH:mm:ss');
    let date3 = moment(moment(date2).add(1, 'years').format('YYYY-MM-DD HH:mm:ss'));
    const fecFinPlan =  date3.format("YYYY-MM-DD HH:mm:ss")
    const pais = req.body.pais.nombre;
    const ciudad = req.body.ciudad.city;
    const nombrePlan = req.body.dataPlan.plan.nombre;
    const precioPlan = req.body.dataPlan.plan.precioTotal;
     
    const validClient = await pool.query('SELECT * FROM clientes WHERE tip_docum = ? AND cod_docum = ?',[tipoDocumentCliente,cedulaCliente]);
    
    if(Object.keys(validClient).length === 0){
        const client = await pool.query('INSERT INTO clientes (tip_docum,cod_docum,nombres,apellidos,celular,email,domicilio,pais,ciudad,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?,?,?,now(),now())',[tipoDocumentCliente,cedulaCliente,nombreCliente1,apellidoCliente,telefonoCliente,emailCliente,direccionCliente,pais,ciudad]);
    }

    const user =  await pool.query('INSERT INTO comprasPlanes (nombre_plan,precio,nombre_cliente,tipo_documento_cliente,cedula_cliente, email_cliente,telefono_cliente,fecha_inicio_compra_plan,fecha_fin_vencimiento_plan,createdAt,updatedAt) values (?,?,?,?,?,?,?,?,?,now(),now())',
    [nombrePlan,precioPlan,nombreCliente,tipoDocumentCliente,cedulaCliente,emailCliente,telefonoCliente,fecInicPlan,fecFinPlan]);
    res.send(user);
})

routes.post('/saveCotizacion', async function (req, res) {
    const nombre = req.body.nombre;
    const apellido = req.body.apellido;
    const email = req.body.email;
    const plan = req.body.plan.nombre;
    const comentario = req.body.comentario;
    const fecEnvio = new Date();

    const cotizacion =  await pool.query('INSERT INTO cotizaciones (nombres,apellidos,email,plan,comentario,fec_envio) values (?,?,?,?,?,?)',
    [nombre,apellido,email,plan,comentario,fecEnvio]);
    res.send(cotizacion);
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