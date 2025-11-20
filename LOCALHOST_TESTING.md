# Testing GitLab PR Code Review on Localhost N8N

This guide helps you test the main workflow (`gitlab-pr-code-review.json`) on your local N8N instance.

## Prerequisites

- N8N running on localhost
- GitLab account (gitlab.com or your private instance)
- At least one AI API key (OpenAI or Anthropic)

## Method 1: Full End-to-End Test (Recommended)

This tests the complete workflow with real GitLab webhooks.

### Step 1: Start N8N Locally

```bash
# If using npx
npx n8n

# If using Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# If installed globally
n8n
```

N8N will be available at: `http://localhost:5678`

### Step 2: Expose Localhost to Internet (for GitLab webhooks)

GitLab needs to reach your localhost. Use ngrok or similar:

**Option A: Using ngrok (Recommended)**
```bash
# Install ngrok from https://ngrok.com/download

# Start ngrok tunnel
ngrok http 5678

# You'll get a URL like: https://abc123.ngrok.io
# This URL will forward to your localhost:5678
```

**Option B: Using localtunnel**
```bash
npm install -g localtunnel

lt --port 5678

# You'll get a URL like: https://funny-words-12.loca.lt
```

**Option C: Using Cloudflare Tunnel**
```bash
# Install cloudflared
# See: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/

cloudflared tunnel --url http://localhost:5678
```

**Note your public URL** - you'll need it for GitLab webhook configuration.

### Step 3: Import Workflow to N8N

1. Open N8N: `http://localhost:5678`
2. Go to **Workflows** → **Add Workflow** → **Import from File**
3. Select `gitlab-pr-code-review.json`
4. Click **Import**

### Step 4: Configure Credentials

#### GitLab API Credentials

1. In N8N, click **Credentials** (top right)
2. Click **Add Credential**
3. Search for **GitLab API**
4. Enter:
   - **GitLab Server**: `https://gitlab.com` (or your private GitLab URL)
   - **Access Token**: Create a token in GitLab:
     - GitLab → **Settings** → **Access Tokens**
     - Name: `N8N Code Review`
     - Scopes: `api`, `read_api`, `read_repository`, `write_repository`
     - Click **Create personal access token**
     - Copy the token
   - Paste token in N8N
5. Click **Save**

#### AI API Credentials

**For OpenAI (ChatGPT):**
1. Click **Add Credential** → **OpenAI API**
2. Enter API key from https://platform.openai.com/api-keys
3. Save and assign to **"ChatGPT Code Review"** node

**For Anthropic (Claude):**
1. Click **Add Credential** → **Anthropic API**
2. Enter API key from https://console.anthropic.com/settings/keys
3. Save and assign to **"Claude Code Review"** node

**Tip**: For testing, use just one AI provider. Delete the other node to save costs.

### Step 5: Get Webhook URL

1. In the workflow, click on **"GitLab MR Webhook"** node
2. Copy the **Webhook URL**
   - It will show: `http://localhost:5678/webhook/gitlab-mr-webhook`
3. Replace `localhost:5678` with your ngrok URL:
   - Example: `https://abc123.ngrok.io/webhook/gitlab-mr-webhook`

### Step 6: Activate Workflow

1. Click the **Active** toggle (top right) to enable the workflow
2. The workflow is now listening for webhooks

### Step 7: Configure Test GitLab Project

1. **Add code-review-rules.md to your GitLab project:**
   ```bash
   # In your test GitLab project
   cd your-gitlab-project

   # Copy the rules file
   cp /path/to/code-review-rules.md ./

   # Commit and push
   git add code-review-rules.md
   git commit -m "Add code review rules for testing"
   git push origin main
   ```

2. **Configure GitLab Webhook:**
   - Go to your GitLab project
   - Navigate to **Settings** → **Webhooks**
   - **URL**: Paste your ngrok webhook URL (e.g., `https://abc123.ngrok.io/webhook/gitlab-mr-webhook`)
   - **Secret Token**: (leave empty for testing)
   - **Trigger**: Check **Merge request events**
   - **Enable SSL verification**: Uncheck for ngrok (it's safe for testing)
   - Click **Add webhook**

### Step 8: Create Test Merge Request

```bash
# In your GitLab project
git checkout -b test-code-review

# Make a simple change
echo "# Test file for code review" > test-review.md

git add test-review.md
git commit -m "Test: Add test file for code review workflow"
git push origin test-code-review

# Create MR via GitLab UI or CLI:
# GitLab → Merge Requests → New merge request
# Source: test-code-review → Target: main
```

### Step 9: Monitor Execution

**In N8N:**
1. Go to **Executions** tab (left sidebar)
2. You should see a new execution appear when you create the MR
3. Click on the execution to see each node's output
4. Check for errors in any node

**In GitLab:**
1. Go to your merge request
2. After 10-30 seconds, you should see an AI-generated review comment
3. The comment will contain code analysis based on your rules

**In Terminal (ngrok):**
- You'll see webhook requests coming in
- Example: `POST /webhook/gitlab-mr-webhook 200 OK`

### Step 10: Debug Common Issues

**Check N8N execution logs:**
```
Executions → Click on execution → Review each node
```

**Key nodes to check:**
- **Extract & Configure**: Verify GitLab URL and project ID extracted
- **Load Review Rules**: Check if rules file loaded successfully
- **Get MR Diff**: Verify code diff retrieved
- **AI Review**: Check AI response
- **Post Review**: Confirm comment posted to GitLab

## Method 2: Manual Testing (Without GitLab Webhook)

Test the workflow manually by sending webhook payloads directly to N8N.

### Step 1: Import and Configure Workflow

Follow Steps 1-4 from Method 1 (start N8N, import workflow, configure credentials)

### Step 2: Create Test Webhook Payload

Save this as `test-gitlab-webhook.json`:

```json
{
  "object_kind": "merge_request",
  "event_type": "merge_request",
  "user": {
    "name": "Test User",
    "username": "testuser",
    "email": "test@example.com"
  },
  "project": {
    "id": 12345,
    "name": "your-project-name",
    "web_url": "https://gitlab.com/your-username/your-project-name"
  },
  "object_attributes": {
    "id": 1001,
    "iid": 1,
    "title": "Test: Code review workflow",
    "description": "This is a test merge request to verify the code review automation",
    "state": "opened",
    "action": "open",
    "source_branch": "feature-test",
    "target_branch": "main",
    "url": "https://gitlab.com/your-username/your-project-name/-/merge_requests/1",
    "author_id": 100
  }
}
```

**Important**: Replace with your actual GitLab project details:
- `project.id` - Your GitLab project ID (found in GitLab → Settings → General)
- `project.name` - Your project name
- `project.web_url` - Your project URL
- `object_attributes.iid` - A real merge request number in your project
- `object_attributes.url` - Real MR URL

### Step 3: Send Test Payload

**Using curl:**
```bash
curl -X POST http://localhost:5678/webhook/gitlab-mr-webhook \
  -H "Content-Type: application/json" \
  -d @test-gitlab-webhook.json
```

**Using Postman:**
1. Method: POST
2. URL: `http://localhost:5678/webhook/gitlab-mr-webhook`
3. Headers: `Content-Type: application/json`
4. Body: Paste the JSON payload
5. Click **Send**

**Using N8N Test Webhook:**
1. In N8N workflow, click **"GitLab MR Webhook"** node
2. Click **Listen for test event**
3. Send the curl request from another terminal
4. N8N will capture the payload
5. Click **Use workflow data**

### Step 4: Execute Workflow Manually

1. In N8N, click **Execute Workflow** button (play icon)
2. Watch the execution flow through each node
3. Check the output of each node
4. Look for the AI review in the final nodes

## Method 3: Simplified Testing (Just AI Response)

Test only the AI review part without GitLab integration.

### Step 1: Use the Test Workflow

```bash
# Import gitlab-pr-code-review-TEST.json instead
```

Follow the TESTING_GUIDE.md instructions - it's much simpler!

### Step 2: Send Test Request

```bash
curl -X POST http://localhost:5678/webhook/gitlab-mr-webhook-test \
  -H "Content-Type: application/json" \
  -d '{
    "test": "Hello AI",
    "code": "function add(a, b) { return a + b; }"
  }'
```

You'll get an immediate AI response without needing GitLab!

## Debugging Tips

### View N8N Logs

**If running with npx or globally:**
```bash
# Logs appear in terminal
```

**If running with Docker:**
```bash
docker logs n8n -f
```

### Enable Detailed Logging

Set environment variable:
```bash
# For npx/global
export N8N_LOG_LEVEL=debug
n8n

# For Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -e N8N_LOG_LEVEL=debug \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### Check Node Outputs

In N8N execution view:
1. Click on each node
2. View **Input** and **Output** tabs
3. Check **JSON** tab for full data

### Common Issues

**Issue**: Webhook not receiving requests
- Check ngrok is running: `curl https://abc123.ngrok.io`
- Check N8N workflow is **Active** (toggle ON)
- Check GitLab webhook URL matches ngrok URL
- Check GitLab webhook logs: Settings → Webhooks → Edit → Recent Deliveries

**Issue**: GitLab API errors (403/401)
- Check GitLab token has correct scopes
- Verify token in N8N credentials matches GitLab
- Test token manually:
  ```bash
  curl -H "PRIVATE-TOKEN: your-token" \
    https://gitlab.com/api/v4/user
  ```

**Issue**: Rules file not loading
- Check `code-review-rules.md` exists in GitLab project root
- Verify branch is `main` (or update in "Extract & Configure" node)
- Check N8N logs for file loading errors
- Test GitLab file API:
  ```bash
  curl -H "PRIVATE-TOKEN: your-token" \
    "https://gitlab.com/api/v4/projects/PROJECT_ID/repository/files/code-review-rules.md/raw?ref=main"
  ```

**Issue**: AI not responding
- Check API credentials configured
- Check API key has credits
- Test API directly:
  ```bash
  # OpenAI
  curl https://api.openai.com/v1/chat/completions \
    -H "Authorization: Bearer YOUR_KEY" \
    -H "Content-Type: application/json" \
    -d '{"model":"gpt-4","messages":[{"role":"user","content":"test"}]}'

  # Anthropic
  curl https://api.anthropic.com/v1/messages \
    -H "x-api-key: YOUR_KEY" \
    -H "anthropic-version: 2023-06-01" \
    -H "Content-Type: application/json" \
    -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":100,"messages":[{"role":"user","content":"test"}]}'
  ```

**Issue**: Can't see GitLab comment
- Check "Post Review to GitLab" node succeeded
- Check GitLab API token has `write_repository` scope
- Check MR is still open (not merged)
- Look in GitLab → MR → Comments tab

## Testing Checklist

Before going to production, verify:

- [ ] N8N receives webhook from GitLab
- [ ] "Extract & Configure" node extracts GitLab URL correctly
- [ ] "Load Review Rules" loads rules from GitLab project
- [ ] "Get MR Diff" retrieves code changes
- [ ] "Prepare Code for Review" combines rules + code
- [ ] AI node generates review (Claude or ChatGPT)
- [ ] "Combine Reviews" merges multiple chunks (if large MR)
- [ ] "Post Review to GitLab" successfully posts comment
- [ ] Comment appears on GitLab MR within 30 seconds
- [ ] Review content follows rules from `code-review-rules.md`

## Performance Testing

Time each step:
```bash
# In N8N execution view, check duration of each node
# Expected times:
# - Extract & Configure: < 1 second
# - Load Rules: 1-2 seconds
# - Get MR Diff: 1-3 seconds
# - Prepare Review: < 1 second
# - AI Review: 5-20 seconds (depends on code size)
# - Post Comment: 1-2 seconds
# Total: 10-30 seconds for typical MR
```

## Cost Tracking

Monitor API costs:
- **OpenAI**: https://platform.openai.com/usage
- **Anthropic**: https://console.anthropic.com/settings/usage

For a test run, costs should be minimal (< $0.10 per MR).

## Next Steps

Once local testing succeeds:

1. Test with different MR sizes (small, medium, large)
2. Test with different file types (Python, JavaScript, etc.)
3. Verify rules are being followed
4. Test error handling (invalid token, missing rules, etc.)
5. Deploy to production N8N instance
6. Configure webhooks for all your GitLab projects

## Quick Test Commands

**Test N8N is running:**
```bash
curl http://localhost:5678
```

**Test ngrok tunnel:**
```bash
curl https://your-ngrok-url.ngrok.io
```

**Test webhook endpoint:**
```bash
curl -X POST http://localhost:5678/webhook/gitlab-mr-webhook \
  -H "Content-Type: application/json" \
  -d '{"object_kind":"merge_request","object_attributes":{"action":"open"}}'
```

**Expected response:**
```json
{"status":"success","message":"Code review completed and posted to MR","mr_url":"..."}
```

## Troubleshooting Flowchart

```
Webhook not working?
├─ Is N8N running? → Start N8N
├─ Is workflow active? → Toggle ON
├─ Is ngrok running? → Start ngrok
├─ Does GitLab webhook URL match? → Update in GitLab
└─ Check GitLab webhook logs → Fix URL/SSL

GitLab API errors?
├─ Is token valid? → Create new token
├─ Does token have scopes? → Add required scopes
└─ Is project ID correct? → Check in GitLab Settings

AI not responding?
├─ Is credential configured? → Add API key
├─ Does key have credits? → Add credits
└─ Check N8N node output → Look for errors

No comment on MR?
├─ Check "Post Review" node → Fix token permissions
├─ Is MR still open? → Don't test on merged MRs
└─ Check GitLab API limits → Wait or upgrade plan
```
