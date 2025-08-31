// js/components/searchComponent.js

let allPeople = [];
let onSelectCallback = () => {};
let searchContainer, searchInput, searchResults;

/**
 * Renders the list of filtered results.
 * @param {Array} filteredPeople - The people to display.
 */
function renderResults(filteredPeople) {
  if (filteredPeople.length === 0) {
    searchResults.classList.remove("active");
    return;
  }

  searchResults.innerHTML = filteredPeople
    .map(
      (p) =>
        `<div class="search-result-item" data-id="${p.id}">${p.label}</div>`
    )
    .join("");

  searchResults.classList.add("active");
}

/**
 * Closes the results dropdown.
 */
function closeDropdown() {
  searchResults.classList.remove("active");
}

/**
 * Handles keyboard navigation within the results list.
 * @param {KeyboardEvent} e - The keydown event.
 */
function handleKeyboardNavigation(e) {
  const items = searchResults.querySelectorAll(".search-result-item");
  if (items.length === 0) return;

  const activeItem = searchResults.querySelector(".search-result-item.focused");
  let currentIndex = Array.from(items).indexOf(activeItem);

  if (e.key === "ArrowDown") {
    e.preventDefault();
    currentIndex = (currentIndex + 1) % items.length;
    activeItem?.classList.remove("focused");
    items[currentIndex].classList.add("focused");
    items[currentIndex].scrollIntoView({ block: "nearest" });
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    activeItem?.classList.remove("focused");
    items[currentIndex].classList.add("focused");
    items[currentIndex].scrollIntoView({ block: "nearest" });
  } else if (e.key === "Enter") {
    e.preventDefault();
    const focusedItem = activeItem || items[0];
    focusedItem?.click();
  } else if (e.key === "Escape") {
    closeDropdown();
  }
}

/**
 * Initializes the search component.
 * @param {Array} data - The raw family tree data.
 * @param {function} onSelect - Callback function executed with the ID of the selected person.
 */
export function initialize(data, onSelect) {
  searchContainer = document.querySelector(".search-container");
  searchInput = document.getElementById("searchInput");
  searchResults = document.getElementById("searchResults");
  onSelectCallback = onSelect;

  // Prepare the data for searching
  allPeople = data.map((person) => ({
    id: person.id,
    label: `${person.data["first name"] || ""} ${
      person.data["last name"] || ""
    }`.trim(),
  }));

  // Event listener for user input
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    if (!query) {
      closeDropdown();
      return;
    }
    const filtered = allPeople.filter((p) =>
      p.label.toLowerCase().includes(query)
    );
    renderResults(filtered);
  });

  // Handle keyboard navigation
  searchInput.addEventListener("keydown", handleKeyboardNavigation);

  // Use event delegation for clicks on result items
  searchResults.addEventListener("click", (e) => {
    const item = e.target.closest(".search-result-item");
    if (item?.dataset.id) {
      onSelectCallback(item.dataset.id);
      searchInput.value = item.textContent; // Optional: fill input with selected name
      closeDropdown();
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!searchContainer.contains(e.target)) {
      closeDropdown();
    }
  });
}
