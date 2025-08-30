// js/components/chartEnhancements.js
import { fa } from "../i18n.js";

// --- CONFIGURATION: Defines rules for each relationship type ---
const RELATIONSHIP_RULES = {
  spouse: {
    type: "spouse",
    buttonTextKey: "linkExistingPerson",
    modalTitleKey: "selectSpouse",
    successRelationKey: "spouse",
  },
  father: {
    type: "parent",
    buttonTextKey: "linkExistingPerson",
    modalTitleKey: "selectParent",
    successRelationKey: "father",
    gender: "M",
  },
  mother: {
    type: "parent",
    buttonTextKey: "linkExistingPerson",
    modalTitleKey: "selectParent",
    successRelationKey: "mother",
    gender: "F",
  },
  son: {
    type: "child",
    buttonTextKey: "linkExistingPerson",
    modalTitleKey: "selectChild",
    successRelationKey: "son",
    gender: "M",
  },
  daughter: {
    type: "child",
    buttonTextKey: "linkExistingPerson",
    modalTitleKey: "selectChild",
    successRelationKey: "daughter",
    gender: "F",
  },
};

/**
 * The central logic for connecting two people in the data store.
 * @param {string} p1Id - The ID of the person initiating the link.
 * @param {string} p2Id - The ID of the person being linked.
 * @param {string} relType - The type of relationship from p1's perspective (e.g., 'father', 'son').
 * @param {Array} store - The live data store from the chart.
 */
function linkPeople(p1Id, p2Id, relType, store) {
  const p1 = store.find((p) => p.id === p1Id);
  const p2 = store.find((p) => p.id === p2Id);
  if (!p1 || !p2) return;

  const rule = RELATIONSHIP_RULES[relType];

  switch (rule.type) {
    case "spouse":
      if (!p1.rels.spouses) p1.rels.spouses = [];
      if (!p1.rels.spouses.includes(p2Id)) p1.rels.spouses.push(p2Id);
      if (!p2.rels.spouses) p2.rels.spouses = [];
      if (!p2.rels.spouses.includes(p1Id)) p2.rels.spouses.push(p1Id);
      break;
    case "parent":
      p1.rels[relType] = p2Id; // Set father or mother on p1 (the child)
      if (!p2.rels.children) p2.rels.children = [];
      if (!p2.rels.children.includes(p1Id)) p2.rels.children.push(p1Id);
      break;
    case "child":
      const parentRel = p1.data.gender === "M" ? "father" : "mother";
      p2.rels[parentRel] = p1Id; // Set parent on p2 (the child)
      if (!p1.rels.children) p1.rels.children = [];
      if (!p1.rels.children.includes(p2Id)) p1.rels.children.push(p2Id);
      break;
  }
}
/**
 * Opens a generic modal to select and link an existing person.
 */
function openLinkExistingPersonModal(
  currentPersonId,
  relType,
  f3Chart,
  f3EditTree
) {
  const rule = RELATIONSHIP_RULES[relType];
  const allPeople = f3EditTree.getStoreDataCopy();
  const currentPerson = allPeople.find((p) => p.id === currentPersonId);

  // Define all relatives of the current person to exclude them from the list
  const existingRelationsIds = new Set(
    [
      currentPersonId,
      ...(currentPerson.rels.spouses || []),
      ...(currentPerson.rels.children || []),
      ...(currentPerson.rels.parents || []),
      currentPerson.rels.father,
      currentPerson.rels.mother,
    ].filter(Boolean)
  );

  // Filter people by relationship and gender
  let eligiblePeople = allPeople.filter((p) => !existingRelationsIds.has(p.id));
  if (rule.gender) {
    eligiblePeople = eligiblePeople.filter(
      (p) => p.data.gender === rule.gender || !p.data.gender
    );
  }

  const modalOverlay = document.createElement("div");
  modalOverlay.className = "spouse-selector-modal-overlay";
  modalOverlay.innerHTML = `
        <div class="spouse-selector-modal">
            <div class="spouse-selector-modal-header">
                <h3>${fa[rule.modalTitleKey]}</h3>
                <button class="modal-close" aria-label="Close dialog" style="background:none; border:none; cursor:pointer;">
                    <svg viewBox="0 0 24 24" style="width: 24px; height: 24px;"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                </button>
            </div>
            <div class="spouse-selector-modal-body">
                <input type="text" placeholder="${
                  fa.search
                }" /><div class="spouse-selector-results"></div>
            </div>
        </div>`;
  document.body.appendChild(modalOverlay);

  const searchInput = modalOverlay.querySelector("input");
  const resultsContainer = modalOverlay.querySelector(
    ".spouse-selector-results"
  );
  const closeModal = () => document.body.removeChild(modalOverlay);

  const renderResults = (people) => {
    resultsContainer.innerHTML =
      people.length === 0
        ? `<div class="spouse-result-item">${fa.personNotFound}</div>`
        : people
            .map(
              (p) =>
                `<div class="spouse-result-item" data-id="${p.id}">${
                  p.data["first name"] || ""
                } ${p.data["last name"] || ""}</div>`
            )
            .join("");
  };

  modalOverlay
    .querySelector(".modal-close")
    .addEventListener("click", closeModal);
  modalOverlay.addEventListener(
    "click",
    (e) => e.target === modalOverlay && closeModal()
  );
  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    renderResults(
      eligiblePeople.filter((p) =>
        `${p.data["first name"] || ""} ${p.data["last name"] || ""}`
          .toLowerCase()
          .includes(searchTerm)
      )
    );
  });

  resultsContainer.addEventListener("click", (e) => {
    const target = e.target.closest(".spouse-result-item");
    if (target?.dataset.id) {
      const selectedPersonId = target.dataset.id;
      const store = f3Chart.store.getData();

      linkPeople(currentPersonId, selectedPersonId, relType, store);

      f3Chart.updateTree();
      closeModal();
      document.querySelector("#familyForm .f3-cancel-btn")?.click();
      alert(
        fa.relationSuccess(
          target.textContent.trim(),
          fa[rule.successRelationKey]
        )
      );
    }
  });

  renderResults(eligiblePeople);
  searchInput.focus();
}

function customizeEditForm() {
  const form = document.querySelector("#familyForm");
  if (!form) return;
  if (form.getAttribute("data-translated") === "true") return;

  // --- Translations and general customizations ---
  form.querySelector(".f3-radio-group")?.style.setProperty("direction", "rtl");
  const maleRadio = form.querySelector('input[value="M"]');
  if (maleRadio) {
    for (const node of maleRadio.parentNode.childNodes) {
      if (
        node.nodeType === Node.TEXT_NODE &&
        node.textContent.includes("Male")
      ) {
        node.textContent = fa.male;
        break;
      }
    }
  }
  const femaleRadio = form.querySelector('input[value="F"]');
  if (femaleRadio) {
    for (const node of femaleRadio.parentNode.childNodes) {
      if (
        node.nodeType === Node.TEXT_NODE &&
        node.textContent.includes("Female")
      ) {
        node.textContent = fa.female;
        break;
      }
    }
  }
  form.querySelectorAll(".f3-form-field").forEach((field) => {
    field.style.direction = "rtl";
    const label = field.querySelector("label");
    const input = field.querySelector("input");
    const translations = {
      "first name": { label: fa.firstName, placeholder: fa.firstName },
      "last name": { label: fa.lastName, placeholder: fa.lastName },
      birthday: { label: fa.birthday, placeholder: fa.birthYear },
      "death date": { label: fa.deathDate, placeholder: fa.deathYear },
      avatar: { label: fa.avatar, placeholder: fa.avatarPlaceholder },
    };
    if (label?.textContent && translations[label.textContent]) {
      input?.setAttribute(
        "placeholder",
        translations[label.textContent].placeholder
      );
      label.textContent = translations[label.textContent].label;
    }
  });
  form.querySelector(".f3-form-buttons")?.style.setProperty("direction", "rtl");
  const btnTranslations = {
    ".f3-cancel-btn": fa.cancel,
    'button[type="submit"]': fa.submit,
    ".f3-delete-btn": fa.delete,
    ".f3-remove-relative-btn": fa.removeRelation,
  };
  Object.entries(btnTranslations).forEach(([selector, text]) => {
    const button = form.querySelector(selector);
    if (button) button.textContent = text;
  });

  form.setAttribute("data-translated", "true");
}

function translateAddRelativeCards(containerNode) {
  const addCardTranslations = {
    spouse: fa.addSpouse,
    father: fa.addFather,
    mother: fa.addMother,
    son: fa.addSon,
    daughter: fa.addDaughter,
  };

  const elementsToTranslate = containerNode.querySelectorAll(
    "[data-rel-type]:not([data-translated])"
  );

  elementsToTranslate.forEach((element) => {
    const relType = element.getAttribute("data-rel-type");
    if (addCardTranslations[relType]) {
      element.textContent = addCardTranslations[relType];
      element.setAttribute("data-translated", "true");
    }
  });
}

function initializeAddRelativeObserver() {
  const targetNode = document.getElementById("FamilyChart");
  if (!targetNode) return;

  const config = { childList: true, subtree: true };

  // The callback now efficiently processes only the nodes that were added
  const callback = function (mutationsList, observer) {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          // Check if the added node is an element and contains our targets
          if (node.nodeType === Node.ELEMENT_NODE) {
            // It's possible the target is the added node itself
            if (node.hasAttribute("data-rel-type")) {
              translateAddRelativeCards(node.parentElement);
            } else {
              // Or it's a child of the added node
              translateAddRelativeCards(node);
            }
          }
        });
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
}

function initializeFormObserver() {
  const targetNode = document.body;
  const config = { childList: true, subtree: true };

  const callback = function (mutationsList, observer) {
    for (const mutation of mutationsList) {
      if (mutation.addedNodes.length > 0) {
        // Check if the form itself was added, or if it's inside what was added
        const form = document.querySelector("#familyForm");
        if (form) {
          customizeEditForm();
        }
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
}

/**
 * The main function that applies our custom features to the chart.
 */
export function initialize(f3Chart, f3EditTree) {
  initializeAddRelativeObserver();
  initializeFormObserver();

  const originalOpen = f3EditTree.open;

  f3EditTree.open = function (datum) {
    originalOpen.apply(this, arguments);

    setTimeout(() => {
      const addCardTranslations = {
        spouse: fa.addSpouse,
        father: fa.addFather,
        mother: fa.addMother,
        son: fa.addSon,
        daughter: fa.addDaughter,
      };
      const newRelData = datum["_new_rel_data"];
      if (newRelData) {
        const relType = newRelData.rel_type;
        const rule = RELATIONSHIP_RULES[relType];

        // If the relationship type is one we support for linking, add the button
        if (rule) {
          const form = document.querySelector("#familyForm");
          if (form && !form.querySelector(".link-existing-person-btn")) {
            const personId = f3EditTree.store.getLastAvailableMainDatum().id;
            const newButton = document.createElement("button");
            newButton.type = "button";
            newButton.textContent = fa[rule.buttonTextKey];
            newButton.className = "btn link-existing-person-btn";
            newButton.style.width = "100%";
            newButton.style.marginBottom = "10px";

            newButton.onclick = (e) => {
              e.stopPropagation();
              const currentPersonData = f3Chart.store
                .getData()
                .find((p) => p.id === personId);

              // Business Rule: Prevent adding a parent if one already exists
              if (relType === "father" && currentPersonData.rels.father) {
                alert(fa.personHasParent("M"));
                return;
              }
              if (relType === "mother" && currentPersonData.rels.mother) {
                alert(fa.personHasParent("F"));
                return;
              }

              openLinkExistingPersonModal(
                personId,
                relType,
                f3Chart,
                f3EditTree
              );
            };

            const titleElement = form.querySelector(".f3-form-title");
            if (titleElement) {
              titleElement.insertAdjacentElement("afterend", newButton);
            }
            titleElement.textContent = addCardTranslations[relType];
          }
        }
      }
    }, 0);
  };
}
