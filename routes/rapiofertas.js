module.exports = function (app, gestorBD) {

    app.get("/api/cancion", function (req, res) {
        gestorBD.obtenerOfertas({}, function (canciones) {
            if (canciones == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send(JSON.stringify(canciones));
            }
        });
    });

    app.get("/api/enterChat/:offer/:target",function (req,res) {
        let criterio = {
            offer: req.params.offer
        };
    });

    app.get("/api/sendMessage/:text/:target/:offer", function (req, res) {
        let criterio = {
            offer: req.params.offer
        };
        gestorBD.obtenerChat(criterio, function (chat) {
            if (chat == null) {
                crearConver(req.session.usuario, req.params.target, req.params.offer, req.params.text);
            } else {
                chat.messages.push(new message(req.params.text, req.session.usuario, new Date()));
                let messages = chat.messages;
                gestorBD.enviarMensaje(criterio, messages,function (id) {
                    if(id == null){
                        res.status(500);
                        res.json({
                            error: "se ha producido un error"
                        });
                    }else{
                        res.status(200);
                    }
                });
            }
        });
    });

    app.get("/api/ofertas", function (req, res) {
        gestorBD.obtenerOfertas({}, function (ofertas) {
            if (ofertas == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send(JSON.stringify(ofertas));
            }
        });
    });

    app.put("/api/cancion/:id", function (req, res) {

        var criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};

        var cancion = {}; // Solo los atributos a modificar
        if (req.body.nombre != null)
            cancion.nombre = req.body.nombre;
        if (req.body.genero != null)
            cancion.genero = req.body.genero;
        if (req.body.precio != null)
            cancion.precio = req.body.precio;
        gestorBD.modificarOferta(criterio, cancion, function (result) {
            if (result == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                res.status(200);
                res.json({
                    mensaje: "canción modificada",
                    _id: req.params.id
                })
            }
        });
    });
    app.post("/api/autenticar", function (req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let criterio = {
            email: req.body.email,
            password: seguro
        };

        gestorBD.obtenerUsuarios(criterio, function (usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                res.status(401); // Unauthorized
                res.json({
                    autenticado: false
                })
            } else {
                let token = app.get('jwt').sign(
                    {usuario: criterio.email, tiempo: Date.now() / 1000},
                    "secreto");
                res.status(200);
                res.json({
                    autenticado: true,
                    token: token
                });
            }

        });
    });
};

function crearConver(user, target, offer, text) {
    let message = new message(text, user, new Date());
    let chat = {
        owner: target,
        buyer: user,
        offer: offer,
        messages: [message]
    };
    gestorBD.insertarChat(chat, function (id) {
        if (id == null) {
            res.status(500);
            res.json({
                error: "se ha producido un error"
            });
        }
    });
};

class message {
    constructor(text, sender, date) {
        this.text = text;
        this.sender = sender;
        this.date = date;
        this.read = false;
    }
};