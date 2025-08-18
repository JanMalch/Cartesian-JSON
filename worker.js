const cache = new Map();

function compute(parsedInput) {
    const workerResult = {
        inputHintsText: '',
        tableOutputText: '',
        jsonOutputText: '',
    }
    const keys = Object.keys(parsedInput);
    if (keys.length === 0) {
        return workerResult;
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

    const results = variableEntries.reduce((acc, [key, values]) => {
        const result = [];
        for (const obj of acc) {
            for (const value of values) {
                result.push({ ...obj, [key]: value });
            }
        }
        return result;
    }, [{}]);
    workerResult.inputHintsText = `${results.length} products: ${variableEntries.length} variables, ${Object.keys(baseObj).length} constants`;

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

        const textareaEl = `<textarea readonly style="height:auto">${JSON.stringify({ ...result, ...baseObj }, null, 4)}</textarea>`;
        const inputEl = `<input placeholder="Result #${i + 1}">`;
        workerResult.jsonOutputText += `<div>${inputEl}${textareaEl}</div>`;
    }
    workerResult.tableOutputText = table + '</tbody></table>';
    return workerResult;
}

onmessage = (e) => {
    const { parsedInput, msgId } = e.data;
    const inputKey = JSON.stringify(parsedInput);
    if (cache.has(inputKey)) {
        console.debug('Cache hit in worker. Skipping computation.');
        postMessage({ workerResult: cache.get(inputKey), msgId });
    } else {
        console.time('Worker computation');
        const workerResult = compute(parsedInput);
        console.timeEnd('Worker computation');
        cache.set(inputKey, workerResult);
        postMessage({ workerResult, msgId });
    }
};
