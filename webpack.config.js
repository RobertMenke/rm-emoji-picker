/**
 * Created by rbmenke on 1/19/17.
 */
const webpack       = require( "webpack" )
const glob          = require( "glob" )
const path          = require('path')
const build_example = false
const is_production = false

const example_entry = {
    demo: './examples/src/demo.js'
}

const lib_entry = {
    EmojiPicker: './src/js/EmojiPicker.js'
}

const example_output = {
    path    : path.join(__dirname, './examples/build/'),
    filename: '[name].js'
}

const lib_output = {
    path         : path.join(__dirname, './dist/'),
    filename     : '[name].js',
    libraryTarget: "umd"
}

const dev_plugins = [
    new webpack.DefinePlugin({
        'process.env' : {
            NODE_ENV : JSON.stringify('development')
        }
    })
]

const prod_plugins = [
    new webpack.DefinePlugin({
        'process.env' : {
            NODE_ENV : JSON.stringify('production')
        }
    }),
    new webpack.optimize.UglifyJsPlugin( {
        compress: {
            warnings: false
        }
    } )
]


module.exports = {
    entry    : lib_entry,
    cache    : true,
    output   : lib_output,
    //uncomment the devtool key for development so that webpack will provide a map to your source
    devtool  : is_production ? false : '#inline-source-map',
    module   : {
        rules: [
            {
                test   : /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use    : {
                    loader : 'babel-loader',
                    options: {
                        presets: [ 'env' ],
                        plugins: [ "transform-flow-strip-types", "transform-object-rest-spread" ]
                    }
                }
            },
            {
                test: /\.mustache/,
                loader: 'mustache-loader'
                // loader: 'mustache-loader?minify'
                // loader: 'mustache-loader?{ minify: { removeComments: false } }'
                // loader: 'mustache-loader?noShortcut'
            }
        ]
    },
    //Since jQuery is a peer-dependency, we leave it here as an external
    externals: build_example ? {} : {
        "jquery": "jquery"
    },
    plugins  : is_production ? prod_plugins : dev_plugins
}
