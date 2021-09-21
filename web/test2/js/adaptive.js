function go() {
    "use strict";
    const container = document.querySelector('doc-container'),
        model = buildModel(container);

    function buildModel(container) {
        function stripText(text) {
            return text.trim().replace(/\s+/g, ' ');
        }
        function getContent(el) {
            if (!el) {
                return;
            }
            return stripText(el.innerHTML);
        }
        const items = [...container.querySelectorAll('doc-item')].map(docItem => {
            return {
                id: docItem.getAttribute('id'),
                summary: getContent(docItem.querySelector('doc-summary')),
                content: getContent(docItem.querySelector('doc-content'))
            };
        });
        console.log(items)
    }

    function updateView() {

    }

    updateView();

}
go();