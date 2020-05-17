$(() => {
    "use strict";
    const $inputText = $('#inputText'),
        $outputText = $('#outputText'),
        $treeView = $('#treeView'),
        $generateMarkup = $('#generateMarkup'),
        $goButton = $('#go');

    function splitIntoSentences(text) {
        return text.split(/\. |\n+/);
    }

    function transformTree(tree){
        let nextId = 1;
        const result = [];

        function buildResultObject(treeNode, parentId) {
            return {
                id : treeNode.id,
                parentId,
                text : treeNode.name
            }
        }
        function walk(nodes, parentId) {
            nodes.forEach(node => {
                node.id = nextId++;
                result.push(buildResultObject(node, parentId));
                if (node.children) {
                    walk(node.children, node.id);
                }
            });
        }
        walk(tree, 0);

        return result;
    }

    $generateMarkup.click(() => {
        const treeJson = $treeView.tree('toJson'),
            json = transformTree(JSON.parse(treeJson));

        const itemsHtml = json.map(item => {
            const idAttrib = `data-doc-id="${item.id}"`,
                parentAttrib = item.parentId ? ` data-doc-link-parent="${item.parentId}"` : '';
            return `<p ${idAttrib}${parentAttrib}>${item.text.trim()}</p>`;
        });

        $outputText.val(itemsHtml.join('\n'));
    });

    $goButton.click(() => {
        const inputValue = $inputText.val(),
            sentences = splitIntoSentences(inputValue);

        const data = [];
        sentences.filter(s => s.trim()).forEach(sentence => {
            data.push({
                name : sentence,
                children : []
            });
        });

        $treeView.tree('destroy');
        $treeView.tree({
            dragAndDrop: true,
            data
        })
    });

});