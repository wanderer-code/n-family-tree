import { DATA_URL } from "./config.js";
import { updateDataOnGitHub } from "./services/githubService.js";
import * as TokenModal from "./components/tokenModal.js";
import * as Chart from "./components/chartComponent.js";
// --- UPDATED IMPORT ---
import * as ChartEnhancements from "./components/chartEnhancements.js";
import { fa } from "./i18n.js";

// The application's state
let updatedData = null;

async function main() {
  const uploadChangesBtn = document.querySelector("[data-open-modal]");

  try {
    // 1. Load initial data
    const response = await fetch(DATA_URL);
    if (!response.ok)
      throw new Error(`Failed to load data: ${response.statusText}`);
    const data = await response.json();

    // 2. Create the chart and get its instances
    const { f3Chart, f3EditTree } = Chart.initialize(data);

    // 3. --- UPDATED CALL ---
    // Enhance the chart with our custom spouse feature
    ChartEnhancements.initialize(f3Chart, f3EditTree);

    f3EditTree.setOnChange((newChartData) => {
      updatedData = newChartData;
      // Enable the button as soon as a change is detected
      uploadChangesBtn.disabled = false;
    });

    // 5. Initialize the token modal and connect it to the GitHub service
    TokenModal.initialize(async (token) => {
      if (!updatedData) {
        TokenModal.setError(fa.noChangesMade);
        return;
      }

      TokenModal.setLoading(true); // Start loading state
      try {
        const success = await updateDataOnGitHub(token, updatedData);
        if (success) {
          TokenModal.close();
          updatedData = null; // Reset state after successful save
          // Disable the button again, as there are no pending changes
          uploadChangesBtn.disabled = true;
        }
      } catch (error) {
        TokenModal.setError(error.message);
      } finally {
        TokenModal.setLoading(false); // End loading state regardless of outcome
      }
    });

    // 6. Final render
    f3Chart.updateTree({ initial: true });
    // f3EditTree.open(f3Chart.getMainDatum());
  } catch (error) {
    console.error("Application failed to start:", error);
    uploadChangesBtn.style.display = "none"; // Hide button on critical error
    document.body.innerHTML =
      "<h1>Application failed to start. See console for details.</h1>";
  }
}

// Run the application
main();
