require("dotenv").config();
const github = require("@actions/github");

const issueBranchRegex = /^issue\/(\d+)/;

async function run() {
  const octokit = github.getOctokit(process.env.ACCESS_TOKEN);

  const context = github.context;
  let owner = context.repo.owner;
  let repo = context.repo.repo;

  // ref for pull looks like "refs/pull/19/merge"
  if (!context.ref.split("/")[1] === "pull") {
    console.log("This isn't a pull request.");
    return;
  }

  let pullNumber = context.ref.split("/")[2];

  try {
    const { data: pull } = await octokit.rest.pulls.get({
      owner: owner,
      repo: repo,
      pull_number: pullNumber,
    });
    const branchName = pull.head.ref;
    console.log(branchName);

    let issueNumber;
    try {
      issueNumber = branchName.match(issueBranchRegex)[1];
      console.log(`issue # is ${issueNumber}`);
    } catch {
      console.log(`Couldn't find an issue number in "${branchName}"`);
      return;
    }
  } catch (error) {
    console.log(`Failed to find PR ${pullNumber}`);
    console.log(error);
  }

  owner = "mscwilson";
  repo = "try-out-actions-here";
  pullNumber = 97;
  issueNumber = 5;
  addCommentWithIssueNumber(octokit, owner, repo, pullNumber, issueNumber);
  getIssueTitle(octokit, owner, repo, issueNumber);
}

run();

async function addCommentWithIssueNumber(
  octokit,
  owner,
  repo,
  pullNumber,
  issueNumber
) {
  try {
    // To comment generally on a PR, it's actually the issue comment API.
    // Github considers pull comments to be for the actual code (review comments)
    octokit.rest.issues.createComment({
      owner: owner,
      repo: repo,
      issue_number: pullNumber,
      body: `This pull request is for issue #${issueNumber}.`,
    });
  } catch (error) {
    console.log(`Failed to add a comment to PR/issue ${pullNumber}`);
    console.log(error);
  }
}

async function getIssueTitle(octokit, owner, repo, issueNumber) {
  try {
    const { data: issue } = await octokit.rest.issues.get({
      owner: owner,
      repo: repo,
      issue_number: issueNumber,
    });
    const issueTitle = issue.title;
    console.log(issueTitle);
  } catch (error) {
    console.log(`Failed to find title for issue ${issueNumber}`);
    console.log(error);
  }
}

async function changePullTitle(octokit, owner, repo, pullNumber) {}
