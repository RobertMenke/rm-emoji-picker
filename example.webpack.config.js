const path = require('path')
const is_production = process.env.NODE_ENV === "production"

module.exports = {
    entry    : {
        demo: path.join(__dirname, './examples/src/demo.js')
    },
    cache    : true,
    output   : {
        path    : path.join(__dirname, './examples/build/'),
        filename: '[name].js'
    },
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
    }
}
