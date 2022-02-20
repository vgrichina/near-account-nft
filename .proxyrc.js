const serveStatic = require('serve-static')
const web4 = require('web4-near')

const FORCE_WEB4 = ["yes", "true"].includes((process.env.FORCE_WEB4 || 'no').toLowerCase().trim());

module.exports = function (app) {
    // Use static middleware
    app.use(serveStatic('static'))

    // Proxy to web4
    const web4Callback = web4.callback();
    app.use((req, res, next) => {
        if (req.url.startsWith('/web4') || FORCE_WEB4) {
            web4Callback(req, res, next);
            return;
        }

        next();
    })
}
