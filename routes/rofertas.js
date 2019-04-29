const lib = require('./lib.js');

module.exports = function (app, swig, gestorBD) {
    app.get("/nuevas/canciones", function (req, res) {
        var canciones = [{
            "nombre": "Blank space",
            "precio": "1.2"
        }, {
            "nombre": "See you again",
            "precio": "1.3"
        }, {
            "nombre": "Uptown Funk",
            "precio": "1.1"
        }];
        var respuesta = swig.renderFile('views/btienda.html', {
            vendedor: 'Tienda de canciones',
            canciones: canciones
        });
        res.send(respuesta);
    });

    app.get("/ofertas", function (req, res) {
        var criterio = {};
        if (req.query.busqueda != null) {
            criterio = {"title": {$regex: ".*" + req.query.busqueda + ".*", $options: 'i'}};
        }
        let pg = parseInt(req.query.pg); // Es String !!!
        if (req.query.pg == null) { // Puede no venir el param
            pg = 1;
        }
        gestorBD.obtenerOfertasPg(criterio, pg, function (ofertas, total) {
            if (ofertas == null) {
                res.send("Error al listar ");
            } else {
                let ultimaPg = total / 4;
                if (total % 4 > 0) { // Sobran decimales
                    ultimaPg = ultimaPg + 1;
                }
                let paginas = []; // paginas mostrar
                for (let i = pg - 2; i <= pg + 2; i++) {
                    if (i > 0 && i <= ultimaPg) {
                        paginas.push(i);
                    }
                }
                let params = [];
                params['lsOfertas'] = ofertas;
                params['paginas'] = paginas;
                params['actual'] = pg;
                res.send(lib.globalRender("views/bofertas.html", params, req.session));
            }
        });

    });

    app.get("/perfil", function (req, res) {
        let criterio = {autor: req.session.usuario};
        gestorBD.obtenerOfertas(criterio, function (ofertas) {
            if (ofertas == null) {
                res.send("Error al del servidor");
            } else {
                let soldOffers = [];
                for (let i = 0; i < ofertas.length; i++) {
                    if (ofertas[i].autor == req.session.usuario)
                        soldOffers.push(ofertas[i]);
                }
                let params = [];
                params['lsOfertas'] = ofertas;
                params['lsOfertasCompradas'] = soldOffers;
                res.send(lib.globalRender("views/bperfil.html", params, req.session));
            }
        });
    });


    app.get('/ofertas/agregar', function (req, res) {
        let params = [];
        res.send(lib.globalRender('views/bagregar.html', params, req.session));
    });

    //VALIDAR SIEMPRE EN SEVIDOR
    app.post("/oferta", function (req, res) {
        let params = [];
        let oferta = {
            title: req.body.titulo,
            description: req.body.descripcion,
            price: req.body.precio,
            autor: req.session.usuario,
            date: new Date(Date.now()),
            sold: false
        };
        if (oferta.price < 0) {
            res.redirect("/ofertas/agregar?mensaje=El precio debe tener un valor positivo&tipoMensaje=alert-danger")
        } else {
            // Conectarse
            gestorBD.insertarOferta(oferta, function (id) {
                if (id == null) {
                    res.redirect("/ofertas/agregar?mensaje=Error del servidor&tipoMensaje=alert-danger")
                } else {
                    res.send(lib.globalRender('views/bperfil.html', params, req.session));
                }
            });
        }
    });
    app.get('/promo*', function (req, res) {
        res.send('Respuesta patrón promo* ');
    });

    app.get('/oferta/comprar/:id/:price', function (req, res) {
        let ofertaId = gestorBD.mongo.ObjectID(req.params.id);
        let price = req.params.price;
        let compra = {
            usuario: req.session.usuario,
            ofertaId: ofertaId
        };
        if (price < 0 || req.session.money - price < 0) {
            alert("Wait, that's illegal");
            res.redirect("/desconectarse");
        }
        req.session.money = req.session.money - price;
        gestorBD.marcarOfertaComprada({"_id": ofertaId}, function (oferta) {
            if (oferta == null)
                res.send("Error del servidor");
            else {
                gestorBD.modificarUsuario({email: req.session.usuario}, req.session.money, function (oferta) {
                    if (oferta == null)
                        res.send("Error del servidor");
                    else {
                        gestorBD.insertarCompra(compra, function (idCompra) {
                            if (idCompra == null) {
                                res.send("Error del servidor");
                            } else {
                                res.redirect("/ofertas");
                            }
                        });
                    }
                });
            }
        });
    });


    app.get('/compras', function (req, res) {
        var criterio = {"usuario": req.session.usuario};
        gestorBD.obtenerCompras(criterio, function (compras) {
            if (compras == null) {
                res.send("Error al listar ");
            } else {
                var cancionesCompradasIds = [];
                for (i = 0; i < compras.length; i++) {
                    cancionesCompradasIds.push(compras[i].cancionId);
                }
                var criterio = {"_id": {$in: cancionesCompradasIds}}
                gestorBD.obtenerOfertas(criterio, function (canciones) {
                    var respuesta = swig.renderFile('views/bofertas.html',
                        {
                            canciones: canciones
                        });
                    res.send(respuesta);
                });
            }
        });
    });

    app.get('/cancion/eliminar/:id', function (req, res) {
        var criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        gestorBD.eliminarOferta(criterio, function (canciones) {
            if (canciones == null) {
                res.send(respuesta);
            } else {
                res.redirect("/publicaciones");
            }
        });
    });


    app.get('/cancion/modificar/:id', function (req, res) {
        var criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        gestorBD.obtenerOfertas(criterio, function (canciones) {
            if (canciones == null) {
                res.send(respuesta);
            } else {
                var respuesta = swig.renderFile('views/bcancionModificar.html',
                    {
                        cancion: canciones[0]
                    });
                res.send(respuesta);
            }
        });
    });

    app.post('/cancion/modificar/:id', function (req, res) {
        var id = req.params.id;
        var criterio = {"_id": gestorBD.mongo.ObjectID(id)};
        var cancion = {
            nombre: req.body.nombre,
            genero: req.body.genero,
            precio: req.body.precio
        }
        gestorBD.modificarOferta(criterio, cancion, function (result) {
            if (result == null) {
                res.send("Error al modificar ");
            } else {
                paso1ModificarPortada(req.files, id, function (result) {
                    if (result == null) {
                        res.send("Error en la modificación");
                    } else {
                        res.redirect("/publicaciones");
                    }
                });

            }
        });
    });

    function paso1ModificarPortada(files, id, callback) {
        if (files.portada != null) {
            var imagen = files.portada;
            imagen.mv('public/portadas/' + id + '.png', function (err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    paso2ModificarAudio(files, id, callback); // SIGUIENTE
                }
            });
        } else {
            paso2ModificarAudio(files, id, callback); // SIGUIENTE
        }
    };

    function paso2ModificarAudio(files, id, callback) {
        if (files.audio != null) {
            var audio = files.audio;
            audio.mv('public/audios/' + id + '.mp3', function (err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    callback(true); // FIN
                }
            });
        } else {
            callback(true); // FIN
        }
    };

    app.get('/cancion/:id', function (req, res) {
        var criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        gestorBD.obtenerOfertas(criterio, function (canciones) {
            if (canciones == null) {
                res.send(respuesta);
            } else {
                var configuracion = {
                    url: "https://api.exchangeratesapi.io/latest?base=EUR",
                    method: "get",
                    headers: {
                        "token": "ejemplo",
                    }
                }
                var rest = app.get("rest");
                rest(configuracion, function (error, response, body) {
                    console.log("cod: " + response.statusCode + " Cuerpo :" + body);
                    var objetoRespuesta = JSON.parse(body);
                    var cambioUSD = objetoRespuesta.rates.USD;
                    // nuevo campo "usd"
                    canciones[0].usd = cambioUSD * canciones[0].precio;
                    var respuesta = swig.renderFile('views/bcancion.html',
                        {
                            cancion: canciones[0]
                        });
                    res.send(respuesta);
                })
            }
        });
    });


    app.get('/canciones/:genero/:id', function (req, res) {
        var respuesta = 'id: ' + req.params.id + '<br>'
            + 'Genero: ' + req.params.genero;
        res.send(respuesta);
    });

};
