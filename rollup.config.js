import svelte from 'rollup-plugin-svelte'
import buble from 'rollup-plugin-buble'
import uglify from 'rollup-plugin-uglify'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
// import livereload from 'rollup-plugin-livereload'

const plugins = [
	svelte(),
	nodeResolve({
    jsnext: true,
    browser: true,
    main: true,
	}),
	commonjs({
//		namedExports: {
//			'node_modules/three/build/three.js': ['WebGLRenderer', 'PerspectiveCamera', 'Scene', 'BoxGeometry', 'PlaneGeometry', 'MeshBasicMaterial', 'Mesh'],
//		}
	}),
]
if ( process.env.production ) plugins.push( buble(), uglify() )
// else plugins.push(livereload())

export default {
	entry: 'src/app.js',
	dest: 'dist/bundle.js',
	format: 'iife',
	plugins,
	sourceMap: true,
}
