var lib = require('./lib.js');

module.exports = function (app, swig, gestorBD) {

    app.get("/usuarios", function (req, res) {
        gestorBD.obtenerUsuarios({}, function (users) {
            var params = [];
            params['lsusers'] = users;
            res.send(lib.globalRender('views/busuarios.html', params, req.session));
        });
    });

    app.get("/registrarse", function (req, res) {
        var params = [];
        res.send(lib.globalRender('views/bregistro.html', params, req.session));
    });

    app.post('/usuario', function (req, res) {
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        if (req.body.password === req.body.confirmPassword) {
            var criterio = {criterio: req.body.email};
            gestorBD.obtenerUsuarios(criterio, function (usuarios) {
                if (!(usuarios == null || usuarios.length == 0))
                    res.redirect("/registrarse?mensaje=El email ya está registrado&tipoMensaje=alert-danger");
                else {
                    var usuario = {
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
        var params = [];
        var respuesta = lib.globalRender('views/bidentificacion.html', params, req.session);
        res.send(respuesta);
    });

    app.post("/delete", function (req, res) {
        var lsDel = req.body.toDelete;
        if (!(lsDel == null || lsDel == 0)) {
            gestorBD.eliminarUsuario(req.body.toDelete, function () {
                gestorBD.obtenerUsuarios({}, function (users) {
                    console.log()
                    var params = [];
                    params['lsusers'] = users;
                    res.send(lib.globalRender('views/busuarios.html', params, req.session));
                });
            });
        }
    });

    app.post("/identificarse", function (req, res) {
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        var criterio = {
            email: req.body.email,
            password: seguro
        }
        gestorBD.obtenerUsuarios(criterio, function (usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                req.session.usuario = null;
                res.redirect("/identificarse" +
                    "?mensaje=Email o password incorrecto" +
                    "&tipoMensaje=alert-danger ");
            } else {
                req.session.usuario = usuarios[0].email;
                var params = [];
                if (usuarios[0].email == "admin@email.com") {
                    gestorBD.obtenerUsuarios({}, function (users) {
                        params['lsusers'] = users;
                        req.session.role = 'admin';
                        res.send(lib.globalRender('views/busuarios.html', params, req.session));
                    });
                } else {
                    req.session.role = 'standardUser';
                    res.send(lib.globalRender('views/bpublicaciones.html', params, req.session));
                }
            }
        });
    });

    app.get('/desconectarse', function (req, res) {
        req.session.usuario = null;
        var params = [];
        res.send(lib.globalRender('views/bidentificacion.html', params, req.session));
    });

};