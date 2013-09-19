# fusion.io #

[![build status](https://secure.travis-ci.org/NeoXiD/fusion.io.png)](http://travis-ci.org/NeoXiD/fusion.io)

fusion.io is fast and lightweight plugin system for Node.js applications. This module
follows the philosophy *everything's a plugin™*, which effectively means that your whole
application is just built on top of a bunch of plugins. They can interact and rely on each other,
without worrying about dependency resolving & injection.

## How it works ##
As mentioned above, the principle of fusion.io is that your whole application
is built on top of some plugins. Worried about dependency resolving & injection?
fusion.io handles these things for you!

## License & Requirements ##
GPL v3 - Please see LICENSE for more information.
No requirements except Node.js >= 0.6.x

## Application skeleton ##
### app.js ###
This is your main application file, which should be named *app,js*. Usually it should only
contain around 5 lines, thanks to fusion.io:
```js
var FusionIO = require('fusion.io');
var app = new FusionIO();
app.setRootPath(__dirname);     // Specifies where the 'plugins' folder is located, usually __dirname is correct
app.loadConfig('config.js');
app.createApp();
```

### config.js ###
This file contains all active plugins and their configuration, if necessary.
It should be loaded by *loadConfig* before creating the application. Currently, multiple configurations
can *NOT* be merged together. Example configuration:
```js
var exports = module.exports = [
  // How to require a plugin without any options
  {
    pluginName: 'fusion-blog.db'
  },
  
  // Shortcut to require plugins without any options
  'fusion-blog.model',
  
  // Require a plugin with some options
  {
    pluginName: 'fusion-blog.http',
    port: 8080
  }
];
```

### plugins/ ###
This is your plugin folder - each plugin should have its own folder within the *plugins* folder.
To prevent duplicates, you should prefix your plugins with the project name, your vendor name or anything you like.
Remember, you *must* specify the plugin name later on for dependency injection, so it shouldn't be too long.

**Example:** *fusion-blog.db* - *fusion-blog* is the product name, and *db* the plugin name.

## Plugin skeleton ##
### package.json ###
Every fusion.io plugin *needs* a package.json. It has two advances: First, you can easily use npm with your plugins.
Second, all the required plugin dependencies and exports can be easily specified and changed. You interchanged
a logging plugin with another one? Just edit the package.json to point to the new plugin. Example:
```js
{
    "name": "fusion-example.kitten-demo",   // Optional metadata, can be used with NPM
    "version": "1.0.0",     // Optional metadata, can be used with NPM
    "main": "kitten.js",    // Must point to the main plugin file
    "private": true,        // Optional metadata, can be used with NPM

    "fusionio": {
        // Import 2 plugins, thats all you need to do...
        "imports": [
            "fusion-blog.db",
            "fusion-example.kitten-milk"
        ],
        
        // Export one plugin (hint: you can export more than just one plugin)
        "exports": [
          "fusion-example.kitten"
        ]
    }
}
```

### kitten.js ###
This file can have any name, as long as it is specified in the *main* property of the *package.json* file.
As you might have guessed already, it represents your main plugin file, which should be built like this:

```js
/**
 * This method gets called by the fusion.io core. There will always be exactly 3 arguments provided.
 * {options} is an object which contains all configuration values (which where specified in the application config)
 * {imports} contains all your imports specified in package.json, with exactly the same name.
 * {exports} This is a function with the signature: function(err, exports).
 *            If an error occured while initialitzing the plugin, pass the error to err.
 *            If everything went fine, pass an object containing functions to exports.
 */
function FusionPlugin(options, imports, exports) {
  var $db = imports['fusion-blog.db'];
  var $milk = imports['fusion-example.kitten-milk'];
  
  exports(null, {
    meow: function(hello, world) {
      return $milk.mixWithChocolate($db.fetchMilk());
    }
  });
}

// Exports the plugin
var exports = module.exports = FusionPlugin;
```

- - -
fusion.io plugin system - © 2013 Pascal Mathis <dev@snapserv.net>