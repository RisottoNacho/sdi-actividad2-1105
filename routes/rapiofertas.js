module.exports = function (app, gestorBD) {

    /*
        app.get("/api/enterChat/:offer/:target",function (req,res) {
            let criterio = {
                offer: req.params.offer
            };
        });*/

    app.get("/api/messageList/:offer", function (req, res) {
        let user = res.usuario;
        let criterio = {
            "_id": gestorBD.mongo.ObjectID(req.params.offer)
        };
        gestorBD.obtenerOfertas(criterio, function (ofertas) {
            criterio = {
                "offer": req.params.offer,
                "buyer": user
            };
            if (ofertas == null || ofertas.length == 0) {
                res.status(500);
                res.json({
                    error: "Error de la base de datos o oferta inexistente"
                });
                s
            } else if (user == ofertas[0].autor) {
                gestorBD.obtenerChats(criterio, function (chats) {
                    if (chats == null || chats.length == 0) {
                        res.status(500);
                        res.json({
                            error: "No hay chats para esta oferta"
                        });
                    } else {
                        res.status(200);
                        res.send(JSON.stringify(chats));
                    }
                });
            } else {
                gestorBD.obtenerChat(criterio, function (chat) {
                    if (chat == null) {
                        res.status(500);
                        res.json({
                            error: "No hay chat para esta oferta"
                        });
                    } else {
                        res.status(200);
                        let result = {
                            buyer: true,
                            messages: chat.messages
                        };
                        //console.log(result);
                        res.send(JSON.stringify(result));
                    }
                });
            }
        });
    });

    app.get("/api/sendMessage/:text/:target/:offer", function (req, res) {
        let user = res.usuario;
        if (user == req.params.target) {
            res.status(500);
            res.json({
                error: "No puedes enviarte mensajes a ti mismo"
            });
        } else {
            let criterio = {
                    $and: [
                        {"offer": req.params.offer},
                        {
                            $and:
                                [
                                    {
                                        $or: [{"buyer": user}, {"buyer": req.params.target}]
                                    }, {
                                    $or: [{"owner": user}, {"owner": req.params.target}]
                                }
                                ]
                        }]
                }
            ;
            gestorBD.obtenerChat(criterio, function (chat) {
                if (chat == null) {
                    crearConver(user, req.params.target, req.params.offer, req.params.text, gestorBD, res);
                } else {
                    let message = {
                        text: req.params.text,
                        sender: user,
                        date: new Date(),
                        read: false
                    };
                    chat.messages.push(message);
                    let messages = chat.messages;
                    gestorBD.enviarMensaje(criterio, messages, function (id) {
                        if (id == null) {
                            res.status(500);
                            res.json({
                                error: "se ha producido un error"
                            });
                        } else {
                            res.status(200);
                            res.json({
                                enviado: true
                            });
                        }
                    });
                }
            });
        }
    });

    app.get("/api/ofertas", function (req, res) {
        let user = res.usuario;
        console.log(user);
        gestorBD.obtenerOfertas({autor: {$ne: user}}, function (ofertas) {
            if (ofertas == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send(JSON.stringify(ofertas));
                /*res.json({
                    ofertas: ofertas
                })*/
            }
        });
    });

    app.get("/api/ofertasPropias", function (req, res) {
        let user = res.usuario;
        console.log(user);
        gestorBD.obtenerOfertas({autor: user}, function (ofertas) {
            if (ofertas == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send(JSON.stringify(ofertas));
                /*res.json({
                    ofertas: ofertas
                })*/
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

function crearConver(user, target, offer, text, gestorBD, res) {
    //let message = new message(text, user, new Date());
    let criterio = {
        "_id": gestorBD.mongo.ObjectID(offer)
    };
    gestorBD.obtenerOfertas(criterio, function (oferta) {
        if (oferta == null) {
            res.status(500);
            res.json({
                error: "Se ha producido un error en la base de datos al obtener la oferta o esta no existe"
            });
        } else {
            if (oferta[0].autor == user) {
                res.status(500);
                res.json({
                    error: "El propietario de la oferta no puede iniciar la conversación"
                });
            } else if (oferta[0].autor == target) {
                let message = {
                    text: text,
                    sender: user,
                    date: new Date(),
                    read: false
                };
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
                    } else {
                        res.status(200);
                        res.json({
                            converCreada: true
                        });
                    }
                });
            } else {
                res.status(500);
                res.json({
                    error: "El mensaje debe estar dirigido al propietario de la oferta"
                });
            }
        }
    });

};
