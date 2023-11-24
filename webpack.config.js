const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    mode: "development",
    entry: {
        index: "./src/index.js",
        login: "./src/login.js"               //当index和login同时使用index.js的依赖资源，会导致index随着项目规模扩大而变得臃肿
    },
    output: {
        path: path.resolve(__dirname, "./dist"),
        filename: 'js/[name].js'

    },
    module: {
        rules: [{
            test: /\.css$/,
            use: [
                MiniCssExtractPlugin.loader,
                { loader: "css-loader" }
            ]
        },
        {
            test: /\.(png|svg|jpg|jpeg|gif)$/i,
            type: 'asset',
            parser: {
                dataUrlCondition: {
                    maxSize: 8 * 1024,                      //文件大小超过8KB就需要打包到dist下的image文件里面，其他img文件被转换成base64格式在bundle.js中进行存储
                }
            },
            generator: {
                filename: 'images/[name].[hash:6][ext]'           //配置hash是为了图片较多时文件名称重复的问题
            }
        },
        {
            test: /\.ejs/,
            loader: 'ejs-loader',
            options: {
                esModule: false,
            },
        }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: "index.html",
            template: "./src/index.html",
            chunks: ['index']            //允许打包多个html入口文件

        }),
        new HtmlWebpackPlugin({
            filename: "login.html",
            template: "./src/login.html",
            chunks: ['login']
        }),
        new webpack.ProvidePlugin({              //映射jquery的库
            $: 'jquery',
            jQuery: 'jquery'
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, './src/img'),
                    to: path.resolve(__dirname, './dist/img')
                }
            ]
        }),
        //css独立进行打包，减少加载次数
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
            chunkFilename: 'css/[name].chunk.css',
        }),
        //打包的时候清空原dist目录
        new CleanWebpackPlugin(),
    ],
    //开启一个服务，使得改动可以及时反馈到界面上，不需要打包（执行命令：npm run dev||npm start）
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 9000,
        hot: true

    },
    //优化
    /**
     * treeshaking出发条件：
     * 1.通过结构的方式获取方法，可以触发tree shaking，（只有使用到的时候才会触发，可以节约空间）
     * 2.调用的npm包必须使用ESMudle
     * 3.同一文件的tree shaking有触发条件，条件就是mode=production
     * 4.一定要采用解构的方式去引用
     */
    optimization: {
        minimize: true,    //代码压缩注释，空格，换行等等
        usedExports: true,    //treeshaking
        minimizer: [
            new UglifyJsPlugin({ sourceMap: true }),
            new OptimizeCssAssetsPlugin({
                assetNameRegExp: /\.css$/g,
                cssProcessorOptions: {
                    safe: true,
                    autoprefixer: { disable: true },
                    mergeLonghand: false,
                    discardCommments: {
                        removeAll: true  //移除注释
                    }
                }
            })
        ],
        //包的分割
        splitChunks: {
            minSize: 30 * 1024,  //1kb   表示在压缩前的最小模块大小，默认是30Kb
            chunks: 'all',   //同时分割同步和异步代码，推荐
            name: 'common',
            automaticNameDelimiter: '_',    //名称分隔符，默认是_
            cacheGroups: {
                //默认的规则不会打包，需要单独定义
                jquery: {
                    //将query抽出来
                    name: 'jquery',
                    chunks: 'all',
                    test: /jquery\.js/,
                    enforce: true
                },
                'lodash-es': {
                    name: 'lodash-es',
                    test: /lodash-es/,
                    chunks: 'all'
                }
            }

        }
    },


}