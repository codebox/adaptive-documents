function go() {
    "use strict";
    const
        STATE_UNREAD = 'unread',
        STATE_READING = 'reading',
        STATE_READ = 'read',

        CSS_UNREAD = 'unread',
        CSS_READ = 'read',
        CSS_READING = 'reading',

        KEY_UP = 38,
        KEY_DOWN = 40,

        container = document.querySelector('doc-container'),
        model = buildModel(container);

    function changeSelection(delta) {
        const currentIndex = model.items.findIndex(item => item.state === STATE_READING),
            newIndex = currentIndex + delta;
        if (currentIndex >= 0) {
            model.items[currentIndex].state = STATE_READ;
        }
        if (newIndex >= 0 && newIndex < model.items.length) {
            model.items[newIndex].state = STATE_READING;
        }
    }
    function keyHandler(code) {
        if (code === KEY_DOWN) {
            changeSelection(1);
        } else if (code === KEY_UP) {
            changeSelection(-1);
        }
        updateView();
    }

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
            const summaryItems = [...docItem.querySelectorAll('doc-summary doc-bullet')].map(bullet => {
                return {
                    text: getContent(bullet),
                    element: bullet
                };
            }),
            contentElement = docItem.querySelector('doc-content'),
            summaryElement = docItem.querySelector('doc-summary');

            return {
                id: docItem.getAttribute('id'),
                content: getContent(contentElement),
                state: STATE_UNREAD,
                element: docItem,
                contentElement,
                summaryElement,
                summaryItems
            };
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

            const isReading = item.state === STATE_READING;
            item.summaryItems.forEach(summaryItem => {
                summaryItem.element.setAttribute('contenteditable', isReading);
                if (isReading) {
                    summaryItem.element.onkeypress = e => {
                        if (e.keyCode === 13) {
                            summaryItem.element.blur();
                        }
                    };
                } else {
                    summaryItem.element.onkeypress = () => {};
                }
            });

        });
    }

    document.onkeydown = e => keyHandler(e.keyCode);
    [...document.querySelectorAll('doc-content')].forEach(contentElement => {
        contentElement.onmouseup = () => {
            const currentItem = model.items.find(item => item.state === STATE_READING),
                selectedText = document.getSelection().toString();
            if (! selectedText.trim()) {
                return;
            }
            const element = document.createElement('doc-bullet');

            element.innerHTML = selectedText;
            currentItem.summaryElement.appendChild(element);
            element.setAttribute('contenteditable', true);
            currentItem.summaryItems.push({
                text: selectedText,
                element
            });
        };
    });
    updateView();

}
go();