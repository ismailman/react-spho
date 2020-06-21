import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import commonjs from 'rollup-plugin-commonjs';

export default [
  {
    input: './index.tsx',
    output: [{file: './dist/index.js', format: 'cjs'}, {file: './dist/index.es.js', format: 'es'}],
    external: ['react', 'react-dom'],
    plugins: [
      resolve({}),      
      typescript({
        typescript: require('typescript'),
        check: false,
      }),
    ],
  },  
];