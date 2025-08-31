// This module is responsible for creating and configuring the chart.
import { fa } from "../i18n.js";

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

  // --- We will define f3EditTree earlier, as f3Card needs it ---
  const f3EditTree = f3Chart
    .editTree()
    .fixed(true)
    .setFields(["first name", "last name", "birthday", "death date", "avatar"])
    .setEditFirst(true);

  f3EditTree.setEdit();

  const f3Card = f3Chart
    .setCard(f3.CardHtml)
    .setCardDisplay([
      [],
      ["first name", "last name"],
      ["birthday", "death date"],
    ])
    .setCardDim({ width: 220, height: 90 })
    .setMiniTree(true)
    .setStyle("imageRect")
    .setOnCardUpdate(function (d) {
      // Part 1: Our existing custom label for birth/death date
      const person_card_label = this.querySelector(
        ".card:not(.card-new-rel) .card-label"
      );
      if (person_card_label) {
        person_card_label.innerHTML = `<div>${d.data.data["first name"]} ${
          d.data.data["last name"]
        }<div style="text-align: center;">${d.data.data["birthday"]} ${
          d.data.data["death date"] ? "- " : ""
        }${d.data.data["death date"] ?? ""}</div>`;
      }

      // Part 2: Injecting the new "Edit" and "Add Relative" icons (from the example)
      if (d.data._new_rel_data || f3EditTree.isRemovingRelative()) return;

      d3.select(this).select(".card").style("cursor", "pointer");
      const card = this.querySelector(".card-inner");
      const isPlaceholder = d3
        .select(this)
        .select(".card")
        .classed("card-to-add");

      // Add Edit Icon
      d3.select(card)
        .append("div")
        .attr("class", "f3-svg-circle-hover")
        .attr("title", fa.editPerson) // Add tooltip
        .attr(
          "style",
          "cursor: pointer; width: 28px; height: 28px; position: absolute; top: 0px; left: 0px;"
        )
        .html(f3.icons.userEditSvgIcon())
        .on("click", (e) => {
          e.stopPropagation();
          f3EditTree.open(d);
        });

      if (!isPlaceholder) {
        d3.select(card)
          .append("div")
          .attr("class", "f3-svg-circle-hover")
          .attr("title", fa.addRelative)
          .attr(
            "style",
            "cursor: pointer; width: 28px; height: 28px; position: absolute; top: 0px; left: 24px;"
          )
          .html(f3.icons.userPlusSvgIcon())
          .on("click", (e) => {
            e.stopPropagation();
            f3EditTree.open(d);

            setTimeout(() => {
              const addRelBtn = document.querySelector(".f3-add-relative-btn");
              addRelBtn?.click();
            }, 0);
          });
      }
    })
    .setOnHoverPathToMain();

  // --- NEW: Add the .setOnCardClick handler to control centering/viewing ---
  f3Card.setOnCardClick((e, d) => {
    if (f3EditTree.isAddingRelative()) {
      if (d.data._new_rel_data) {
        f3EditTree.open(d);
      } else {
        f3EditTree.addRelativeInstance.onCancel();
        f3EditTree.closeForm();
        f3Card.onCardClickDefault(e, d);
      }
    } else if (f3EditTree.isRemovingRelative()) {
      f3EditTree.open(d);
    } else {
      if (f3Chart.getMainDatum().id === d.data.id) {
        // If the clicked card is already the main one, open the edit form
        f3EditTree.open(d);
      } else {
        // Otherwise, close any open form and center the tree
        f3EditTree.closeForm();
        f3Card.onCardClickDefault(e, d);
      }
    }
  });

  // --- REMOVE this entire block, as we are now handling clicks manually ---
  /*
  const f3EditTree = f3Chart
    .editTree()
    .fixed(true)
    .setFields(["first name", "last name", "birthday", "death date", "avatar"])
    .setEditFirst(true)
    .setCardClickOpen(f3Card);

  f3EditTree.setEdit();
  */

  // Return the created instances so other modules can use them
  return { f3Chart, f3EditTree };
}

// export function initialize(data) {
//   const f3Chart = f3
//     .createChart("#FamilyChart", data)
//     .setTransitionTime(1000)
//     .setCardXSpacing(270)
//     .setCardYSpacing(170)
//     .setSingleParentEmptyCard(true, { label: "خالی" })
//     .setShowSiblingsOfMain(true)
//     .setOrientationVertical()
//     .setDuplicateBranchToggle(true)
//     .setSortChildrenFunction((a, b) =>
//       a.data["birthday"] === b.data["birthday"]
//         ? 0
//         : a.data["birthday"] > b.data["birthday"]
//         ? -1
//         : 1
//     );

//   const f3Card = f3Chart
//     .setCard(f3.CardHtml)
//     .setCardDisplay([
//       ["first name", "last name"],
//       ["birthday", "death date"],
//     ])
//     .setCardDim({ width: 220, height: 90 })
//     .setMiniTree(true)
//     .setStyle("imageRect")
//     .setOnCardUpdate(function (d) {
//       const person_card_label = this.querySelector(
//         ".card:not(.card-new-rel) .card-label"
//       );
//       if (!person_card_label) return;
//       if (
//         !d.data.data["first name"] &&
//         !d.data.data["last name"] &&
//         !d.data.data["birthday"] &&
//         !d.data.data["death date"]
//       )
//         return;
//       person_card_label.innerHTML = `<div>${d.data.data["first name"] ?? ""} ${
//         d.data.data["last name"] ?? ""
//       }<div style="text-align: center;">${d.data.data["birthday"] ?? ""} ${
//         d.data.data["death date"] ? "- " : ""
//       }${d.data.data["death date"] ?? ""}</div>`;
//     })
//     .setOnHoverPathToMain();

//   const f3EditTree = f3Chart
//     .editTree()
//     .fixed(true)
//     .setFields(["first name", "last name", "birthday", "death date", "avatar"])
//     .setEditFirst(true)
//     .setCardClickOpen(f3Card);

//   f3EditTree.setEdit();

//   // Return the created instances so other modules can use them
//   return { f3Chart, f3EditTree };
// }
