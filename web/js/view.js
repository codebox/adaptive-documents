const view = (() => {
    "use strict";

    const CSS_CLASS_ITEM = 'docItem',
        CSS_CLASS_ITEM_HIDDEN = 'docItemHidden',
        CSS_CLASS_ITEM_DISPLAYED = 'docItemDisplayed',
        CSS_CLASS_ITEM_PARENT_FOCUSED = 'docItemParentFocus',
        CSS_CLASS_ITEM_FOCUSED = 'docItemFocus';

    function updateElementFromState(el, state){
        el.classList.toggle(CSS_CLASS_ITEM_HIDDEN, !state.visible);
        el.classList.toggle(CSS_CLASS_ITEM_DISPLAYED, state.visible);
        el.classList.toggle(CSS_CLASS_ITEM_FOCUSED, state.hasFocus);
        el.classList.toggle(CSS_CLASS_ITEM_PARENT_FOCUSED, state.parentHasFocus);
    }

    return {
        render(viewModel, targetEl) {
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
            targetEl.innerHTML = '';
            viewModel.items.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.innerText = item.text;
                itemEl.classList.add(CSS_CLASS_ITEM);

                updateElementFromState(itemEl, item.state);

                itemEl.onclick = () => {
                    viewModel.setFocus(item.id);
                    if (item.state.expanded) {
                        viewModel.collapse();
                    } else {
                        viewModel.expand();
                    }
                };
                item.el = itemEl;

                targetEl.appendChild(itemEl);
            });
        },
        updateStates(viewModel) {
            viewModel.items.forEach(item => {
                updateElementFromState(item.el, item.state);
            });
        }
    };
})();