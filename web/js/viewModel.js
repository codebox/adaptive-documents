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
        const focusedItem = viewItems.find(item => item.state === STATE_DISPLAYED_NO_FOCUS);
        focusedItem.state = STATE_DISPLAYED_WITH_FOCUS;
        return focusedItem;
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

            let focusedItem = setFocusToFirstVisible(viewItems);
            addChildren(viewItems);
            cleanUp(viewItems);

            let changeHandler = () => {};

            return {
                viewItems,

                expand() {
                    focusedItem.children.forEach(child => child.state = STATE_DISPLAYED_NO_FOCUS);
                    changeHandler();
                },

                collapse() {
                    focusedItem.children.forEach(child => child.state = STATE_HIDDEN);
                    changeHandler();
                },

                setFocus(id) {
                    const newFocusedItem = viewItems.findById(id);
                    console.assert(newFocusedItem.state === STATE_DISPLAYED_NO_FOCUS);

                    focusedItem.state = STATE_DISPLAYED_NO_FOCUS;
                    focusedItem = newFocusedItem;
                    focusedItem.state = STATE_DISPLAYED_WITH_FOCUS;
                    changeHandler();
                },

                onChange(handler) {
                    changeHandler = handler;
                }
            };
        }
    }
})();