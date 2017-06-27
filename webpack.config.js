/**
 * Created by rbmenke on 1/19/17.
 */
const webpack = require("webpack");
const glob    = require("glob");

module.exports = {
    entry    : {
        EmojiPicker: './src/js/EmojiPicker.js'
    },
    cache    : true,
    output   : {
        path    : './dist/',
        filename: '[name].js',
        libraryTarget : "umd"
    },
    //uncomment the devtool key for development so that webpack will provide a map to your source
    // devtool  : '#inline-source-map',
    module   : {
        loaders: [
            {
                test  : /\.js$/,
                loader: "babel?presets[]=es2015"
            },
            {
                test  : /\.mustache$/,
                loader: 'mustache?minify'
            }
        ]
    },
    //Since jQuery is a peer-dependency, we leave it here as an external
    externals: {
        "jquery" : "jquery"
    },
    plugins  : [
        //The uglify plugin is used to minify and obfuscate the source code
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ]
};
