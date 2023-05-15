const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')
const { DefinePlugin } = require('webpack')
module.exports = {
  //打包入口文件路径
  entry: './web/main.ts',
  //path打包出口路径，filename写打包后文件名
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'build.js',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'web/')
    },
    // webpack默认只会加载 '.js', '.json', '.wasm', 使用ts需要单独加上
    extensions: ['.js', '.json', '.wasm', '.jsx', '.ts', '.html']
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /.vue$/,//正则表达式，匹配以.vue结尾的文件
        loader: 'vue-loader'
      },
      {
        test: /\.ts$/, // 处理 .ts 文件
        include: [path.resolve(__dirname, 'web')], // 指定处理的目录
        use: [
          {
            loader: 'ts-loader',
            options: { transpileOnly: true },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader',
          {
            loader: 'sass-loader',
            options: { additionalData: "@import './web/assets/css/mixins.scss';" },
          }
        ]
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new DefinePlugin({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false
    }),
  ]
}