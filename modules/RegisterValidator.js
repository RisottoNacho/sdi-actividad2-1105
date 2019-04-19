module.exports = {

    validate: function (user, mongo, pass, confirmPass, funcionCallback) {
        var ms = "";
        if (!validateEmail(user.email))
            ms += "Email inválido\n";
        criterio = {email: user.email}
        mongo.obtenerUsuarios(criterio, function (usuario) {
            if (!(usuario == null || usuario.length == 0))
                ms += "Email existente\n";
        });
        if(confirmPass.localeCompare(pass) != 0)
            ms+="Las contraseñas deben coincidir\n";
        funcionCallback(ms);
    }
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}