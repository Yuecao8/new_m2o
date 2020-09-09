/**
 * webpack config
 */

const webpack = require("webpack");
const glob = require('glob');
const path = require('path');

const config = {
    entry: {
        vendor: path.join(__dirname, 'main/scripts/mxu/common/vendor/index.js'),
        main: path.join(__dirname, 'main/index.js'),
    },
    output: {
        path: path.join(__dirname, 'main/scripts/bundle'),
        filename: '[name]/script.js'
    },
    resolve: {
        extensions: ['.js', '.json'],
        alias: {
            'vendor': path.join(__dirname, 'main/scripts/mxu/common/vendor'),
            // 'views': path.join(__dirname, 'views/mxu'),
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'eslint-loader',
                enforce: 'pre',
                include: [path.join(__dirname, 'main/scripts/mxu')],
                options: {
                    formatter: require('eslint-friendly-formatter')
                }
            },
            {
                test: /\.js$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ['env', { 'modules': false }], 'stage-2'
                            ]
                        }
                    }
                ],
                exclude: /libs/
            },
            // {
            //     test: /\.html$/,
            //     use: [{
            //         loader: 'html-loader?attrs=false',
            //         options: {
            //             minimize: false,
            //             removeComments: false,
            //             collapseWhitespace: false,
            //             conservativeCollapse: true,
            //         }
            //     }]
            // }
        ]
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin({
            name: 'main',
            filename: 'public.js'
        })
    ],
};
/**
 * find entries
 */
const files = glob.sync('./main/scripts/+(mxu\-es6)/**/*/index.js', { ignore: './main/scripts/mxu/common/vendor/index.js' });
const newEntries = files.reduce((memo, file) => {
    const name = /(mxu\-es6)\/(.*?)\/index\.js/.exec(file);
    memo[name[2]] = `./main/scripts/${name[1]}/${name[2]}/index.js`;
    return memo;
}, {});
config.entry = Object.assign({}, config.entry, newEntries);

module.exports = config;
