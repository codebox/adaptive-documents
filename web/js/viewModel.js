const viewModelBuilder = (() => {
    "use strict";

    const STATE_HIDDEN = 'hidden',
        STATE_DISPLAYED_NO_FOCUS = 'displayed',
        STATE_DISPLAYED_WITH_FOCUS = 'focused';

    function buildViewItem(item) {
        return {
            id : item.id,
            parentId : null,
            text : item.content,
            modelItem : item,
            state : item.expands ? STATE_HIDDEN : STATE_DISPLAYED_NO_FOCUS,
            expanded : false,
            children : []
        };
    }

    function setFocusToFirstVisible(viewItems) {
        const focusedItem = viewItems.find(item => item.state === STATE_DISPLAYED_NO_FOCUS);
        focusedItem.state = STATE_DISPLAYED_WITH_FOCUS;
        return focusedItem;
    }

    function addChildren(viewItems) {
        viewItems.forEach(viewItem => {
            if (viewItem.modelItem.expands) {
                const parentViewItem = viewItems.findById(viewItem.modelItem.expands);
                parentViewItem.children.push(viewItem.id);
                viewItem.parentId = parentViewItem.id;
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

            const viewModel = {
                items : viewItems,

                expand() {
                    focusedItem.children.map(viewItems.findById).forEach(child => child.state = STATE_DISPLAYED_NO_FOCUS);
                    if (focusedItem.children.length) {
                        focusedItem.expanded = true;
                    }
                    changeHandler();
                },

                collapse() {
                    function collapseChildren(item) {
                        item.expanded = false;
                        item.children.map(viewItems.findById).forEach(child => {
                            child.state = STATE_HIDDEN;
                            collapseChildren(child);
                        });
                    }
                    collapseChildren(focusedItem);
                    changeHandler();
                },

                moveFocus() {
                    function moveByIndex(step) {
                        const visibleItemIds = viewItems.filter(item => item.state !== STATE_HIDDEN).map(item => item.id),
                            focusItemIndex = visibleItemIds.findIndex(id => id === focusedItem.id),
                            newFocusItemIndex = focusItemIndex + step;

                        if (newFocusItemIndex < 0 || newFocusItemIndex >= visibleItemIds.length) {
                            return;
                        }
                        viewModel.setFocus(visibleItemIds[newFocusItemIndex]);
                    }

                    return {
                        toNext() {
                            moveByIndex(1);
                        },
                        toPrevious() {
                            moveByIndex(-1);
                        },
                        toParent() {
                            const parentId = viewModel.getFocusedItem().parentId;
                            if (parentId) {
                                viewModel.setFocus(viewModel.getFocusedItem().parentId);
                            }
                        }
                    };
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

                getFocusedItem() {
                    return focusedItem;
                },

                onChange(handler) {
                    changeHandler = handler;
                }
            };
            return viewModel;
        },
        states : {
            hidden : STATE_HIDDEN,
            displayed : STATE_DISPLAYED_NO_FOCUS,
            focused : STATE_DISPLAYED_WITH_FOCUS
        },
        movements : {

        }
    }
})();