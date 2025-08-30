// This module is responsible for creating and configuring the chart.
export function initialize(data) {
  const f3Chart = f3
    .createChart("#FamilyChart", data)
    .setTransitionTime(1000)
    .setCardXSpacing(270)
    .setCardYSpacing(170)
    .setSingleParentEmptyCard(true, { label: "خالی" })
    .setShowSiblingsOfMain(true)
    .setOrientationVertical()
    .setDuplicateBranchToggle(true)
    .setSortChildrenFunction((a, b) =>
      a.data["birthday"] === b.data["birthday"]
        ? 0
        : a.data["birthday"] > b.data["birthday"]
        ? -1
        : 1
    );

  const f3Card = f3Chart
    .setCard(f3.CardHtml)
    .setCardDisplay([
      ["first name", "last name"],
      ["birthday", "death date"],
    ])
    .setCardDim({ width: 220, height: 90 })
    .setMiniTree(true)
    .setStyle("imageRect")
    .setOnCardUpdate(function (d) {
      const person_card_label = this.querySelector(
        ".card:not(.card-new-rel) .card-label"
      );
      if (!person_card_label) return;
      if (
        !d.data.data["first name"] &&
        !d.data.data["last name"] &&
        !d.data.data["birthday"] &&
        !d.data.data["death date"]
      )
        return;
      person_card_label.innerHTML = `<div>${d.data.data["first name"] ?? ""} ${
        d.data.data["last name"] ?? ""
      }<div style="text-align: center;">${d.data.data["birthday"] ?? ""} ${
        d.data.data["death date"] ? "- " : ""
      }${d.data.data["death date"] ?? ""}</div>`;
    })
    .setOnHoverPathToMain();

  const f3EditTree = f3Chart
    .editTree()
    .fixed(true)
    .setFields(["first name", "last name", "birthday", "death date", "avatar"])
    .setEditFirst(true)
    .setCardClickOpen(f3Card);

  f3EditTree.setEdit();

  // Return the created instances so other modules can use them
  return { f3Chart, f3EditTree };
}
