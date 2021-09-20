(() => {
    "use strict";
    const modelBuilder = (() => {
        "use strict";

        const parentElementTypes = ['', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        let nextId = 1;

        function findContainers() {
            return Array.from(document.querySelectorAll('body'));
        }

        function buildDocument(containerEl) {
            function buildItem(el, parentId, level) {
                return {
                    id: `id${nextId++}`,
                    content: el.innerHTML,
                    parentId,
                    level
                };
            }
            function buildParent(item, level) {
                return {item, level};
            }

            const ancestors = [], items = [];

            Array.from(containerEl.children).forEach(childEl => {
                const childTagName = childEl.tagName.toLowerCase(),
                    parentLevel = parentElementTypes.indexOf(childTagName),
                    isParent = parentLevel >= 0;

                if (isParent) {
                    while (ancestors.length && parentLevel <= ancestors[ancestors.length - 1].level) {
                        ancestors.pop();
                    }
                }

                const parent = ancestors.length && ancestors[ancestors.length-1],
                    item = buildItem(childEl, parent && parent.item.id, parent && parent.level);

                items.push(item);

                if (isParent) {
                    ancestors.push(buildParent(item, parentLevel, childTagName));
                }
            });

            return {
                items
            };
        }

        function validateDocument(doc) {
            return true;
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

    const view = (() => {
        "use strict";

        const CSS_CLASS_ITEM = 'docItem',
            CSS_CLASS_ITEM_HIDDEN = 'docItemHidden',
            CSS_CLASS_ITEM_DISPLAYED = 'docItemDisplayed',
            CSS_CLASS_ITEM_PARENT_FOCUSED = 'docItemParentFocus',
            CSS_CLASS_ITEM_FOCUSED = 'docItemFocus',
            CSS_CLASS_ITEM_EXPANDED = 'docItemExpanded',
            CSS_CLASS_DOT_COUNT_PREFIX = 'dotCount';

        function updateElementFromState(el, state){
            el.classList.toggle(CSS_CLASS_ITEM_HIDDEN, !state.visible);
            el.classList.toggle(CSS_CLASS_ITEM_DISPLAYED, state.visible);
            el.classList.toggle(CSS_CLASS_ITEM_FOCUSED, state.hasFocus);
            el.classList.toggle(CSS_CLASS_ITEM_PARENT_FOCUSED, state.parentHasFocus);
            el.classList.toggle(CSS_CLASS_ITEM_EXPANDED, state.expanded);
        }

        function addLinksToHeader() {
            const linkToFont = document.createElement('link');
            linkToFont.setAttribute('rel', 'stylesheet');
            linkToFont.setAttribute('href', 'https://fonts.googleapis.com/css?family=Gentium+Book+Basic|Open+Sans');
            document.head.appendChild(linkToFont);

            const linkToCss = document.createElement('link');
            linkToCss.setAttribute('rel', 'stylesheet');
            linkToCss.setAttribute('href', 'css/adaptive.css');
            document.head.appendChild(linkToCss);
        }

        const statusCol = (() => {
            const idToBar = {};

            return {
                init(viewModel, statusColEl) {
                    const totalCharCount = viewModel.items.reduce((total, item) => total + item.text.length, 0);

                    viewModel.items.forEach(item => {
                        const itemBarEl = document.createElement('div');
                        itemBarEl.classList.add('statusColBar');
                        itemBarEl.style.height = (100 * item.text.length / totalCharCount) + '%';

                        idToBar[item.id] = itemBarEl;

                        statusColEl.appendChild(itemBarEl);
                    });
                },
                updateStatusColFromState(id, state) {
                    const barEl = idToBar[id];
                    barEl.classList.toggle(CSS_CLASS_ITEM_HIDDEN, !state.visible);
                    barEl.classList.toggle(CSS_CLASS_ITEM_DISPLAYED, state.visible);
                    barEl.classList.toggle(CSS_CLASS_ITEM_FOCUSED, state.hasFocus);
                    barEl.classList.toggle(CSS_CLASS_ITEM_PARENT_FOCUSED, state.parentHasFocus);
                    barEl.classList.toggle(CSS_CLASS_ITEM_EXPANDED, state.expanded);
                }
            };
        })();

        return {
            render(viewModel) {
                addLinksToHeader();

                const overlayEl = document.createElement('div');
                overlayEl.innerHTML = `
                <div class="overlay">
                    <div class="contentHead">
                        <h1></h1>
                    </div>
                    <div class="contentBody">
                        <div class="docItems">
                        </div>
                        <div class="statusColumnContainer">
                            <div class="statusColumn">
                            </div>
                        </div>
                    </div>
                </div>
            `;


                const titleEl = overlayEl.querySelector('h1'),
                    docItemsEl = overlayEl.querySelector('.docItems'),
                    statusColEl = overlayEl.querySelector('.statusColumn');

                statusCol.init(viewModel, statusColEl);
                overlayEl.classList.add('overlay');

                document.onkeydown = e => {
                    const code = e.keyCode;

                    if (code === 38) { // Up
                        viewModel.moveFocus().toPrevious();

                    } else if (code === 39) { // Right
                        if (viewModel.getFocusedItem().state.expanded) {
                            viewModel.moveFocus().toNext();
                        } else {
                            viewModel.expand();
                        }

                    } else if (code === 37) { // Left
                        if (viewModel.getFocusedItem().state.expanded) {
                            viewModel.collapse();
                        } else {
                            viewModel.moveFocus().toParent();
                        }

                    } else if (code === 40) { // Down
                        viewModel.moveFocus().toNext();
                    }
                };
                viewModel.items.forEach(item => {
                    const itemEl = document.createElement('div');

                    itemEl.innerHTML = `
                    <div class="docItemPre">
                        <div class="docItemStatusBar"></div>
                        <div class="docItemStatusDot dot1"></div>
                        <div class="docItemStatusDot dot2"></div>
                        <div class="docItemStatusDot dot3"></div>
                        <div class="docItemStatusDot dot4"></div>
                    </div>
                    <div class="docItemContent docItemLevel${item.level}">${item.text}</div>
                    <div class="docItemPost">
                    </div>
                `;

                    itemEl.classList.add(CSS_CLASS_ITEM);
                    itemEl.querySelector('.docItemPre').classList.add(CSS_CLASS_DOT_COUNT_PREFIX + Math.min(4, item.children.length));

                    itemEl.onclick = () => {
                        viewModel.setFocus(item.id);
                        if (item.state.expanded) {
                            viewModel.collapse();
                        } else {
                            viewModel.expand();
                        }
                    };
                    item.el = itemEl;

                    docItemsEl.appendChild(itemEl);
                });

                this.updateStates(viewModel);
                titleEl.innerText = 'Title';

                document.body.appendChild(overlayEl);
            },
            updateStates(viewModel) {
                viewModel.items.forEach(item => {
                    updateElementFromState(item.el, item.state);
                    statusCol.updateStatusColFromState(item.id, item.state);
                });
            }
        };
    })();

    const viewModelBuilder = (() => {
        "use strict";

        function buildViewItem(modelItem) {
            return {
                id : modelItem.id,
                parentId : null,
                text : modelItem.content,
                level: modelItem.level,
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
                    function showExpandedDescendants(item) {
                        item.children.map(findById).forEach(child => {
                            child.state.visible = true;
                            if (child.state.expanded) {
                                showExpandedDescendants(child);
                            }
                        });
                    }
                    const itemToExpand = findById(idToExpand);
                    if (itemToExpand.children.length && itemToExpand.state.expanded === false) {
                        itemToExpand.state.expanded = true;
                        showExpandedDescendants(itemToExpand);
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
                        changeHandler = handler;
                    }
                };
                return viewModel;
            }
        }
    })();


    const model = modelBuilder.build();
    console.log(model);
    const viewModel = viewModelBuilder.build(model.documents[0]);
    console.log(JSON.stringify(viewModel));

    viewModel.onChange(() => view.updateStates(viewModel))
    view.render(viewModel);
})();