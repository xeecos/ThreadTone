var path = require("path");
var webpack = require("webpack");
var HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = [
    {
        entry: [
            "babel-polyfill", "./src/web/entry.jsx"
        ],
        output: {
            path: path.resolve(__dirname, "./bundle/web/"),
            publicPath: "/bundle/",
            filename: "js/bundle.js"
        },
        target: "electron",
        module: {
            loaders: [
                {
                    test: /\.(js|jsx)$/,
                    loader: "babel-loader",
                    exclude: [/node_modules/, "./node"]
                }, {
                    test: /\.(png|jpg|gif|svg)$/,
                    loader: "file-loader",
                    include: [path.resolve(__dirname, "./src/assets")],
                    query: {
                        name: "./src/web/assets/[name].[ext]?[hash]"
                    }
                }, {
                    test: /\.node$/,
                    loader: "node-loader"
                }, {
                    test: /\.css$/,
                    loader: "style-loader!css-loader"
                }
            ]
        },
        externals: {
            serialport: "commonjs serialport",
            debug: "commonjs debug"
        },
        plugins: [new HtmlWebpackPlugin({title: "index", filename: "index.html", template: "./src/templates/index.html", inject: false})]
    }, {
        entry: "./src/app/entry.js",
        output: {
            path: path.resolve(__dirname, "./bundle/app"),
            publicPath: "/bundle/",
            filename: "bundle.js"
        },
        target: "electron",
        module: {
            exprContextCritical: true,
            wrappedContextCritical: true,
            wrappedContextRecursive: true,
            wrappedContextRegExp: /^\.\//,
            exprContextRegExp: /^\.\//,
            unknownContextRegExp: /^\.\//,
            loaders: [
                {
                    test: /\.js$/,
                    loader: "babel-loader",
                    include: [path.resolve(__dirname, "./src/app")],
                    exclude: [/node_modules/, /extensions/]
                }
            ],
            rules: [
                {
                    test: /\.node$/,
                    use: "node-loader"
                }
            ]
        },
        resolve: {
            modules: [path.resolve("./node_modules")]
        },
        externals: {
            serialport: "commonjs serialport",
            debug: "commonjs debug"
        },
        plugins: [new webpack.DefinePlugin({$dirname: "__dirname"})]
    }
];