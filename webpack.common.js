const path = require('path');
const webpack = require('webpack');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {
	mode: 'production',
	entry: {
		app: './src/app.js'
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].bundle.js'
	},
	plugins: [
		new CleanWebpackPlugin(),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: path.resolve(__dirname, 'index.html'),
					to: path.resolve(__dirname, 'dist')
				},
				{
					from: path.resolve(__dirname, 'assets'),
					to: path.resolve(__dirname, 'dist/assets')
				}
			]			
		}),
		new webpack.DefinePlugin({
			'typeof CANVAS_RENDERER': JSON.stringify(true),
			'typeof WEBGL_RENDERER': JSON.stringify(true)
		})
	],
	devServer: {
		contentBase: path.join(__dirname, 'dist'),
		hot: false,
		liveReload: false
	},
	optimization: {
		splitChunks: {
			cacheGroups: {
				commons: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendors',
					chunks: 'all'
				}
			}
		}
	}
}


