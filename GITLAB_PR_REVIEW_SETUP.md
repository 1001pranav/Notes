# GitLab PR Code Review with N8N - Setup Guide

This N8N workflow automatically reviews GitLab merge requests using AI (Claude or ChatGPT) and posts review comments back to the MR.

## Features

- ✅ **Works with private GitLab servers** - Fully dynamic, auto-detects your GitLab URL
- ✅ Triggers automatically on GitLab merge request events (open/update)
- ✅ Retrieves full code diff from merge requests
- ✅ Handles large PRs by chunking code (avoids token limits)
- ✅ Supports multiple LLM providers (Claude, ChatGPT/OpenAI)
- ✅ **Loads rules from the same GitLab project** - No external URLs needed
- ✅ **Single configuration point** - Set values once, reused everywhere
- ✅ **Customizable review rules** - Use your own code review guidelines
- ✅ Reviews focus on: bugs, security, performance, code quality, best practices

## Quick Reference

**Where to configure:**
- Rules file path & branch: **"Extract & Configure"** node in N8N (default: `code-review-rules.md` from `main` branch)
- LLM choice: Keep or delete Claude/ChatGPT nodes
- Everything else: Auto-detected from GitLab webhook!

**How it works:**
1. GitLab webhook → N8N extracts your GitLab URL, project ID, MR details
2. N8N loads `code-review-rules.md` from **the same GitLab project** using GitLab API
3. AI reviews code using your custom rules
4. Review posted as comment on the MR

**Works with:**
- ✅ GitLab.com
- ✅ Self-hosted GitLab
- ✅ Private GitLab servers
- ✅ Any GitLab instance (auto-detected!)

## Prerequisites

1. **N8N Instance** - Running N8N server (self-hosted or cloud)
2. **GitLab Account** - With API access to your repositories
3. **LLM API Access** - At least one of:
   - Anthropic API key (for Claude)
   - OpenAI API key (for ChatGPT/GPT-4)

## Setup Instructions

### Step 1: Import Workflow to N8N

1. Open your N8N instance
2. Go to **Workflows** → **Add Workflow** → **Import from File**
3. Select the `gitlab-pr-code-review.json` file
4. Click **Import**

### Step 2: Configure Credentials

#### GitLab API Credentials

1. In N8N, go to **Credentials** → **Add Credential**
2. Search for **GitLab API**
3. Create new GitLab credentials:
   - **GitLab Server**: Your GitLab URL (e.g., `https://gitlab.com` or your self-hosted URL)
   - **Access Token**: Create a personal access token in GitLab:
     - Go to GitLab → **Preferences** → **Access Tokens**
     - Create token with scopes: `api`, `read_api`, `read_repository`, `write_repository`
     - Copy the token
   - Paste token in N8N credential
4. Save the credential

#### Anthropic API (for Claude)

1. In N8N, go to **Credentials** → **Add Credential**
2. Search for **Anthropic API**
3. Enter your Anthropic API key:
   - Get it from: https://console.anthropic.com/settings/keys
4. Save the credential
5. In the workflow, assign this credential to the **"Claude Code Review"** node

#### OpenAI API (for ChatGPT)

1. In N8N, go to **Credentials** → **Add Credential**
2. Search for **OpenAI API**
3. Enter your OpenAI API key:
   - Get it from: https://platform.openai.com/api-keys
4. Save the credential
5. In the workflow, assign this credential to the **"ChatGPT Code Review"** node

### Step 3: Add Code Review Rules to Your GitLab Project

The workflow automatically loads `code-review-rules.md` from the **same GitLab project** that triggered the merge request.

#### Add Rules File to Your GitLab Project

1. **Upload the rules file** to your GitLab repository:
   ```bash
   # In your GitLab project root
   cp code-review-rules.md your-project/
   cd your-project
   git add code-review-rules.md
   git commit -m "Add code review rules"
   git push origin main
   ```

2. **That's it!** The workflow will automatically:
   - Detect your GitLab server URL
   - Use the project that triggered the webhook
   - Load `code-review-rules.md` from the `main` branch

#### Customize File Path or Branch (Optional)

If you want to store the rules file elsewhere, update the **"Extract & Configure"** node in N8N:

1. Open the N8N workflow
2. Click on **"Extract & Configure"** node
3. Modify these values:
   - **rulesFilePath**: Change from `code-review-rules.md` to your path (e.g., `docs/code-review-rules.md`)
   - **rulesFileBranch**: Change from `main` to your branch (e.g., `develop`, `master`)
4. Save the workflow

#### How It Works - Dynamic Configuration

The workflow extracts everything dynamically from the GitLab webhook:

**Automatically Extracted:**
- ✅ GitLab Server URL (works with any private GitLab instance)
- ✅ Project ID and Name
- ✅ Merge Request details (title, description, branches)
- ✅ MR URL

**You Only Configure:**
- Rules file path (default: `code-review-rules.md`)
- Rules file branch (default: `main`)

All values are extracted once and reused throughout the workflow - **no need to enter your GitLab URL or project details anywhere!**

#### Customize Review Rules

Edit `code-review-rules.md` to match your team's standards:

1. **Severity Levels**: Define what constitutes CRITICAL, IMPORTANT, or SUGGESTION
2. **Language-Specific Rules**: Add rules for Python, JavaScript, Java, Go, etc.
3. **Project-Specific Rules**: Add custom requirements for your codebase
4. **Review Format**: Define how reviews should be structured
5. **Exclusions**: Specify what should NOT be flagged

See `code-review-rules.md` for the full template with detailed examples.

### Step 4: Configure the Workflow

1. Open the imported workflow in N8N
2. Click on **"GitLab MR Webhook"** node
3. Note the **Webhook URL** (you'll need this for GitLab)
4. Choose your LLM:
   - **Option A**: Use only Claude - Delete the "ChatGPT Code Review" node
   - **Option B**: Use only ChatGPT - Delete the "Claude Code Review" node
   - **Option C**: Use both - Keep both nodes (will run in parallel)

### Step 6: Configure GitLab Webhook

1. Go to your GitLab project
2. Navigate to **Settings** → **Webhooks**
3. Add new webhook:
   - **URL**: Paste the N8N webhook URL from Step 4
   - **Secret Token**: (optional but recommended)
   - **Trigger**: Check **Merge request events**
   - **Enable SSL verification**: Check if using HTTPS
4. Click **Add webhook**
5. Test the webhook with **Test** → **Merge Request events**

### Step 7: Activate the Workflow

1. In N8N, click **Active** toggle to enable the workflow
2. The workflow is now live and listening for GitLab MR events

## How It Works

### Workflow Flow

```
GitLab MR Event → Webhook Trigger → Filter Events
                                          ↓
                              Extract & Configure
                          (Auto-detects GitLab URL,
                           Project ID, MR details)
                                          ↓
                    ┌─────────────────────┴─────────────────────┐
                    ↓                                             ↓
    Load Review Rules from GitLab                        Get MR Diff
    (Uses GitLab API + same project)                              ↓
                    └─────────────────────┬─────────────────────┘
                                          ↓
                              Prepare Code for Review
                          (Combines rules + code diff)
                                          ↓
                    ┌─────────────────────┴─────────────────────┐
                    ↓                                             ↓
            Claude Review                                 ChatGPT Review
                    └─────────────────────┬─────────────────────┘
                                          ↓
                                  Combine Reviews
                                          ↓
                              Post Comment to GitLab MR
                                          ↓
                                   Webhook Response
```

### Key Improvements - Dynamic GitLab Support

**1. Auto-Detection**
- GitLab server URL extracted from webhook payload
- Works with any GitLab instance (gitlab.com, self-hosted, private servers)
- No hardcoded URLs anywhere

**2. Single Configuration Point**
The **"Extract & Configure"** node is where all dynamic values are set:
- Rules file path: `code-review-rules.md` (customizable)
- Rules file branch: `main` (customizable)
- Everything else auto-extracted from webhook

**3. Reusable Variables**
All extracted values (GitLab URL, project ID, MR details) are stored once and reused throughout the workflow - no duplication!

### Code Chunking for Large PRs

The workflow automatically handles large merge requests:
- **Max chunk size**: 100,000 characters per chunk
- If MR exceeds this, code is split by files
- Each chunk is reviewed separately
- Reviews are combined and posted together
- Prevents token limit errors with large PRs

### Review Focus Areas

The LLM reviews code for:
1. **Bugs and Issues**: Logic errors, edge cases, null pointer issues
2. **Security Vulnerabilities**: SQL injection, XSS, authentication issues
3. **Performance**: Inefficient algorithms, memory leaks, database queries
4. **Code Quality**: Naming conventions, code duplication, complexity
5. **Best Practices**: Design patterns, SOLID principles, maintainability

## Configuration Options

### Understanding the Extract & Configure Node

This is the **single source of truth** for all configuration. Open this node in N8N to customize:

**Configurable Values:**
```
rulesFilePath: "code-review-rules.md"        # Path to rules file in GitLab
rulesFileBranch: "main"                      # Branch to load rules from
```

**Auto-Extracted Values (Do NOT modify):**
```
gitlabUrl: <auto-detected from webhook>     # Your GitLab server URL
projectId: <auto-detected>                   # GitLab project ID
projectName: <auto-detected>                 # Project name
mrIid: <auto-detected>                       # Merge request ID
mrTitle: <auto-detected>                     # MR title
mrDescription: <auto-detected>               # MR description
sourceBranch: <auto-detected>                # Source branch
targetBranch: <auto-detected>                # Target branch
mrUrl: <auto-detected>                       # MR URL
```

**Examples:**

Different rules for different environments:
```javascript
// Development branch - less strict rules
rulesFilePath: "code-review-rules-dev.md"
rulesFileBranch: "develop"

// Production branch - strict rules
rulesFilePath: "code-review-rules-prod.md"
rulesFileBranch: "main"

// Rules in subdirectory
rulesFilePath: "docs/standards/code-review-rules.md"
rulesFileBranch: "main"
```

### Customizing Code Review Rules

The workflow uses `code-review-rules.md` to define review criteria. This file is loaded at runtime from your GitLab project, allowing you to update review guidelines without modifying the workflow.

#### Key Sections in code-review-rules.md

**1. Severity Levels**
- **CRITICAL (🔴)**: Security vulnerabilities, data loss risks, critical bugs
- **IMPORTANT (🟡)**: Performance issues, code quality problems
- **SUGGESTION (🟢)**: Best practice recommendations, minor optimizations

**2. Language-Specific Rules**
The template includes detailed rules for:
- JavaScript/TypeScript (async/await, type safety, React hooks)
- Python (PEP 8, type hints, exception handling)
- Java (null safety, generics, streams)
- Go (error handling, goroutines, context)
- Django, React, and more

**3. Project-Specific Customization**
Add your own rules to the "Custom Rules for This Project" section:
```markdown
### Custom Rules for This Project

- All API responses must follow the standard envelope format
- Database migrations must be reviewed by a DBA
- All user-facing strings must support i18n
- Error messages must not expose internal implementation details
```

**4. Review Output Format**
Define how the AI should structure its feedback - the template includes a specific format with:
- Overall assessment
- Critical/Important/Suggestion sections
- Security and performance analysis
- Detailed file-by-file reviews

#### Benefits of External Rules File

1. **Version Control**: Track changes to review standards over time
2. **Team Collaboration**: Team members can propose rule changes via PRs
3. **No Workflow Editing**: Update rules without touching the N8N workflow
4. **Consistency**: Same rules applied across all reviews
5. **Documentation**: Rules file serves as team coding standards documentation

#### Updating Rules

To update review rules:
1. Edit `code-review-rules.md` in your repository
2. Commit and push changes
3. Next MR review will automatically use updated rules (no workflow restart needed)

### Adjust Chunk Size

Edit the **"Prepare Code for Review"** node:
```javascript
const MAX_CHUNK_SIZE = 100000; // Adjust this value
```

- Smaller values: More chunks, more API calls, higher cost
- Larger values: Fewer chunks, risk of token limits

### Customize Review Prompt

Edit the **"Prepare Code for Review"** node to modify the `reviewPrompt` variable:
```javascript
const reviewPrompt = `You are an expert code reviewer...`;
```

### LLM Model Selection

**For Claude:**
- Edit **"Claude Code Review"** node
- Change `model` parameter:
  - `claude-3-5-sonnet-20241022` (recommended - best balance)
  - `claude-3-opus-20240229` (most capable, slower, expensive)
  - `claude-3-haiku-20240307` (fastest, cheaper, less detailed)

**For ChatGPT:**
- Edit **"ChatGPT Code Review"** node
- Change `model` parameter:
  - `gpt-4-turbo-preview` (recommended)
  - `gpt-4` (most capable)
  - `gpt-3.5-turbo` (faster, cheaper, less detailed)

### Adjust Review Temperature

In the LLM node, modify `temperature` (0.0 to 1.0):
- **Lower (0.1-0.3)**: More focused, consistent reviews (recommended)
- **Higher (0.7-1.0)**: More creative, varied feedback

### Max Tokens

In the LLM node, modify `maxTokens`:
- Default: 4000 tokens
- Increase for more detailed reviews
- Decrease to reduce costs

## Testing

### Test the Workflow Manually

1. In N8N, click **Execute Workflow** button
2. Create a test merge request in GitLab
3. Check N8N execution log for errors
4. Verify comment appears on GitLab MR

### Testing with Different GitLab Instances

The workflow automatically works with any GitLab instance:

**GitLab.com (Public)**
```
✅ Webhook receives: https://gitlab.com/user/project
✅ Auto-extracted gitlabUrl: https://gitlab.com
✅ API calls: https://gitlab.com/api/v4/...
```

**Self-Hosted GitLab**
```
✅ Webhook receives: https://gitlab.yourcompany.com/team/project
✅ Auto-extracted gitlabUrl: https://gitlab.yourcompany.com
✅ API calls: https://gitlab.yourcompany.com/api/v4/...
```

**Custom Port**
```
✅ Webhook receives: https://gitlab.internal.com:8443/team/project
✅ Auto-extracted gitlabUrl: https://gitlab.internal.com:8443
✅ API calls: https://gitlab.internal.com:8443/api/v4/...
```

No configuration changes needed - it just works!

### Common Issues

**Issue**: Webhook not triggering
- **Solution**: Check webhook URL is correct and N8N is accessible from GitLab
- Verify webhook is active in GitLab settings
- Check GitLab webhook delivery logs for errors
- For private GitLab: Ensure N8N server is accessible from your network

**Issue**: "Unauthorized" or "403" errors
- **Solution**: Verify GitLab API token has correct permissions
- Token needs: `api`, `read_api`, `read_repository`, `write_repository`
- Check token hasn't expired
- Verify token has access to the specific project

**Issue**: Rules file not loading (review uses fallback rules)
- **Solution**: Check `code-review-rules.md` exists in your GitLab project root
- Verify the file is in the correct branch (default: `main`)
- Check N8N execution log for "Load Review Rules from GitLab" node errors
- Verify GitLab API token has `read_repository` permission
- If using custom path, check the path in "Extract & Configure" node

**Issue**: GitLab URL not detected correctly
- **Solution**: Check the webhook payload contains `project.web_url`
- Verify your GitLab version supports this field (GitLab 8.1+)
- Check N8N execution log for "Extract & Configure" node output

**Issue**: Works with gitlab.com but not private GitLab
- **Solution**: Verify N8N can reach your private GitLab server
- Check SSL certificate if using self-signed certificates
- Add your GitLab server's certificate to N8N's trusted certificates
- Verify firewall rules allow N8N → GitLab communication

**Issue**: LLM API errors
- **Solution**: Check API credentials are correct
- Verify API keys are active and have sufficient credits
- Check token limits aren't exceeded

**Issue**: Timeout errors
- **Solution**: Increase N8N workflow timeout in settings
- Reduce chunk size for faster processing
- Use faster LLM models (Haiku, GPT-3.5)

**Issue**: Different projects use wrong rules
- **Solution**: Each project loads rules from its own repository
- Check the "Load Review Rules from GitLab" node uses `$json.projectId`
- Each project can have its own `code-review-rules.md`

## Cost Considerations

### Per Review Estimates

**Claude (Sonnet):**
- Input: ~$3 per 1M tokens
- Output: ~$15 per 1M tokens
- Typical PR (5000 tokens): ~$0.05-0.10

**ChatGPT (GPT-4):**
- Input: ~$10 per 1M tokens
- Output: ~$30 per 1M tokens
- Typical PR (5000 tokens): ~$0.15-0.25

**Cost Optimization:**
- Use Claude Haiku or GPT-3.5 for lower costs
- Adjust max tokens to limit review length
- Filter which MRs get reviewed (e.g., skip draft MRs)

## Advanced Customizations

### Filter by Branch

Add condition in **"Filter MR Events"** node:
```javascript
{
  "value1": "={{$json.object_attributes.target_branch}}",
  "operation": "equals",
  "value2": "main"
}
```

### Skip Draft MRs

Add condition in **"Filter MR Events"** node:
```javascript
{
  "value1": "={{$json.object_attributes.work_in_progress}}",
  "operation": "notEqual",
  "value2": true
}
```

### Add File-Specific Reviews

Modify the code preparation to add file-type-specific instructions:
```javascript
if (filePath.endsWith('.py')) {
  prompt += "Focus on Python best practices, PEP 8, and type hints.\\n";
} else if (filePath.endsWith('.js') || filePath.endsWith('.ts')) {
  prompt += "Focus on JavaScript/TypeScript best practices, async/await, and error handling.\\n";
}
```

### Notify Team on Critical Issues

Add a **Send Email** or **Slack** node after "Combine Reviews":
- Extract critical issues from review
- Send notification if critical issues found

## Security Best Practices

1. **Protect API Keys**: Store in N8N credentials, never in workflow code
2. **Use Webhook Secret**: Configure in both GitLab and N8N webhook node
3. **Limit API Token Scope**: Only grant necessary GitLab permissions
4. **Network Security**: Use HTTPS for webhook URLs
5. **Review Data Handling**: Ensure compliance with data privacy requirements

## Support

For issues or questions:
- N8N Documentation: https://docs.n8n.io/
- GitLab Webhooks: https://docs.gitlab.com/ee/user/project/integrations/webhooks.html
- Anthropic API: https://docs.anthropic.com/
- OpenAI API: https://platform.openai.com/docs/

## License

This workflow is provided as-is for educational and commercial use.
