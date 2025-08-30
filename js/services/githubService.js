import { Octokit } from "https://cdn.skypack.dev/@octokit/rest";
import { GITHUB_USERNAME, GITHUB_REPO, FILE_PATH } from "../config.js";
import { fa } from "../i18n.js";

const IN_PROGRESS_STATUSES = ["queued", "in_progress", "pending", "waiting"];

async function getLastWorkflow(octokit) {
  try {
    const { data: wfStatuses } =
      await octokit.rest.actions.listWorkflowRunsForRepo({
        owner: GITHUB_USERNAME,
        repo: GITHUB_REPO,
        per_page: 1, // Optimization: only fetch the latest
        _: new Date().getTime(), // Prevent caching
      });
    if (wfStatuses.workflow_runs.length > 0) {
      const lastWorkflowStatus = wfStatuses.workflow_runs[0];
      return lastWorkflowStatus.status === "completed"
        ? lastWorkflowStatus.conclusion
        : lastWorkflowStatus.status;
    }
    return null; // No workflows found
  } catch (error) {
    console.error("Error fetching workflows:", error);
    // Let the calling function decide how to handle this, but throw a generic message
    throw new Error(fa.uploadStatusUnknown);
  }
}

async function pollDeploymentStatus(octokit) {
  const workflowStatus = await getLastWorkflow(octokit);

  // The critical check: if a workflow is currently running, we must wait.
  if (IN_PROGRESS_STATUSES.includes(workflowStatus)) {
    throw new Error(fa.pleaseWait);
  }

  // If the workflow is completed ('success', 'failure'), cancelled, or doesn't exist (null),
  // it's safe to proceed. No action is needed; the function will simply complete successfully.
}

async function updateFile(updatedData, octokit) {
  try {
    const { data: currentFile } = await octokit.repos.getContent({
      owner: GITHUB_USERNAME,
      repo: GITHUB_REPO,
      path: FILE_PATH,
    });
    const formattedData = btoa(
      unescape(encodeURIComponent(JSON.stringify(updatedData, null, 2)))
    );

    await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_USERNAME,
      repo: GITHUB_REPO,
      path: FILE_PATH,
      message: `docs: Update ${FILE_PATH} via web editor`,
      content: formattedData,
      sha: currentFile.sha,
    });
    // Return success. The UI layer will handle user feedback.
    return true;
  } catch (error) {
    console.error("Error updating file:", error);
    const message =
      error.response?.status === 401 ? fa.invalidToken : fa.genericError;
    // Throw the user-friendly message.
    throw new Error(message);
  }
}

// The single public function this module exports.
export async function updateDataOnGitHub(token, updatedData) {
  const octokit = new Octokit({ auth: token });

  // pollDeploymentStatus will throw if we can't upload, halting the execution.
  await pollDeploymentStatus(octokit);

  // If it doesn't throw, we proceed to update the file.
  return await updateFile(updatedData, octokit);
}
