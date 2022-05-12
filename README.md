Online SpiderMonkey WASI shell
==============================

Build Instructions
------------------
1) Run `npm install` to fetch dependencies.
2) Run `npm run build` to generate the output files in `dist/`.
3) Serve files in `dist/` (for example: `cd dist; python3 -m http.server`).

Updating js.wasm
----------------
1) Compile SpiderMonkey with a mozconfig for WASI.
2) Copy `dist/bin/js` from the SpiderMonkey build directory to `js.wasm`.
3) Run `npx wasm-opt -O4 js.wasm -o js.wasm` to optimize and shrink this file.
