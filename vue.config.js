// eslint-disable-next-line @typescript-eslint/no-var-requires
const {defineConfig} = require('@vue/cli-service');

module.exports = defineConfig({
    transpileDependencies: true,
    pages: {
        index: {
            entry: "./src/main.ts", title: "Luka"
        }
    }, devServer: {
        historyApiFallback: true,
        allowedHosts: "all",
        // host:"192.168.193.65",
        port: 8080, // 端口
        /*https: true,
        proxy: {
            //请求路径关键字
            '/api': {
                target: 'http://192.168.193.216:9125', //对应自己的接口
                changeOrigin: true,//是否允许跨域,创建一个虚拟服务端
                ws: true,
                pathRewrite: {
                    //别名 例如 http://192.168.193.216:9125/index => /api/index
                    '^/api': ''
                }
            }
        }*/
    },
    chainWebpack: (config) => {
        config.plugin('define').tap((definitions) => {
            Object.assign(definitions[0], {
                __VUE_OPTIONS_API__: 'true',
                __VUE_PROD_DEVTOOLS__: 'false',
                __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
            })
            return definitions;
        })
        config.resolve.extensions
            .add(".ts")
            .add(".tsx")
            .add(".js")
            .add(".json");
        config.module
            .rule("ts")
            .exclude
            .add(/node_modules/)
            .end()
            .test(/\.tsx?$/)
            .use("ts-loader")
            .loader("ts-loader")
            .options({
                appendTsSuffixTo: [/\.vue$/]
            })
            .end()

        config.module
            .rule("tsl")
            .exclude
            .add(/node_modules/)
            .end()
            .test(/\.ts$/)
            .pre()
            .use("tslint-loader")
            .loader("tslint-loader")
            .end()
            .end();

        config.module
            .rule("glsl")
            .test(/\.(glsl|vs|fs|vert|frag)$/)
            .exclude
            .add(/node_modules/)
            .end()
            .use("glsl-shader-loader")
            .loader("glsl-shader-loader")
            .end();
    },
    // configureWebpack: {
    //     resolve: {
    //         extensions: [".ts", ".tsx", ".js", ".json"],
    //     },
    //     module: {
    //         rules: [
    //             {
    //                 test: /\.ts$/,
    //                 exclude: /node_modules/,
    //                 enforce: 'pre',
    //                 loader: 'tslint-loader'
    //             },
    //             {
    //                 test: /\.tsx?$/,
    //                 loader: 'ts-loader',
    //                 exclude: /node_modules/,
    //                 options: {
    //                     appendTsSuffixTo: [/\.vue$/],
    //                 }
    //             },
    //         ]
    //     },
    // },
});
