const path = require('path')
const is_production = process.env.NODE_ENV === "production"

module.exports = {
    entry    : {
        index: './src/js/index.js'
    },
    cache    : true,
    output   : {
        path         : path.join(__dirname, './dist/'),
        filename     : '[name].js',
        libraryTarget: "umd"
    },
    //uncomment the devtool key for development so that webpack will provide a map to your source
    devtool  : is_production ? false : '#inline-source-map',
    module   : {
        rules : [
            {
                test : /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: {
                    presets : [
                        ['env', {
                            targets : {
                                ie : 9
                            }
                        }]
                    ]
                }
            },
            {
                test: /\.mustache|html$/,
                loader: 'mustache-loader'
            }
        ]
    },
    //Since jQuery is a peer-dependency, we leave it here as an external
    externals: {
        "jquery": "jquery"
    }
}
