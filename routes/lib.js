var swig = require('swig');

function globalRender(route, params, session) {
    params['user'] = session.usuario;
    params['role'] = session.role;
    return swig.renderFile(route, params);
};

module.exports = {
    globalRender: globalRender
};