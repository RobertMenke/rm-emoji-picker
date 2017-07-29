/**
 * Created by rbmenke on 1/19/17.
 */
const webpack       = require( "webpack" )
const glob          = require( "glob" )
const build_example = true
const is_production = true

const example_entry = {
    demo: './examples/src/demo.js'
}

const lib_entry = {
    EmojiPicker: './src/js/EmojiPicker.js'
}

const example_output = {
    path    : './examples/build/',
    filename: '[name].js'
}

const lib_output = {
    path         : './dist/',
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
    entry    : build_example ? example_entry : lib_entry,
    cache    : true,
    output   : build_example ? example_output : lib_output,
    //uncomment the devtool key for development so that webpack will provide a map to your source
    devtool  : is_production ? false : '#inline-source-map',
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
    externals: build_example ? {} : {
        "jquery": "jquery"
    },
    plugins  : is_production ? prod_plugins : dev_plugins
}