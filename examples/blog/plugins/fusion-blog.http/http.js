/*
 * fusion.io
 *
 * Created by Pascal Mathis at 15.09.13
 * License: GPLv3 (Please see LICENSE for more information)
 */

//noinspection ThisExpressionReferencesGlobalObjectJS
(function() {
    var http = require('http');

    function FusionPlugin(options, imports, exports) {
        // Default options
        options.port = options.port || 3000;

        // Create a new HTTP server with a basic route handler (NOT for production use)
        var routes = [];
        var server = http.createServer(function(req, res) {
            // Check if any route matches the request URI
            for(var key in routes) {
                if(!routes.hasOwnProperty(key)) continue;
                var route = routes[key];
                var regExp = req.url.match(route.url);

                if(regExp) {
                    req.params = Array.prototype.slice.call(regExp);
                    req.params.shift();
                    route.handler(req, res);
                    return;
                }
            }

            // Send 404
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Site not found.');
        }).listen(options.port);
        console.log('HTTP server listening on port ' + options.port);

        exports(null, {
            'fusion-blog.http': {
                /**
                 * Adds a new handler for a GET route.
                 *
                 * @param url
                 * @param handler
                 */
                get: function(url, handler) {
                    routes.push({
                        url: '^' + url + '$',
                        handler: handler
                    });
                }
            }
        });
    }

    // Exports the plugin
    var exports = module.exports = FusionPlugin;
}).call(this);