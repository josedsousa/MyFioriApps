sap.ui.define(
  ["sap/ui/core/mvc/Controller"],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller) {
    "use strict";

    return Controller.extend(
      "productslist.productlist.controller.ProductDetail",
      {
        onInit: function () {
          this.getOwnerComponent()
            .getRouter()
            .getRoute("RouteProductDetail")
            .attachPatternMatched(this.onObjectMatched, this);
        },

        onObjectMatched: function (oEvent) {
          this.getView().bindElement({
            path: "/" + oEvent.getParameter("arguments").ID,
          });
        },
      }
    );
  }
);
