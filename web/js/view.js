const view = (() => {
    "use strict";

    const CSS_CLASS_ITEM = 'docItem',
        CSS_CLASS_ITEM_HIDDEN = 'docItemHidden',
        CSS_CLASS_ITEM_DISPLAYED = 'docItemDisplayed',
        CSS_CLASS_ITEM_FOCUSED = 'docItemFocus';

    function updateElementFromState(el, state){
        if (state === 'hidden') {
            el.classList.add(CSS_CLASS_ITEM_HIDDEN);
            el.classList.remove(CSS_CLASS_ITEM_DISPLAYED, CSS_CLASS_ITEM_FOCUSED);

        } else if (state === 'displayed') {
            el.classList.add(CSS_CLASS_ITEM_DISPLAYED);
            el.classList.remove(CSS_CLASS_ITEM_HIDDEN, CSS_CLASS_ITEM_FOCUSED);

        } else if (state === 'focused') {
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
                    viewModel.collapse();
                } else if (code === 40) { // Down
                    viewModel.expand();
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