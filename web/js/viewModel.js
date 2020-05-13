const viewModelBuilder = (() => {
    "use strict";

    const STATE_HIDDEN = 'hidden',
        STATE_DISPLAYED_NO_FOCUS = 'displayed',
        STATE_DISPLAYED_WITH_FOCUS = 'focused';

    function buildViewItem(item) {
        return {
            id : item.id,
            modelItem : item,
            state : item.expands ? STATE_HIDDEN : STATE_DISPLAYED_NO_FOCUS,
            children : []
        };
    }

    function setFocusToFirstVisible(viewItems) {
        viewItems.find(item => item.state === STATE_DISPLAYED_NO_FOCUS).state = STATE_DISPLAYED_WITH_FOCUS;
    }

    function addChildren(viewItems) {
        viewItems.forEach(item => {
            if (item.modelItem.expands) {
                viewItems.findById(item.modelItem.expands).children.push(item.id);
            }
        })
    }

    function cleanUp(viewItems) {
        viewItems.forEach(item => delete item.modelItem)
    }

    return {
        build(doc) {
            const viewItems = doc.items.map(buildViewItem);
            viewItems.findById = id => viewItems.find(item => item.id === id);

            setFocusToFirstVisible(viewItems);
            addChildren(viewItems);
            cleanUp(viewItems);

            return {
                viewItems,
                expand(id) {

                },
                collapse(id) {

                },
                setFocus(id) {

                }
            };
        }
    }
})();