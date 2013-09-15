/*
 * fusion.io
 *
 * Created by Pascal Mathis at 15.09.13
 * License: GPLv3 (Please see LICENSE for more information)
 */

(function() {
    function FusionPlugin(options, imports, exports) {
        // GET / - Overview of all blog posts
        imports.http.get('/', function(req, res) {
            imports.model.post.getPosts(function(posts) {
                for(var key in posts) {
                    posts[key].url = '/post/' + key;
                }

                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(JSON.stringify(posts, false, 4));
            });
        });

        // GET /post/[postID] - Displays a single post
        imports.http.get('/post/([0-9]+)', function(req, res) {
            imports.model.post.getPost(req.params[0], function(post) {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(JSON.stringify(post, false, 4));
            });
        });
    }

    // Exports the plugin
    var exports = module.exports = FusionPlugin;
}).call(this);