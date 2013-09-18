/*
 * fusion.io
 *
 * Created by Pascal Mathis at 15.09.13
 * License: GPLv3 (Please see LICENSE for more information)
 */

//noinspection ThisExpressionReferencesGlobalObjectJS
(function() {
    function FusionPlugin(options, imports, exports) {
        var $db = imports['fusion-blog.db'];

        exports(null, {
            'fusion-blog.model': {
                /** Post model **/
                post: {
                    /**
                     * Returns a list of all available posts
                     *
                     * @param {Function} callback Callback function with signature: function(posts)
                     */
                    getPosts: function(callback) {
                        $db.get('posts', function(posts) {
                            callback(posts);
                        });
                    },

                    getPost: function(post, callback) {
                        $db.get('posts', function(posts) {
                            callback(posts[post]);
                        });
                    }
                }
            }
        });
    }

    // Exports the plugin
    var exports = module.exports = FusionPlugin;
}).call(this);