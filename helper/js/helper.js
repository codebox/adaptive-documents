(() => {
    "use strict";
    const inputEl = document.getElementById('inputText'),
        outputEl = document.getElementById('outputText'),
        goEl = document.getElementById('go'),
        indent = '    '

    inputEl.onkeydown = e => {
        if (e.keyCode === 9) {
            const value = inputEl.value,
                selectionStart = inputEl.selectionStart,
                selectionEnd = inputEl.selectionEnd;
            inputEl.value = value.substring(0, selectionStart) + indent + value.substring(selectionEnd);
            inputEl.selectionStart = inputEl.selectionEnd = selectionStart + indent.length;
            return false;
        }
    };

    goEl.onclick = () => {
        const indentIds = [],
            lines = inputEl.value.split('\n').filter(l => l.trim().length).map((l,i) => {
            const id = i+1,
                indentLevel = Math.floor((l.match(/^ +/) || [''])[0].length / indent.length),
                parentAttrib = indentLevel ? ` data-doc-link-parent="${indentIds[indentLevel-1]}"` : ''
;
                indentIds[indentLevel] = id;

            return `<p data-doc-id="${id}"${parentAttrib}>${l.trim()}</p>`;
        });

        outputEl.value = lines.join('\n');
    };

})();