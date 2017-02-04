/**
 * Created by rbmenke on 1/19/17.
 */
const webpack = require("webpack");
const path    = require("path");
const glob    = require("glob");

module.exports = {
    entry    : {
        // EmojiPicker: './src/js/EmojiPicker.js'
        demo : './examples/src/demo.js'
    },
    // devtool : '#inline-source-map',
    cache    : true,
    output   : {
        // path    : './dist/',
        path    : './examples/build/',
        filename: '[name].js',
        // libraryTarget : "umd"
    },
    // devtool  : '#inline-source-map',
    module   : {
        loaders: [
            {
                test  : /\.js$/,
                loader: "babel?presets[]=es2015"
                // include : path.join(__dirname, 'lib')
            },
            {
                test  : /\.mustache$/,
                // loader: 'mustache'
                loader: 'mustache?minify'
                // loader: 'mustache?{ minify: { removeComments: false } }'
                // loader: 'mustache?noShortcut'
            }
        ]
    },
    // externals: {
    //     "jquery" : "jquery"
    //
    // },
    plugins  : [
        // new webpack.optimize.UglifyJsPlugin({
        //     compress: {
        //         warnings: false
        //     }
        // })
    ]
};