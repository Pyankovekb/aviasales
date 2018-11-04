let path = require('path');
let MiniCssExtractPlugin = require('mini-css-extract-plugin');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: [
        './src/js/index.js',
        './src/style/main.sass'
    ],
    output: {
        filename: './js/main.js'
    },
    devtool: 'source-map',
    module: {
        rules: [{
                    test: /\.js&/,
                    include: path.resolve(__dirname, 'src/js'),
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: 'env'
                    }
                }
                },
                {
                    test: /\.(sass|scss)$/,
                    include: path.resolve(__dirname, 'src/style'),
                    use: ['style-loader', MiniCssExtractPlugin.loader ,'css-loader', 'sass-loader'],
                },
                {
                    test: /\.(png|gif|jpe?g)$/,
                    include: path.resolve(__dirname, 'src/img'),
                    use: [{
                            loader: 'file-loader',
                            options: {
                                name: '[path][name].[ext]'
                            }
                    }, 'img-loader']
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/,
                    include: path.resolve(__dirname, 'src/fonts'),
                    use: [{
                            loader: 'file-loader',
                            options: {
                                name: '[path][name].[ext]'
                            }
                    }]
                }


        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: './css/style.css'
        }),
        new HtmlWebpackPlugin({
            inject: true,
            hash: true,
            template: './src/index.html',
            filename: 'index.html'
        }),
        new CopyWebpackPlugin([{
            from: './src/fonts',
            to: './src/fonts'
        },
        {
            from: './src/img',
            to: './img'
        },
        {
            from: './src/icons',
            to: './icons'
        }])
    ]
}