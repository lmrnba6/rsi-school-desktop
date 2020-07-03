var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        'polyfills': './source/polyfills.ts',
        'vendor': './source/vendor.ts',
        'app': './source/main.ts'
    },

    resolve: {
        extensions: ['.ts', '.js']
    },

    externals: {
        sqlite3: 'commonjs sqlite3',
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /\.spec\.ts$/,
                use: ['awesome-typescript-loader', 'angular2-template-loader']
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader'
                    },
                ]
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                use: 'file-loader?name=[name].[ext]'
            },
			{
				test: /\.scss$/,
                use: [
                    {
                        loader: "style-loader"
                    },
                    {
                        loader: 'postcss-loader', // Run post css actions
                        options: {
                            plugins: function () { // post css plugins, can be exported to postcss.config.js
                                return [
                                    require('precss'),
                                    require('autoprefixer')
                                ];
                            }
                        }
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            includePaths: [
                                path.resolve(__dirname, '../source/assets/sass'),
                                path.resolve(__dirname, '../node_modules/bootstrap/scss'),
                            ]
                        }
                    }
                ]
			},
        ]
    },

    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
            Popper: ['popper.js', 'default'],
        }),
        new HtmlWebpackPlugin({template: 'source/index.html'}),
		new CopyWebpackPlugin([
            { from: 'source/assets', to: 'assets' },
        ]),
        new webpack.ContextReplacementPlugin(
            /angular(\\|\/)core(\\|\/)(@angular|esm5)/,
            path.resolve(__dirname, '../source')
        ),
        new webpack.IgnorePlugin(/^pg-native$/)
    ],

    target:'electron-renderer'
};
