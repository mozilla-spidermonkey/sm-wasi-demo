import * as monaco from 'monaco-editor'

self.MonacoEnvironment = {
    getWorkerUrl: function(moduleId, label) {
        if (label === "javascript") {
            return "js/ts.worker.js";
        }
        return "js/editor.worker.js";
    },
};

function setOutput(stderr, stdout) {
    document.getElementById("error").textContent = stderr;
    document.getElementById("output").textContent = stdout;
}

let worker = null;
let workerLastSource = null;

let workerIsRunning = false;
let workerKillTimeout = null;

let editor = null;

function executeCode() {
    let source = editor.getValue();
    if (workerIsRunning || source === workerLastSource) {
        return;
    }
    if (worker === null) {
        worker = new Worker(new URL('./worker.js', import.meta.url));
        worker.onmessage = function(e) {
            if (e.data.status) {
                setOutput("", e.data.status);
            } else {
                clearTimeout(workerKillTimeout);
                workerIsRunning = false;
                setOutput(e.data.stderr, e.data.stdout);
            }
        };
    }

    worker.postMessage({source});
    workerLastSource = source;
    workerIsRunning = true;

    workerKillTimeout = setTimeout(function() {
        if (!workerIsRunning) {
            return;
        }
        setOutput("", "Timed out");
        worker.terminate();
        workerIsRunning = false; 
        worker = null;
        executeCode();
    }, 5000);
}

function shareCode() {
    let url = window.location.href.split('?')[0];
    url += "?source=" + encodeURIComponent(editor.getValue()); 
    navigator.clipboard.writeText(url);
}

const initSource = `print("Hello, world!");
print("-".repeat(13));

// help();

var re = /(?<wday>\\w{3}) (?<month>\\w{3}) (?<day>\\d+)/;
var groups = re.exec(new Date()).groups;

for (var [k, v] of Object.entries(groups)) {
    print(k + ":\\t" + v);
}`;

self.onload = function() {
    let params = new URLSearchParams(window.location.search);
    let source = params.has("source") ? decodeURIComponent(params.get("source")) : initSource;

    editor = monaco.editor.create(document.getElementById("editor"), {
        value: source,
        language: 'javascript',
        minimap: {
            enabled: false
        },
        hideCursorInOverviewRuler: true,
        scrollbar: {vertical: "auto"},
        scrollBeyondLastLine: false,
    });

    editor.onDidChangeModelContent(function(model) {
        executeCode();
    });
    executeCode();

    document.getElementById("share").onclick = shareCode;
};
