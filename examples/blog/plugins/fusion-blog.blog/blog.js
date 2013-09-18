/*
 * fusion.io
 *
 * Created by Pascal Mathis at 15.09.13
 * License: GPLv3 (Please see LICENSE for more information)
 */

//noinspection ThisExpressionReferencesGlobalObjectJS
(function() {
    function FusionPlugin(options, imports, exports) {
        var $http = imports['fusion-blog.http'];
        var $model = imports['fusion-blog.model'];

        // GET / - Overview of all blog posts
        $http.get('/', function(req, res) {
            $model.post.getPosts(function(posts) {
                for(var key in posts) {
                    if(posts.hasOwnProperty(key))
                        posts[key].url = '/post/' + key;
                }

                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(JSON.stringify(posts, false, 4));
            });
        });

        // GET /post/[postID] - Displays a single post
        $http.get('/post/([0-9]+)', function(req, res) {
            $model.post.getPost(req.params[0], function(post) {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(JSON.stringify(post, false, 4));
            });
        });
    }

    // Exports the plugin
    var exports = module.exports = FusionPlugin;
}).call(this);