import { WASI } from '@wasmer/wasi'
import browserBindings from '@wasmer/wasi/lib/bindings/browser'
import { WasmFs } from '@wasmer/wasmfs'

const wasmFilePath = '../js.wasm'
const wasmFs = new WasmFs();
let wasmModule = null;

async function run(source) {
    let isFirstRun = false;
    if (!wasmModule) {
        isFirstRun = true;
        postMessage({status: "Downloading/Compiling Wasm module..."});
        let response = fetch(wasmFilePath);
        wasmModule = await WebAssembly.compileStreaming(response);
    }

    let wasi = new WASI({
        args: [wasmFilePath, "-f", "/input.js",
               "--selfhosted-xdr-path=/selfhosted.bin",
               "--selfhosted-xdr-mode=" + (isFirstRun ? "encode" : "decode")],
        preopens: {'/': '/'},
        env: {},
        bindings: {
            ...browserBindings,
            fs: wasmFs.fs,
        },
    });

    postMessage({status: "Running..."});

    let instance = await WebAssembly.instantiate(wasmModule, wasi.getImports(wasmModule));

    wasmFs.fs.writeFileSync('/input.js', source);

    wasmFs.volume.fds[1].position = 0;
    wasmFs.volume.fds[2].position = 0;
    wasmFs.fs.writeFileSync('/dev/stdout', "");
    wasmFs.fs.writeFileSync('/dev/stderr', "");

    try {
        wasi.start(instance);
    } catch (e) {}

    let stdout = wasmFs.fs.readFileSync('/dev/stdout').toString();
    let stderr = wasmFs.fs.readFileSync('/dev/stderr').toString();
    self.postMessage({stdout, stderr});
};

self.onmessage = function(e) {
    let source = e.data.source;
    run(source);
};
