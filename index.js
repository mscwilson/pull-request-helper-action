require("dotenv").config();
const github = require("@actions/github");

const issueBranchRegex = /^issue\/(\d+)/;

async function run() {
  const octokit = github.getOctokit(process.env.ACCESS_TOKEN);

  const context = github.context;
  // const owner = context.repo.owner;
  // const repo = context.repo.repo;

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

  const owner = "mscwilson";
  const repo = "try-out-actions-here";
  pullNumber = 88;
  issueNumber = 666;
  addCommentWithIssueNumber(octokit, owner, repo, pullNumber, issueNumber);
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
    octokit.rest.issues.createComment({
      owner: owner,
      repo: repo,
      issue_number: pullNumber,
      body: "a comment",
    });
  } catch (error) {
    console.log(`Failed to add a comment to PR/issue ${pullNumber}`);
    console.log(error);
  }
}
