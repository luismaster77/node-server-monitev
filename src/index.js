const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const { database } = require('./keys');
const bodyParser = require('body-parser');
var corsOptions = {
  origin: "http://localhost:4200"
};

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors(corsOptions));
app.use(cors());
// parse requests of content-type - application/json
app.use(bodyParser.json());
app.use(express.json());
// set port, listen for requests
app.set('port',process.env.PORT || 4000);
app.use(session({
  secret: 'faztmysqlnodemysql',
  resave: false,
  saveUninitialized: false,
  store: new MySQLStore(database)
}));
//Routes
app.use(require('./routes'));
app.use('/monitev', require('./routes/countries'));
app.use('/monitev', require('./routes/planes'));
app.use('/monitev', require('./routes/clientes'));
//Midleware
app.use(morgan('dev'));

//execute server
app.listen(app.get('port'), () => {
    console.log('Servidor activo por el puerto',app.get('port'));
  });