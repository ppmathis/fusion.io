/*
 * fusion.io
 *
 * Created by Pascal Mathis at 15.09.13
 * License: GPLv3 (Please see LICENSE for more information)
 */

// Because of fusion.io's intelligent dependency resolution, the order doesn't matter at all!
var exports = module.exports = [
    'fusion-blog.model',
    'fusion-blog.db',
    'fusion-blog.blog',
    {
        pluginName: 'fusion-blog.http',
        port: 8080
    }
];