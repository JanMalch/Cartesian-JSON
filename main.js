/** @type {HTMLTextAreaElement} */
const inputTextArea = document.getElementById("input-json");
const inputHintsEl = document.getElementById("input-hints");
const tableOutputEl = document.getElementById("table-output");
const jsonOutputEl = document.getElementById("json-output");

let isValid = false;
let parsedInput = undefined;
let lastMsgId = null;

const storageKey = 'last_input';

const worker = new Worker('worker.js');
worker.onmessage = (e) => {
    const { workerResult, msgId } = e.data;
    if (lastMsgId !== msgId) {
        console.debug(`Ignoring worker result, because input has changed.`)
        return;
    }
    inputHintsEl.innerText = workerResult.inputHintsText;
    tableOutputEl.innerHTML = workerResult.tableOutputText;
    jsonOutputEl.innerHTML = workerResult.jsonOutputText;
    jsonOutputEl.querySelectorAll('textarea').forEach(node => {
        node.style.height = (node.scrollHeight + 1) + 'px';
    })
};

function update() {
    lastMsgId = null;
    const inputText = inputTextArea.value;
    try {
        parsedInput = JSON.parse(inputText);
    } catch (e) {
        isValid = false;
        inputHintsEl.innerText = `${e}`;
        return;
    }
    if (parsedInput == null) {
        isValid = false;
        inputHintsEl.innerText = 'Error: Input must be a JSON object.';
        return;
    }
    if (typeof parsedInput !== 'object') {
        isValid = false;
        inputHintsEl.innerText = 'Error: Input must be a JSON object.';
        return;
    }

    isValid = true;
    localStorage.setItem(storageKey, inputText);
    inputHintsEl.innerText = '…';
    tableOutputEl.innerText = '…';
    jsonOutputEl.innerText = '…';
    const msgId = (Math.random() + 1).toString(36).substring(7);
    lastMsgId = msgId;
    worker.postMessage({ parsedInput, msgId });
}

inputTextArea.value = localStorage.getItem(storageKey) ?? JSON.stringify({ "a": [0, 1], "b": [0, 1], "c": "constant" }, null, 4);
inputTextArea.addEventListener('input', () => update());
inputTextArea.addEventListener('change', () => {
    update();
    if (isValid) {
        inputTextArea.value = JSON.stringify(parsedInput, null, 4);
    }
});
update();