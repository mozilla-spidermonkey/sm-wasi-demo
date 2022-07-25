Online SpiderMonkey WASI shell
==============================

Source code for https://mozilla-spidermonkey.github.io/sm-wasi-demo/

Build Instructions
------------------
1) Run `npm install` to fetch dependencies.
2) Run `npm run build` to generate the output files in `dist/`.
3) Serve files in `dist/` (for example: `cd dist; python3 -m http.server`).

The `data.json` file contains information about `js.wasm` files built on Mozilla's CI.
This file is updated automatically using GitHub Actions. You can also do this manually
by running `python3 update_data_json.py`.
