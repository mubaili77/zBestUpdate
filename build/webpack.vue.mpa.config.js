const path=require('path');
const webpack=require('webpack');
const { CleanWebpackPlugin }=require('clean-webpack-plugin');
const  VueLoaderPlugin  = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const config={
    mode :'development',
    devtool:'eval',
    entry: {
        home:path.resolve(__dirname,'../src/mpa/home.js'),
        login:path.resolve(__dirname,'../src/mpa/login.js'),
    },
    output: {
        filename:'js/[name].js',
        path:path.resolve(__dirname,'../dist'),
    },
    devServer: {
        static: {
            directory:path.resolve(__dirname,'../dist'),
        },
        compress:true,
        port:9000,
        hot:true,
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
            test:/\.vue$/,
            loader:'vue-loader',
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
            filename: "home.html",
            template: path.resolve(__dirname,'../public/index.html'),
            chunks: ['home']            //允许打包多个html入口文件

        }),
        new HtmlWebpackPlugin({
            filename: "login.html",
            template: path.resolve(__dirname,'../public/index.html'),
            chunks: ['login']            //允许打包多个html入口文件

        }),
        new webpack.ProvidePlugin({              //映射jquery的库
            $: 'jquery',
            jQuery: 'jquery'
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, '../src/img'),
                    to: path.resolve(__dirname, '../dist/img')
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
        new VueLoaderPlugin(),
    ],
    optimization: {
        minimize: true,    //代码压缩注释，空格，换行等等
        usedExports: true,    //treeshaking
        minimizer: [
            new UglifyJsPlugin(),
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
module.exports=config;