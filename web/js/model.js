const modelBuilder = (() => {
    "use strict";

    const ATTRIB_PREFIX = 'data-doc',
        ATTRIB_CONTAINER = `${ATTRIB_PREFIX}-container`,
        ATTRIB_ITEM = `${ATTRIB_PREFIX}-id`,
        ATTRIB_PARENT = `${ATTRIB_PREFIX}-link-parent`;

    function findContainers() {
        return Array.from(document.querySelectorAll(`[${ATTRIB_CONTAINER}]`));
    }

    function findItems(containerEl) {
        return Array.from(containerEl.querySelectorAll(`[${ATTRIB_ITEM}]`));
    }

    function buildItem(itemEl) {
        return {
            id : itemEl.getAttribute(ATTRIB_ITEM),
            parentId : itemEl.getAttribute(ATTRIB_PARENT),
            content : itemEl.innerText
        }
    }

    function buildDocument(containerEl) {
        const items = findItems(containerEl).map(buildItem);

        return {
            items
        };
    }

    function validateDocument(doc) {
        const items = doc.items,
            itemIdSet = items.map(item => item.id).reduce((s,id) => s.add(id), new Set()),
            allIdsAreUnique = itemIdSet.size === items.length,
            allLinksAreValid = items.map(item => item.parentId).filter(linkId => linkId).every(linkId => itemIdSet.has(linkId));

        console.log({allIdsAreUnique, allLinksAreValid});

        return allIdsAreUnique && allLinksAreValid;
    }

    return {
        build() {
            const documents = findContainers().map(buildDocument).filter(validateDocument);

            return {
                documents
            };
        }
    }
})();