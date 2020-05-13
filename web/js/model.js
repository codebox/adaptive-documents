const modelBuilder = (() => {
    "use strict";

    const ATTRIB_PREFIX = 'data-doc',
        ATTRIB_CONTAINER = `${ATTRIB_PREFIX}-container`,
        ATTRIB_ITEM = `${ATTRIB_PREFIX}-id`;

    function findContainers() {
        return Array.from(document.querySelectorAll(`[${ATTRIB_CONTAINER}]`));
    }

    function findItems(containerEl) {
        return Array.from(containerEl.querySelectorAll(`[${ATTRIB_ITEM}]`));
    }

    function buildItem(itemEl) {
        return {
            id : itemEl.getAttribute(ATTRIB_ITEM)
        }
    }

    function buildDocument(containerEl) {
        const items = findItems(containerEl).map(buildItem);
        return {
            items
        };
    }

    return {
        build() {
            const documents = findContainers().map(buildDocument);

            return {
                documents
            };
        }
    }
})();