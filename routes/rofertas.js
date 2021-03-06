const lib = require('../modules/lib.js');

module.exports = function (app, swig, gestorBD) {
    let logger = app.get('logger');
    app.get("/ofertas", function (req, res) {
            let criterio = {autor: {$ne: req.session.usuario}};
            if (req.query.busqueda != null) {
                criterio.title = {$regex: ".*" + req.query.busqueda + ".*", $options: 'i'};
            }
            let pg = parseInt(req.query.pg); // Es String !!!
            if (req.query.pg == null) { // Puede no venir el param
                pg = 1;
            }
            gestorBD.obtenerOfertasPg(criterio, pg, function (ofertas, total) {
                if (ofertas == null) {
                    logger.error("Las ofertas paginadas no se cargaron correctamente de la base de datos");
                    res.send("Error al listar ");
                } else {
                    let ultimaPg = total / 5;
                    if (total % 5 > 0) { // Sobran decimales
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
                    logger.trace("Ofertas paginadas cargadas correctamente");
                    res.send(lib.globalRender("views/bofertas.html", params, req.session));
                }
            });

        }
    )
    ;

    app.get("/perfil", function (req, res) {
        let criterio = {autor: req.session.usuario};
        gestorBD.obtenerOfertas(criterio, function (ofertas) {
            if (ofertas == null) {
                logger.warn("El usuario " + autor + " no tiene ofertas");
                res.send("Error al del servidor");
            }
            gestorBD.obtenerCompras({usuario: req.session.usuario}, function (compras) {
                if (compras == null) {
                    logger.warn("El usuario " + autor + " no tiene compras");
                    res.send("Error al del servidor");
                }
                let idCompras = [];
                for (let i = 0; i < compras.length; i++) {
                    idCompras.push(compras[i].ofertaId);
                }
                gestorBD.obtenerOfertas({"_id": {$in: idCompras}}, function (comprasUsuario) {
                    let params = [];
                    params['lsOfertas'] = ofertas;
                    params['lsOfertasCompradas'] = comprasUsuario;
                    res.send(lib.globalRender("views/bperfil.html", params, req.session));
                });
            });
        });
    });


    app.get('/ofertas/agregar', function (req, res) {
        let params = [];
        res.send(lib.globalRender('views/bagregar.html', params, req.session));
    });

//VALIDAR SIEMPRE EN SEVIDOR
    app.post("/oferta", function (req, res) {
        if (req.body.titulo == "" || req.body.descripcion == "" || req.body.precio == "" || isNaN(req.body.precio))
            res.redirect("/ofertas/agregar?mensaje=Todos los campos son obligatorios&tipoMensaje=alert-danger");
        else {
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
                        logger.error("Ha habido un problema al inertar la oferta en la base de datos");
                        res.redirect("/ofertas/agregar?mensaje=Error del servidor&tipoMensaje=alert-danger")
                    } else {
                        res.redirect("/perfil");
                    }
                });
            }
        }
    });

    app.get('/oferta/comprar/:id/:price', function (req, res) {
        let ofertaId = gestorBD.mongo.ObjectID(req.params.id);
        let price = req.params.price;
        let compra = {
            usuario: req.session.usuario,
            ofertaId: ofertaId
        };
        gestorBD.obtenerUsuarios({email: req.session.usuario}, function (usuarios) {
            req.session.money = usuarios[0].money;
            if (price < 0 || req.session.money - price < 0) {
                res.redirect("/ofertas?mensaje=Dinero insuficiente&tipoMensaje=alert-danger");
            } else {
                req.session.money = req.session.money - price;
                gestorBD.marcarOfertaComprada({"_id": ofertaId}, function (oferta) {
                    if (oferta == null)
                        logger.error("Ha habido un problema al marcal la oferta como comprada");
                    else {
                        gestorBD.modificarUsuario({email: req.session.usuario}, req.session.money, function (oferta) {
                            if (oferta == null)
                                logger.error("Ha habido un problema al modificar el usuario");
                            else {
                                gestorBD.insertarCompra(compra, function (idCompra) {
                                    if (idCompra == null) {
                                        logger.error("Ha habido un problema al inertar la compra en la base de datos");
                                    } else {
                                        logger.trace("Compra de ña oferta: "+ofertaId+" realizada con exito");
                                        res.redirect("/ofertas");
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });

    });

    app.get('/oferta/eliminar/:id', function (req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        gestorBD.eliminarOferta(criterio, function (ofertas) {
            if (ofertas == null) {
                logger.error("Intento de eliminar oferta inexistente");
                res.send("Error del servidor");
            } else {
                logger.trace("Oferta eliminada correctamente");
                res.redirect("/perfil");
            }
        });
    });

}
;
