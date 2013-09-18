/*
 * fusion.io
 *
 * Created by Pascal Mathis at 18.09.13
 * License: GPLv3 (Please see LICENSE for more information)
 */

var fusionio = require('../lib');
var should = require('should');
var path = require('path');

describe('fusion.io - Generic tests', function() {
    var app = null;

    beforeEach(function() {
        // Always start with a new fusionio instance
        app = new fusionio();
    });

    it('starting the application without specifying the root path before should throw an error', function(done) {
        (function() {
            app.createApp();
        }).should.throw('You need to specify the path which points to the application root before.');
        return done();
    });

    it('starting the application without loading any configuration before should throw an error', function(done) {
        app.setRootPath(__dirname);
        (function() {
            app.createApp();
        }).should.throw('You need to load a configuration before.');
        return done();
    });

    it('specifying an invalid root path should throw an error', function(done) {
        (function() {
            app.setRootPath('/does/never/ever/exist');
        }).should.throw(/Root path '[a-z\/]+' does not exist./);
        return done();
    });

    it('loading an inexistant configuration file should throw an error', function(done) {
        app.setRootPath(__dirname);
        (function() {
            app.loadConfig('/does/not/exist.cfg');
        }).should.throw('Config file \'/does/not/exist.cfg\' does not exist.');
        return done();
    });

    it('loading an configuration which is not a javascript file should throw an error', function(done) {
        app.setRootPath(__dirname);
        var configPath = path.join('data', 'invalid-config.cfg');
        (function() {
            app.loadConfig(configPath);
        }).should.throw('Config file \'' + configPath + '\' is invalid.');
        return done();
    });

    it('loading an empty configuration (without any plugins) and starting the application should throw an error', function(done) {
        app.setRootPath(__dirname);
        app.loadConfig(path.join('data', 'empty-config.js'));
        (function() {
            app.createApp();
        }).should.throw('Slow down! It\'s great that you are so enthusiastic about using fusion.io, but you need to specify some plugins in the configuration file before - otherwise it won\'t do anything at all!');
        return done();
    });
});