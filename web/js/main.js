(() => {
    "use strict";
    const model = modelBuilder.build();
    console.log(JSON.stringify(model));
    const viewModel = viewModelBuilder.build(model.documents[0]);
    console.log(JSON.stringify(viewModel));

    view.render(viewModel, document.getElementById('target'));
})();