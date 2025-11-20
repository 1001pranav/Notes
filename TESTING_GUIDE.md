# N8N Workflow Testing Guide

This guide helps you test the GitLab PR Code Review workflow before going live.

## Files Overview

1. **gitlab-pr-code-review.json** - Main production workflow
2. **gitlab-pr-code-review-TEST.json** - Simple test workflow to verify AI connections
3. **code-review-rules.md** - Code review rules template

## Quick Start Testing

### Step 1: Import Test Workflow

1. Open N8N
2. Go to **Workflows** → **Add Workflow** → **Import from File**
3. Select `gitlab-pr-code-review-TEST.json`
4. Click **Import**

### Step 2: Configure AI Credentials

The test workflow includes both OpenAI and Claude nodes. Configure at least one:

#### Option A: OpenAI (ChatGPT)
1. In N8N, go to **Credentials** → **Add Credential**
2. Search for **OpenAI API**
3. Enter your API key from https://platform.openai.com/api-keys
4. Save and assign to the **"OpenAI (ChatGPT)"** node

#### Option B: Anthropic (Claude)
1. In N8N, go to **Credentials** → **Add Credential**
2. Search for **Anthropic API**
3. Enter your API key from https://console.anthropic.com/settings/keys
4. Save and assign to the **"Claude (Anthropic)"** node

**Note**: You can test with just one AI provider. Delete the node you're not using.

### Step 3: Activate Test Workflow

1. Click the **Active** toggle to enable the test workflow
2. Note the **Webhook URL** from the "Test Webhook" node
   - Example: `https://your-n8n.com/webhook/gitlab-mr-webhook-test`

### Step 4: Send Test Request

Use `curl` to send a test webhook:

```bash
# Replace with your N8N webhook URL
curl -X POST https://your-n8n.com/webhook/gitlab-mr-webhook-test \
  -H "Content-Type: application/json" \
  -d '{
    "test": "Hello from test!",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "project": "test-project",
    "message": "Testing AI integration"
  }'
```

### Step 5: Check Response

You should receive a JSON response like:

```json
{
  "status": "success",
  "message": "AI integration test completed successfully!",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "aiResponses": [
    {
      "model": "gpt-4",
      "response": "Hello! I've analyzed the webhook data..."
    },
    {
      "model": "claude-3-5-sonnet-20241022",
      "response": "Greetings! The integration is working correctly..."
    }
  ],
  "summary": "Tested 2 AI model(s)"
}
```

## Test Scenarios

### Test 1: Basic Connectivity
```bash
curl -X POST YOUR_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"test": "basic"}'
```

**Expected**: JSON response with AI greeting and data summary

### Test 2: Simulate GitLab Webhook
```bash
curl -X POST YOUR_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{
    "object_kind": "merge_request",
    "project": {
      "name": "test-project",
      "id": 123
    },
    "object_attributes": {
      "title": "Test MR",
      "iid": 1,
      "action": "open"
    }
  }'
```

**Expected**: AI analyzes the simulated GitLab data

### Test 3: Load Testing
```bash
# Send 10 requests in sequence
for i in {1..10}; do
  curl -X POST YOUR_WEBHOOK_URL \
    -H "Content-Type: application/json" \
    -d "{\"test\": \"request_$i\"}"
  echo "\nRequest $i completed"
done
```

**Expected**: All requests succeed without errors

## Troubleshooting Test Workflow

### Issue: No response or timeout
**Solution**:
- Check N8N is running
- Verify workflow is activated (toggle is ON)
- Check N8N logs for errors
- Verify firewall allows incoming webhooks

### Issue: "Unauthorized" or API errors
**Solution**:
- Check AI credentials are configured
- Verify API keys are valid and have credits
- Test API key directly:
  ```bash
  # Test OpenAI
  curl https://api.openai.com/v1/models \
    -H "Authorization: Bearer YOUR_API_KEY"

  # Test Anthropic
  curl https://api.anthropic.com/v1/messages \
    -H "x-api-key: YOUR_API_KEY" \
    -H "anthropic-version: 2023-06-01"
  ```

### Issue: Only one AI responds (when testing both)
**Solution**: This is normal if you only configured one credential. Delete the unused node or configure both.

### Issue: Webhook URL not accessible
**Solution**:
- For local N8N: Use `ngrok` or similar tunnel
  ```bash
  ngrok http 5678
  # Use the ngrok URL for testing
  ```
- For cloud N8N: Check DNS and SSL settings

## Production Workflow Testing

Once the TEST workflow passes, test the main workflow:

### Step 1: Import Main Workflow

1. Import `gitlab-pr-code-review.json`
2. Configure GitLab API credentials
3. Configure at least one AI provider (Claude or ChatGPT)
4. Update "Extract & Configure" node if needed

### Step 2: Create Test GitLab MR

```bash
# In your GitLab project
git checkout -b test-code-review
echo "# Test file" > test.md
git add test.md
git commit -m "Test: code review workflow"
git push origin test-code-review

# Create MR via GitLab UI or CLI
```

### Step 3: Configure GitLab Webhook

1. Go to GitLab project → **Settings** → **Webhooks**
2. URL: Your N8N webhook URL from main workflow
3. Trigger: **Merge request events**
4. Click **Add webhook**
5. Click **Test** → **Merge Request events**

### Step 4: Verify Review Comment

1. Check the test MR in GitLab
2. Look for AI-generated review comment
3. Check N8N execution logs for any errors

## AI Node Configuration

### Main Workflow AI Options

The main workflow (`gitlab-pr-code-review.json`) includes two AI nodes by default:

**1. Claude Code Review Node**
- Model: `claude-3-5-sonnet-20241022`
- Max Tokens: 4000
- Temperature: 0.3 (focused, consistent)
- Best for: Detailed, thorough reviews

**2. ChatGPT Code Review Node**
- Model: `gpt-4-turbo-preview`
- Max Tokens: 4000
- Temperature: 0.3 (focused, consistent)
- Best for: Fast, cost-effective reviews

**Choose One or Both:**
- **Use Only Claude**: Delete "ChatGPT Code Review" node
- **Use Only ChatGPT**: Delete "Claude Code Review" node
- **Use Both**: Keep both for comparative reviews (runs in parallel)

### Customizing AI Models

To change AI models, edit the node parameters:

**For Claude:**
```javascript
// In "Claude Code Review" node
model: "claude-3-5-sonnet-20241022"    // Recommended
// OR
model: "claude-3-opus-20240229"        // Most capable, expensive
// OR
model: "claude-3-haiku-20240307"       // Fastest, cheapest
```

**For ChatGPT:**
```javascript
// In "ChatGPT Code Review" node
model: "gpt-4-turbo-preview"           // Recommended
// OR
model: "gpt-4"                         // Most capable
// OR
model: "gpt-3.5-turbo"                 // Fastest, cheapest
```

## Advanced Testing

### Test with Real GitLab Payload

Save this as `gitlab-webhook-payload.json`:

```json
{
  "object_kind": "merge_request",
  "event_type": "merge_request",
  "user": {
    "name": "Test User",
    "username": "testuser"
  },
  "project": {
    "id": 123,
    "name": "test-project",
    "web_url": "https://gitlab.yourcompany.com/team/test-project"
  },
  "object_attributes": {
    "id": 456,
    "iid": 1,
    "title": "Test: Add new feature",
    "description": "This is a test merge request",
    "state": "opened",
    "action": "open",
    "source_branch": "feature-branch",
    "target_branch": "main",
    "url": "https://gitlab.yourcompany.com/team/test-project/-/merge_requests/1"
  },
  "repository": {
    "name": "test-project",
    "url": "https://gitlab.yourcompany.com/team/test-project"
  }
}
```

Send it:
```bash
curl -X POST YOUR_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d @gitlab-webhook-payload.json
```

### Monitor N8N Execution Logs

1. In N8N, go to **Executions**
2. Click on the latest execution
3. Review each node's output:
   - **Extract & Configure**: Check extracted values
   - **Load Review Rules**: Verify rules loaded
   - **Get MR Diff**: Check diff retrieved
   - **AI Review**: Verify AI response
   - **Post Review**: Confirm comment posted

## Performance Testing

### Measure Response Time

```bash
time curl -X POST YOUR_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"test": "performance"}'
```

**Expected Times:**
- Small MR (< 100 lines): 5-15 seconds
- Medium MR (100-500 lines): 15-30 seconds
- Large MR (500-1000 lines): 30-60 seconds
- Very large MR (> 1000 lines): 1-3 minutes (chunked)

### Test Large Payloads

```bash
# Generate large test data
python3 -c "import json; print(json.dumps({'test': 'x' * 50000}))" | \
  curl -X POST YOUR_WEBHOOK_URL \
    -H "Content-Type: application/json" \
    -d @-
```

## Cost Estimation Testing

Track API costs during testing:

**OpenAI:**
- Check usage: https://platform.openai.com/usage
- View per-request costs in dashboard

**Anthropic:**
- Check usage: https://console.anthropic.com/settings/usage
- View token usage per request

**Calculate per-review cost:**
```
Typical small MR:
- Input: ~2,000 tokens
- Output: ~1,000 tokens
- Claude Sonnet: ~$0.03-0.05
- GPT-4: ~$0.08-0.12
```

## Next Steps

Once testing is complete:

1. ✅ Deactivate test workflow
2. ✅ Activate main workflow
3. ✅ Configure GitLab webhooks for all projects
4. ✅ Add `code-review-rules.md` to each project
5. ✅ Monitor first few real reviews
6. ✅ Adjust rules and configuration as needed

## Support

If you encounter issues:

1. Check N8N execution logs
2. Verify all credentials are configured
3. Test API keys independently
4. Review webhook payload format
5. Check network/firewall settings

For more help:
- N8N Docs: https://docs.n8n.io/
- OpenAI Docs: https://platform.openai.com/docs/
- Anthropic Docs: https://docs.anthropic.com/
