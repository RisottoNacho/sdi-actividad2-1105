const lib = require('./lib.js');

module.exports = function (app, swig, gestorBD) {

    app.get("/usuarios", function (req, res) {
        let criterio = {
            email: {$ne: "admin@email.com"}
        };
        gestorBD.obtenerUsuarios(criterio, function (users) {
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
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        if (req.body.password === req.body.confirmPassword) {
            let criterio = {criterio: req.body.email};
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
                            res.redirect("/identificarse?mensaje=Nuevo usuario registrado");
                        }
                    });
                }
            })
        } else
            res.redirect("/registrarse?mensaje=Las contraseñas deben coincidir&tipoMensaje=alert-danger")
    });

    app.get("/identificarse", function (req, res) {
        let params = [];
        res.send(lib.globalRender('views/bidentificacion.html', params, req.session));
    });

    app.post("/identificarse", function (req, res) {
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
                    req.session.role = 'admin';
                    res.redirect("/usuarios");
                } else {
                    req.session.role = 'standardUser';
                    res.redirect("/perfil");
                }
            }
        });
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
            gestorBD.eliminarUsuario(criterio, function () {
                res.redirect("/usuarios");
            });
        }
    });

    app.get('/desconectarse', function (req, res) {
        req.session.usuario = null;
        req.session.money = null;
        let params = [];
        res.send(lib.globalRender('views/bidentificacion.html', params, req.session));
    });

};