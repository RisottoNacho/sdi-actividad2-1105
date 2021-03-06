const lib = require('../modules/lib.js');

module.exports = function (app, swig, gestorBD) {
    let logger = app.get('logger');
    app.get("/usuarios", function (req, res) {
        let criterio = {
            email: {$ne: "admin@email.com"}
        };
        gestorBD.obtenerUsuarios(criterio, function (users) {
            if (users == null) {
                logger.error("No hay usuarios en el sistema");
            }
            const params = [];
            params['lsusers'] = users;
            res.send(lib.globalRender('views/busuarios.html', params, req.session));
        });
    });

    app.get("/registrarse", function (req, res) {
        let params = [];
        res.send(lib.globalRender('views/bregistro.html', params, req.session));
    });

    app.post('/usuario', function (req, res) {
        if (req.body.email.trim() == "" || req.body.name.trim() == "" || req.body.surname.trim() == "" || req.body.password.trim() == "" || req.body.confirmPassword.trim() == "")
            res.redirect("/registrarse?mensaje=Todos los campos son obligatorios&tipoMensaje=alert-danger");
        else {
            let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
                .update(req.body.password).digest('hex');
            if (req.body.password === req.body.confirmPassword) {
                let criterio = {email: req.body.email};
                gestorBD.obtenerUsuarios(criterio, function (usuarios) {
                    if (!(usuarios == null || usuarios.length == 0))
                        res.redirect("/registrarse?mensaje=El email ya está registrado&tipoMensaje=alert-danger");
                    else {
                        let usuario = {
                            email: req.body.email,
                            name: req.body.name,
                            surname: req.body.surname,
                            money: 100,
                            password: seguro
                        };
                        gestorBD.insertarUsuario(usuario, function (id) {
                            if (id == null) {
                                res.redirect("/registrarse?mensaje=Error del servidor&tipoMensaje=alert-danger");
                            } else {
                                logger.trace("Nuevo usuario registrado con id: " + id)
                                res.redirect("/identificarse?mensaje=Nuevo usuario registrado");
                            }
                        });
                    }
                })
            } else
                res.redirect("/registrarse?mensaje=Las contraseñas deben coincidir&tipoMensaje=alert-danger")
        }
    });

    app.get("/identificarse", function (req, res) {
        let params = [];
        res.send(lib.globalRender('views/bidentificacion.html', params, req.session));
    });

    app.post("/identificarse", function (req, res) {
        if (req.body.email.trim() == "" || req.body.password.trim() == "") {
            res.redirect("/identificarse" +
                "?mensaje=No puede haber campos vacios" +
                "&tipoMensaje=alert-danger ");
        } else {

            let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
                .update(req.body.password).digest('hex');
            let criterio = {
                email: req.body.email,
                password: seguro
            };
            gestorBD.obtenerUsuarios(criterio, function (usuarios) {
                if (usuarios == null || usuarios.length == 0) {
                    req.session.usuario = null;
                    res.redirect("/identificarse" +
                        "?mensaje=Email o password incorrecto" +
                        "&tipoMensaje=alert-danger ");
                } else {
                    req.session.usuario = usuarios[0].email;
                    req.session.money = usuarios[0].money;
                    if (usuarios[0].email == "admin@email.com") {
                        logger.trace("Usuario identificado como administrador");
                        req.session.role = 'admin';
                        res.redirect("/usuarios");
                    } else {
                        logger.trace("Usuario identificado como usuario estándar");
                        req.session.role = 'standardUser';
                        res.redirect("/perfil");
                    }
                }
            });
        }
    });


    app.post("/delete", function (req, res) {
        let aux;
        if (!Array.isArray(req.body.cb)) {
            aux = [];
            aux.push(req.body.cb)
        } else {
            aux = req.body.cb;
        }
        let lsDel = [];
        for (let index in aux) {
            let id = aux[index];
            lsDel.push(gestorBD.mongo.ObjectId(id));
        }
        const criterio = {
            "_id": {$in: lsDel}
        };
        if (!(lsDel == null || lsDel.length == 0)) {
            gestorBD.obtenerUsuarios(criterio, function (usuarios) {
                let ls = [];
                for (let i = 0; i < usuarios.length; i++) {
                    ls.push(usuarios[i].email);
                }
                let cr2 = {
                    $or: [{owner: {$in: ls}}, {buyer: {$in: ls}}]
                };
                gestorBD.eliminarChats(cr2, function (err, result) {
                    let cr3 = {
                        autor: {$in: ls}
                    };
                    gestorBD.eliminarOfertas(cr3, function (err, result) {
                        let cr4 = {
                            usuario: {$in: ls}
                        };
                        gestorBD.eliminarCompras(cr4, function (err, result) {
                            gestorBD.eliminarUsuario(criterio, function () {
                                logger.trace("Borrado de usuario stisfactorio");
                                res.redirect("/usuarios");
                            });
                        })
                    })

                });
            });
        }
    });

    app.get('/desconectarse', function (req, res) {
        logger.trace("Usuario:" + req.session.usuario + " cierra la sesión");
        req.session.usuario = null;
        req.session.money = null;
        req.session.role = null;
        let params = [];
        res.send(lib.globalRender('views/bidentificacion.html', params, req.session));
    });

};