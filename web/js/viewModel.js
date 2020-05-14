const viewModelBuilder = (() => {
    "use strict";

    function buildViewItem(modelItem) {
        return {
            id : modelItem.id,
            parentId : null,
            text : modelItem.content,
            modelItem,
            state : {
                hasFocus : false,
                parentHasFocus : false,
                expanded : false,
                visible : ! modelItem.parentId
            },
            children : []
        };
    }

    return {
        build(doc) {
            const viewItems = doc.items.map(buildViewItem);

            function sanityCheckStates() {
                // Exactly one item has focus
                console.assert(viewItems.filter(item => item.state.hasFocus).length === 1);
                // Item with focus must be visible
                console.assert(viewItems.find(item => item.state.hasFocus).state.visible);
                // All children of item with focus have 'parentHasFocus' set to 'true'
                console.assert(viewItems.find(item => item.state.hasFocus).children.map(findById).every(child => child.state.parentHasFocus));
                // All children of items without focus have 'parentHasFocus' set to 'false'
                console.assert(viewItems.filter(item => !item.state.hasFocus).every(itemWithoutFocus => itemWithoutFocus.children.map(findById).every(child => !child.state.parentHasFocus)));
                // Only items with children can be expanded
                console.assert(viewItems.filter(item => item.state.expanded).every(expandedItem => expandedItem.children.length));
                // All children of expanded items are visible
                // console.assert(viewItems.filter(item => item.state.expanded).every(expandedItem => expandedItem.children.every(child => child.state.visible)));
            }


            function findById(id) {
                const itemsWithId = viewItems.filter(item => item.id === id);
                console.assert(itemsWithId.length === 1, `No item with id '${id} was found`);
                return itemsWithId[0];
            }

            function getFocusedItem() {
                const focusedItems = viewItems.filter(item => item.state.hasFocus);
                console.assert(focusedItems.length === 1);
                return focusedItems[0];
            }

            function setFocus(idToFocus, initial = false) {
                if (!initial && idToFocus === getFocusedItem().id) {
                    return;
                }
                viewItems.forEach(viewItem => {
                    viewItem.state.hasFocus = viewItem.id === idToFocus;
                    viewItem.state.parentHasFocus = viewItem.parentId === idToFocus;
                });
                sanityCheckStates();
                return true;
            }

            function expandIfPossible(idToExpand) {
                const itemToExpand = findById(idToExpand);
                if (itemToExpand.children.length && itemToExpand.state.expanded === false) {
                    itemToExpand.state.expanded = true;
                    itemToExpand.children.map(findById).forEach(child => child.state.visible = true);
                    sanityCheckStates();
                    return true;
                }
            }

            function collapseIfPossible(idToCollapse) {
                function hideAllDescendants(item) {
                    item.children.map(findById).forEach(child => {
                        child.state.visible = false;
                        hideAllDescendants(child);
                    });
                }
                const itemToCollapse = findById(idToCollapse);
                if (itemToCollapse.children.length && itemToCollapse.state.expanded === true) {
                    itemToCollapse.state.expanded = false;
                    hideAllDescendants(itemToCollapse);
                    sanityCheckStates();
                    return true;
                }
            }

            function setFocusToFirstVisible() {
                const firstVisibleItem = viewItems.find(item => item.state.visible);
                setFocus(firstVisibleItem.id, true);
            }

            function addChildren() {
                viewItems.forEach(viewItem => {
                    if (viewItem.modelItem.parentId) {
                        const parentViewItem = findById(viewItem.modelItem.parentId);
                        parentViewItem.children.push(viewItem.id);
                        viewItem.parentId = parentViewItem.id;
                    }
                })
            }

            function cleanUp() {
                viewItems.forEach(item => delete item.modelItem)
            }

            addChildren(viewItems);
            setFocusToFirstVisible(viewItems);
            cleanUp(viewItems);

            let changeHandler = () => {};

            const viewModel = {
                items : viewItems,

                expand() {
                    const focusedItem = getFocusedItem(),
                        expandPerformed = expandIfPossible(focusedItem.id);

                    if (expandPerformed) {
                        changeHandler();
                    }
                },

                collapse() {
                    const focusedItem = getFocusedItem(),
                        collapsePerformed = collapseIfPossible(focusedItem.id);

                    if (collapsePerformed) {
                        changeHandler();
                    }
                },

                moveFocus() {
                    function moveByIndex(step) {
                        const visibleItemIds = viewItems.filter(item => item.state.visible).map(item => item.id),
                            focusedItemId = getFocusedItem().id,
                            focusItemIndex = visibleItemIds.findIndex(id => id === focusedItemId),
                            newFocusItemIndex = focusItemIndex + step;

                        if (newFocusItemIndex < 0 || newFocusItemIndex >= visibleItemIds.length) {
                            return;
                        }
                        setFocus(visibleItemIds[newFocusItemIndex]);
                        changeHandler();
                    }

                    return {
                        toNext() {
                            moveByIndex(1);
                        },
                        toPrevious() {
                            moveByIndex(-1);
                        },
                        toParent() {
                            const parentId = getFocusedItem().parentId;
                            if (parentId) {
                                setFocus(parentId);
                                changeHandler();
                            }
                        }
                    };
                },

                setFocus(id) {
                    const focusChanged = setFocus(id);
                    if (focusChanged) {
                        changeHandler();
                    }
                },

                getFocusedItem() {
                    return getFocusedItem();
                },

                onChange(handler) {
                    changeHandler = () => {
                        console.log(JSON.stringify(viewItems, null, 4))
                        handler()
                    };
                }
            };
            return viewModel;
        }
    }
})();