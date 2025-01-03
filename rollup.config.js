import { spawn } from 'child_process';
import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import css from 'rollup-plugin-css-only';

const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default {
	input: 'src/main.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'docs/build/bundle.js', // Output to "docs" for GitHub Pages compatibility
	},
	plugins: [
		svelte({
			compilerOptions: {
				// Enable runtime checks when not in production
				dev: !production
			}
		}),
		// Extract CSS into a separate file
		css({ output: 'bundle.css' }),

		// Resolve dependencies from node_modules
		resolve({
			browser: true,
			dedupe: ['svelte'],
			exportConditions: ['svelte']
		}),
		commonjs(),

		// Serve during development
		!production && serve(),

		// Reload browser during development
		!production && livereload('docs'),

		// Minify for production
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};
