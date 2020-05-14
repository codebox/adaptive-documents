const view = (() => {
    "use strict";

    const CSS_CLASS_ITEM = 'docItem',
        CSS_CLASS_ITEM_HIDDEN = 'docItemHidden',
        CSS_CLASS_ITEM_DISPLAYED = 'docItemDisplayed',
        CSS_CLASS_ITEM_FOCUSED = 'docItemFocus';

    function updateElementFromState(el, state){
        if (state === viewModelBuilder.states.hidden) {
            el.classList.add(CSS_CLASS_ITEM_HIDDEN);
            el.classList.remove(CSS_CLASS_ITEM_DISPLAYED, CSS_CLASS_ITEM_FOCUSED);

        } else if (state === viewModelBuilder.states.displayed) {
            el.classList.add(CSS_CLASS_ITEM_DISPLAYED);
            el.classList.remove(CSS_CLASS_ITEM_HIDDEN, CSS_CLASS_ITEM_FOCUSED);

        } else if (state === viewModelBuilder.states.focused) {
            el.classList.add(CSS_CLASS_ITEM_DISPLAYED, CSS_CLASS_ITEM_FOCUSED);
            el.classList.remove(CSS_CLASS_ITEM_HIDDEN);

        } else {
            console.assert('Unexpected viewModel item state: ' + state);
        }
    }

    return {
        render(viewModel, targetEl) {
            document.onkeydown = e => {
                const code = e.keyCode;

                if (code === 38) { // Up
                    viewModel.moveFocus().toPrevious();

                } else if (code === 39) { // Right
                    if (viewModel.getFocusedItem().expanded) {
                        viewModel.moveFocus().toNext();
                    } else {
                        viewModel.expand();
                    }

                } else if (code === 37) { // Left
                    if (viewModel.getFocusedItem().expanded) {
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