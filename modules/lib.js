const swig = require('swig');

function globalRender(route, params, session) {
    params['user'] = session.usuario;
    params['role'] = session.role;
    params['wallet'] = session.money;
    return swig.renderFile(route, params);
}

module.exports = {
    globalRender: globalRender
};