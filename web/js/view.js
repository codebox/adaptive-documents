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
        linkToCss.setAttribute('href', 'css/main.css');
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
                    <div class="docItemContent">${item.text}</div>
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