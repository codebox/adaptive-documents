const viewModelBuilder = (() => {
    "use strict";

    const STATE_HIDDEN = 'hidden',
        STATE_DISPLAYED_NO_FOCUS = 'displayed',
        STATE_DISPLAYED_WITH_FOCUS = 'focused';

    function buildViewItem(item) {
        return {
            id : item.id,
            state : item.expands ? STATE_HIDDEN : STATE_DISPLAYED_NO_FOCUS
        };
    }

    function setFocusToFirstVisible(viewItems) {
        viewItems.find(item => item.state === STATE_DISPLAYED_NO_FOCUS).state = STATE_DISPLAYED_WITH_FOCUS;
    }

    return {
        build(doc) {
            const viewItems = doc.items.map(buildViewItem);

            setFocusToFirstVisible(viewItems);

            return {
                viewItems
            };
        }
    }
})();