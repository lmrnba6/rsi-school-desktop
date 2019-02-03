module.exports = {
    devtool: 'inline-source-map',
    mode: 'development',

    resolve: {
        extensions: ['.ts', '.js']
    },

    externals: { sqlite3: 'commonjs sqlite3' },

    module: {
        rules: [
            {
                test: /\.ts$/,
                loaders: ['awesome-typescript-loader', 'angular2-template-loader']
            },
            {
                test: /\.html$/,
                loader: 'html-loader'

            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                loader: 'null'
            },
        ]
    },

    target:'electron-renderer',
};
