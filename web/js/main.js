(() => {
    "use strict";
    const model = modelBuilder.build();
    console.log(JSON.stringify(model));
    const viewModel = viewModelBuilder.build(model.documents[0]);
    console.log(JSON.stringify(viewModel));

    viewModel.onChange(() => view.updateStates(viewModel))
    view.render(viewModel, document.getElementById('target'));
})();