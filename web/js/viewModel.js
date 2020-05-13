const viewModelBuilder = (() => {
    "use strict";

    const STATE_HIDDEN = 'hidden',
        STATE_DISPLAYED_NO_FOCUS = 'displayed',
        STATE_DISPLAYED_WITH_FOCUS = 'focused';

    function buildViewItem(item) {
        return {
            id : item.id,
            text : item.content,
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
                items : viewItems,

                expand() {
                    focusedItem.children.map(viewItems.findById).forEach(child => child.state = STATE_DISPLAYED_NO_FOCUS);
                    changeHandler();
                },

                collapse() {
                    function collapseChildren(item) {
                        item.children.map(viewItems.findById).forEach(child => {
                            child.state = STATE_HIDDEN;
                            collapseChildren(child);
                        });
                    }
                    collapseChildren(focusedItem);
                    changeHandler();
                },

                moveFocus(step) {
                    const visibleItemIds = viewItems.filter(item => item.state !== STATE_HIDDEN).map(item => item.id),
                        focusItemIndex = visibleItemIds.findIndex(id => id === focusedItem.id),
                        newFocusItemIndex = focusItemIndex + step;

                    if (newFocusItemIndex < 0 || newFocusItemIndex >= visibleItemIds.length) {
                        return;
                    }
                    this.setFocus(visibleItemIds[newFocusItemIndex]);
                },

                setFocus(id) {
                    if (id === focusedItem.id) {
                        return;
                    }
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