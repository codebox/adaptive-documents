function go() {
    "use strict";
    const
        STATE_UNREAD = 'unread',
        STATE_READING = 'reading',
        STATE_READ = 'read',

        CSS_UNREAD = 'unread',
        CSS_READ = 'read',
        CSS_READING = 'reading',

        container = document.querySelector('doc-container'),
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
        function clickHandler(item) {
            if ([STATE_UNREAD, STATE_READ].includes(item.state)) {
                model.items.forEach(item => {
                    if (item.state === STATE_READING) {
                        item.state = STATE_READ;
                    }
                });
                item.state = STATE_READING;

            } else if (item.state === STATE_READING) {
                item.state = STATE_READ;
            }

            updateView();
        }
        const items = [...container.querySelectorAll('doc-item')].map(docItem => {
            const item = {
                id: docItem.getAttribute('id'),
                summary: getContent(docItem.querySelector('doc-summary')),
                content: getContent(docItem.querySelector('doc-content')),
                state: STATE_UNREAD,
                element: docItem
            };
            docItem.onclick = () => {
                clickHandler(item);
            };
            return item;
        });

        return {
            items
        };
    }

    function updateView() {
        model.items.forEach(item => {
            item.element.classList.toggle(CSS_READ, item.state === STATE_READ);
            item.element.classList.toggle(CSS_READING, item.state === STATE_READING);
            item.element.classList.toggle(CSS_UNREAD, item.state === STATE_UNREAD);
        });
    }

    updateView();

}
go();