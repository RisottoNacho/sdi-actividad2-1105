// Módulos
const express = require('express');
const app = express();
const crypto = require('crypto');

const rest = require('request');
app.set('rest', rest);

const jwt = require('jsonwebtoken');
app.set('jwt', jwt);

const http = require('http');

const expressSession = require('express-session');
app.use(expressSession({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: true
}));

const fileUpload = require('express-fileupload');
app.use(fileUpload());
const swig = require('swig');
const mongo = require('mongodb');

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "POST, GET, DELETE, UPDATE, PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
    // Debemos especificar todas las headers que se aceptan. Content-Type , token
    next();
});


const gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app, mongo);

// routerUsuarioToken
const routerUsuarioToken = express.Router();
routerUsuarioToken.use(function (req, res, next) {
    console.log("routerUsuarioToken");
    // obtener el token, vía headers (opcionalmente GET y/o POST).
    let token = req.headers['token'] || req.body.token || req.query.token;
    console.log(token.usuario);
    if (token != null) {
        // verificar el token
        jwt.verify(token, 'secreto', function (err, infoToken) {
            if (err || (Date.now() / 1000 - infoToken.tiempo) > 240 || infoToken.usuario == null) {
                res.status(403); // Forbidden
                res.json({
                    acceso: false,
                    error: 'Token invalido o caducado'
                });
                // También podríamos comprobar que intoToken.usuario existe

            } else {
                // dejamos correr la petición
                res.usuario = infoToken.usuario;
                next();
            }
        });

    } else {
        res.status(403); // Forbidden
        res.json({
            acceso: false,
            mensaje: 'No hay Token'
        });
    }
});
// Aplicar routerUsuarioToken
app.use('/api/sendMessage', routerUsuarioToken);
app.use('/api/ofertas', routerUsuarioToken);
app.use('/api/ofertasPropias', routerUsuarioToken);
app.use('/api/messageList', routerUsuarioToken);
app.use('/api/chats', routerUsuarioToken);

// routerUsuarioSession
let routerUsuarioSession = express.Router();
routerUsuarioSession.use(function (req, res, next) {
    console.log("routerUsuarioSession");
    if (req.session.usuario && req.session.role == 'standardUser') {
        // dejamos correr la petición
        next();
    } else {
        res.redirect("/identificarse");
    }
});
//Aplicar routerUsuarioSession
app.use("/ofertas/agregar", routerUsuarioSession);
app.use("/ofertas", routerUsuarioSession);
app.use("/perfil", routerUsuarioSession);
app.use("/oferta/comprar/**", routerUsuarioSession);
app.use("/oferta/eliminar/*", routerUsuarioSession);

// routerSession
let routerSession = express.Router();
routerSession.use(function (req, res, next) {
    console.log("routerSession");
    if (req.session.usuario) {
        // dejamos correr la petición
        next();
    } else {
        res.redirect("/identificarse");
    }
});
//Aplicar routerUsuarioSession
app.use("/desconectarse", routerSession);

// routerSession
let routerNoSession = express.Router();
routerNoSession.use(function (req, res, next) {
    console.log("routerSession");
    if (req.session.usuario == null) {
        // dejamos correr la petición
        next();
    } else {
        if (req.session.role == 'admin')
            res.redirect("/usuarios");
        else
            res.redirect("/perfil");
    }
});
//Aplicar routerUsuarioSession
app.use("/identificarse", routerNoSession);
app.use("/registrarse", routerNoSession);

// routeradmin
let routerAdminSession = express.Router();
routerAdminSession.use(function (req, res, next) {
    console.log("routeradmin");
    if (req.session.usuario && req.session.role == 'admin') {
        // dejamos correr la petición
        next();
    } else {
        res.redirect("/identificarse");
    }
});
//Aplicar routeradmin

app.use("/usuarios", routerAdminSession);


//routerUsuarioAutor
let routerUsuarioAutor = express.Router();
routerUsuarioAutor.use(function (req, res, next) {
    console.log("routerUsuarioAutor");
    let path = require('path');
    let id = path.basename(req.originalUrl);
// Cuidado porque req.params no funciona
// en el router si los params van en la URL.
    gestorBD.obtenerOfertas(
        {_id: mongo.ObjectID(id)}, function (ofertas) {
            console.log(ofertas[0]);
            if (ofertas[0].autor == req.session.usuario) {
                next();
            } else {
                res.redirect("/perfil?mensaje=No eres propietario de esa oferta&tipoMensaje=alert-danger \"");
            }
        })
});
//Aplicar routerUsuarioAutor
app.use("/oferta/eliminar", routerUsuarioAutor);

//routerUsuarioNoAutor
let routerUsuarioNoAutor = express.Router();
routerUsuarioNoAutor.use(function (req, res, next) {
    console.log("routerUsuarioNoAutor");
    let path = require('path');
    let id = path.basename(path.dirname(req.originalUrl));
    let price = path.basename(req.originalUrl);
    console.log(id);
    console.log(price);
// Cuidado porque req.params no funciona
// en el router si los params van en la URL.
    gestorBD.obtenerOfertas(
        {_id: mongo.ObjectID(id)}, function (ofertas) {
            console.log(ofertas[0]);
            if (ofertas[0].autor != req.session.usuario && ofertas[0].price == price) {
                next();
            } else {
                res.redirect("/ofertas?mensaje=No puedes comprar tus propias ofertas ni trampear el precio&tipoMensaje=alert-danger \"");
            }
        })
});
//Aplicar routerUsuarioAutor
app.use("/oferta/comprar", routerUsuarioNoAutor);

app.use(express.static('public'));
// Variables
app.set('port', 8081);
app.set('db', 'mongodb://admin:sdi@tiendamusica-shard-00-00-48dwf.mongodb.net:27017,tiendamusica-shard-00-01-48dwf.mongodb.net:27017,tiendamusica-shard-00-02-48dwf.mongodb.net:27017/test?ssl=true&replicaSet=tiendamusica-shard-0&authSource=admin&retryWrites=true');
app.set('clave', 'abcdefg');
app.set('crypto', crypto);

//Rutas/controladores por lógica
require("./routes/rusuarios.js")(app, swig, gestorBD); // (app, param1, param2, etc.)
require("./routes/rofertas.js")(app, swig, gestorBD); // (app, param1, param2, etc.)
require("./routes/rapiofertas.js")(app, gestorBD);


app.get('/', function (req, res) {
    res.redirect('/identificarse');
});

// IMPORTANTE MANEJO DE ERRORES

/*app.use(function (err, req, res, next) {
    console.log("Error producido: " + err); //we log the error in our db
    if (!res.headersSent) {
        res.status(400);
        res.send("Recurso no disponible");
    }
});*/


// lanzar el servidor
/*
https.createServer({
    key: fs.readFileSync('certificates/alice.key'),
    cert: fs.readFileSync('certificates/alice.crt')
}, app).listen(app.get('port'), function () {
    console.log("Servidor activo");
});*/

http.createServer(app).listen(app.get('port'), function () {
    console.log("Servidor activo");
});

/*
app.listen(app.get('port'), function() {
    console.log("Servidor activo");
});*/