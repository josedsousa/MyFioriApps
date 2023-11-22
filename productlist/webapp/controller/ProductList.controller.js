sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, Filter, FilterOperator, JSONModel) {
    "use strict";

    return Controller.extend(
      "productslist.productlist.controller.ProductList",
      {
        onInit: function () {
          this.oFilterBar = this.getView().byId("filterBar");
          this.oTable = this.getView().byId("table");
          this.oSearchField = this.getView().byId("searchField");

          var that = this,
            oModel = new JSONModel();

          // var obj = oModel.getObject("/Products(0)");
          // Model not loaded at this point, therefore method getObject() will not return data
          this.getRatings(this.getOwnerComponent().getModel()).then(function (
            value
          ) {
            oModel.setData(value);
            that.getView().setModel(oModel, "ratingsModel");
          });
        },

        getRatings: function (oModel) {
          return new Promise((resolve) => {
            oModel.read("/Products", {
              success: function (oResponse) {
                var ratings = new Set([]),
                  ratingsJSON = { ratings: [] };

                oResponse.results.map(function (value) {
                  //A set is used in order to remove duplicates
                  ratings.add(value.Rating);
                });

                ratings.forEach(function (value) {
                  ratingsJSON.ratings.push({ value: value });
                });

                //Sort in descending order
                ratingsJSON.ratings.sort(function (a, b) {
                  return a.value - b.value;
                });

                resolve(ratingsJSON);
              },
            });
          });
        },

        onSearch: function (event) {
          var aTableFilters = [];

          aTableFilters = this.oFilterBar
            .getFilterGroupItems()
            .reduce(function (aResult, oFilterGroupItem) {
              var oControl = oFilterGroupItem.getControl(),
                controlType = oControl.getMetadata().getName();

              switch (controlType) {
                case "sap.m.DatePicker":
                  var oBeginDate = oControl.getDateValue();

                  if (oBeginDate) {
                    var oEndDate = new Date(oBeginDate);
                    oEndDate.setHours(23, 59, 59);

                    aResult.push(
                      new Filter({
                        path: oFilterGroupItem.getName(),
                        operator: FilterOperator.BT,
                        value1: oBeginDate,
                        value2: oEndDate,
                      })
                    );
                  }
                  break;

                default:
                  var inputValue = oControl.getValue();

                  if (inputValue) {
                    aResult.push(
                      new Filter({
                        path: oFilterGroupItem.getName(),
                        operator: FilterOperator.EQ,
                        value1: inputValue,
                      })
                    );
                  }
                  break;
              }

              return aResult;
            }, []);

          if (this.oSearchField.getValue()) {
            aTableFilters.push(
              new Filter({
                filters: [
                  new Filter({
                    path: "Name",
                    operator: FilterOperator.Contains,
                    value1: this.oSearchField.getValue(),
                    caseSensitive: false,
                  }),
                  new Filter({
                    path: "Description",
                    operator: FilterOperator.Contains,
                    value1: this.oSearchField.getValue(),
                    caseSensitive: false,
                  }),
                ],
                and: false,
              })
            );
          }

          this.oTable.getBinding("items").filter(aTableFilters);
          this.oTable.setShowOverlay(false);
        },
      }
    );
  }
);
