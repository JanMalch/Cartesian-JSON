/** @type {HTMLTextAreaElement} */
const inputTextArea = document.getElementById("input-json");
const inputHintsEl = document.getElementById("input-hints");
const tableOutputEl = document.getElementById("table-output");
const jsonOutputEl = document.getElementById("json-output");

let isValid = false;
let parsedInput = undefined;

function update() {
    try {
        parsedInput = JSON.parse(inputTextArea.value);
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
    inputHintsEl.innerText = '';

    const keys = Object.keys(parsedInput);
    if (keys.length === 0) {
        return;
    }
    const baseObj = {};
    const variableEntries = [];
    for (const key of keys) {
        const value = parsedInput[key];
        if (Array.isArray(value)) {
            variableEntries.push([key, value]);
        } else {
            baseObj[key] = value;
        }
    }
    Object.freeze(baseObj);

    inputHintsEl.innerText = '...';
    tableOutputEl.innerHTML = '';
    jsonOutputEl.innerHTML = '';

    const results = variableEntries.reduce((acc, [key, values]) => {
        const result = [];
        for (const obj of acc) {
            for (const value of values) {
                result.push({ ...obj, [key]: value });
            }
        }
        return result;
    }, [{}]);
    inputHintsEl.innerText = `${results.length} products: ${variableEntries.length} variables, ${Object.keys(baseObj).length} constants`;

    let table = '<table><thead><tr><th></th>';
    for (const [key] of variableEntries) {
        table += `<th>${key}</th>`
    }
    table += `</tr></thead><tbody>`;
    for (let i = 0; i < results.length; i++) {
        const result = results[i];

        table += '<tr><td><input type="checkbox"></td>';
        for (const [key] of variableEntries) {
            table += `<td>${result[key]}</td>`;
        }
        table += '</tr>';

        const textareaEl = document.createElement('textarea');
        textareaEl.readOnly = true;
        textareaEl.style.height = 'auto';
        textareaEl.value = JSON.stringify({ ...result, ...baseObj }, null, 4);
        const containerEl = document.createElement('div');
        containerEl.innerHTML = `<input placeholder="Result #${i + 1}">`;
        containerEl.insertAdjacentElement('beforeend', textareaEl);
        jsonOutputEl.appendChild(containerEl);
        textareaEl.style.height = (textareaEl.scrollHeight + 1) + 'px';
    }
    tableOutputEl.innerHTML = table + '</tbody></table>';

}


inputTextArea.value = JSON.stringify({ "a": [0, 1], "b": [0, 1], "c": "constant" }, null, 4);
inputTextArea.addEventListener('input', () => update());
inputTextArea.addEventListener('change', () => {
        update();
    if (isValid) {
        inputTextArea.value = JSON.stringify(parsedInput, null, 4);
    }
});
update();