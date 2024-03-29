const path = require('path');

module.exports = {
    mode: 'production',
    entry: './js/main.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, '../public'),
    },
    module: {
        rules: [{
            test: /\.s[ac]ss$/i,
            use: [
                // Creates `style` nodes from JS strings
                "style-loader",
                // Translates CSS into CommonJS
                "css-loader",
                // Compiles Sass to CSS
                "sass-loader"
            ]
        }],
    },
};
