# Connecting AI Nodes in N8N - Complete Guide

This guide shows you how to connect the "Prepare Code for Review" node to AI nodes (Claude, ChatGPT, or both) in the N8N workflow.

## Overview

The workflow flow for AI review:

```
Prepare Code for Review → AI Node(s) → Combine Reviews → Post to GitLab
```

## Connection Diagram

```
┌──────────────────────────┐
│ Prepare Code for Review  │
│ (JavaScript code)        │
│ Output: {prompt, ...}    │
└────────────┬─────────────┘
             │
             ├─────────────────────────┐
             ↓                         ↓
    ┌────────────────┐      ┌────────────────┐
    │ Claude Review  │      │ ChatGPT Review │
    │ (AI Node)      │      │ (AI Node)      │
    │ Input: prompt  │      │ Input: prompt  │
    └────────┬───────┘      └────────┬───────┘
             │                       │
             └───────────┬───────────┘
                         ↓
                ┌─────────────────┐
                │ Combine Reviews │
                └─────────────────┘
```

## Step-by-Step Connection in N8N UI

### Step 1: Open the Workflow

1. Open N8N at `http://localhost:5678`
2. Import `gitlab-pr-code-review.json`
3. You'll see all nodes on the canvas

### Step 2: Locate the Nodes

Find these nodes:
- **Prepare Code for Review** (JavaScript node with code icon)
- **Claude Code Review** (Anthropic AI node)
- **ChatGPT Code Review** (OpenAI AI node)
- **Combine Reviews** (JavaScript node)

### Step 3: Connect Prepare Code → AI Nodes

**Visual Connection Method:**

1. **Click on "Prepare Code for Review" node**
   - You'll see a small circle/dot on the right side of the node

2. **Drag from the dot to "Claude Code Review"**
   - Click and hold the dot
   - Drag to the "Claude Code Review" node
   - Release - a connecting line appears

3. **Drag from the same dot to "ChatGPT Code Review"**
   - Click the dot on "Prepare Code for Review" again
   - Drag to "ChatGPT Code Review" node
   - Release - another line appears

Now you have **parallel connections**:
```
Prepare Code for Review ──→ Claude Code Review
                       └──→ ChatGPT Code Review
```

**Alternative: Using Connection Panel**

1. Click on **"Claude Code Review"** node
2. In the left panel, look for **"Input"** section
3. Click the dropdown under "Input"
4. Select **"Prepare Code for Review"**
5. Repeat for **"ChatGPT Code Review"** node

### Step 4: Connect AI Nodes → Combine Reviews

1. **Click on "Claude Code Review" node**
2. **Drag the dot** on the right side to **"Combine Reviews"**
3. **Click on "ChatGPT Code Review" node**
4. **Drag the dot** to the same **"Combine Reviews"** node

Now both AI outputs feed into Combine Reviews:
```
Claude Code Review ──→ Combine Reviews
ChatGPT Code Review ─→
```

### Step 5: Verify Connections

Click on **"Combine Reviews"** node and check:
- Input section should show: **2 inputs**
- Sources: "Claude Code Review" and "ChatGPT Code Review"

## Configuring AI Nodes to Receive the Prompt

### Claude Code Review Node

1. **Click on "Claude Code Review" node**
2. In the **Parameters** panel:
   - **Model**: `claude-3-5-sonnet-20241022`
   - **Text/Prompt**: `={{$json.prompt}}`
   - **Max Tokens**: `4000`
   - **Temperature**: `0.3`

3. **Important**: The `={{$json.prompt}}` expression tells Claude to use the `prompt` field from the previous node's output

4. **Add Credentials**:
   - Click **"Select Credential"**
   - Choose your Anthropic API credential
   - Or create new: **"Create New Credential"** → Enter API key

### ChatGPT Code Review Node

1. **Click on "ChatGPT Code Review" node**
2. In the **Parameters** panel:
   - **Model**: `gpt-4-turbo-preview` or `gpt-4`
   - **Messages**:
     - Role: `user`
     - Content: `={{$json.prompt}}`
   - **Max Tokens**: `4000`
   - **Temperature**: `0.3`

3. **Add Credentials**:
   - Click **"Select Credential"**
   - Choose your OpenAI API credential
   - Or create new: **"Create New Credential"** → Enter API key

## Understanding Data Flow

### From Prepare Code for Review

The "Prepare Code for Review" node outputs this JSON structure:

```json
{
  "projectId": 123,
  "mrIid": 1,
  "mrTitle": "Add new feature",
  "mrUrl": "https://gitlab.com/project/-/merge_requests/1",
  "gitlabUrl": "https://gitlab.com",
  "chunkIndex": 0,
  "totalChunks": 1,
  "files": ["src/index.js", "src/app.js"],
  "prompt": "You are an expert code reviewer...\n\n**Code Changes:**\n### File: src/index.js\n```diff\n+ new code\n```",
  "diffText": "### File: src/index.js..."
}
```

### AI Nodes Use the Prompt

Both AI nodes access the `prompt` field using the expression:
```javascript
={{$json.prompt}}
```

This tells N8N:
- `$json` = the JSON output from the previous node
- `.prompt` = access the "prompt" field
- The full code review prompt is passed to the AI

### AI Nodes Output

Each AI node returns:

```json
{
  "response": {
    "output": "## Code Review\n\n### Critical Issues\n- Issue 1...\n\n### Suggestions\n- Suggestion 1..."
  },
  "model": "claude-3-5-sonnet-20241022",
  // ... other metadata
}
```

### Combine Reviews Merges Outputs

The "Combine Reviews" node:
1. Receives outputs from BOTH AI nodes
2. Extracts the review text from each
3. Combines them into one final review
4. Outputs to "Post Review to GitLab"

## Configuration Options

### Option 1: Use Only Claude

1. **Delete "ChatGPT Code Review" node**
   - Right-click node → Delete
2. **Connect directly**: Prepare Code → Claude → Combine Reviews
3. **Update Combine Reviews** (optional):
   - The code already handles single or multiple inputs
   - No changes needed!

### Option 2: Use Only ChatGPT

1. **Delete "Claude Code Review" node**
2. **Connect**: Prepare Code → ChatGPT → Combine Reviews
3. No other changes needed

### Option 3: Use Both (Default)

Keep both nodes connected as shown above. They'll run in **parallel**:
- Both receive the same prompt
- Both generate reviews simultaneously
- Combine Reviews merges both outputs
- Final comment shows reviews from both AIs

### Option 4: Use Different AI for Different Scenarios

You can add conditional logic:

1. **Add IF node** after "Prepare Code for Review"
2. **Condition**: Check file size, language, or other criteria
3. **Route to different AI** based on condition

Example:
```
Prepare Code → IF (check file size)
                ├─ Small files → Claude Haiku (fast, cheap)
                └─ Large files → GPT-4 (more capable)
```

## Testing the Connection

### Test Method 1: Manual Execution

1. **Click "Execute Workflow"** button (top right)
2. N8N will simulate a workflow run
3. **Watch the flow**:
   - Each node lights up as it executes
   - Lines between nodes show data flowing
4. **Check each node**:
   - Click on "Prepare Code for Review" → See output with prompt
   - Click on "Claude Code Review" → See AI response
   - Click on "ChatGPT Code Review" → See AI response
   - Click on "Combine Reviews" → See merged output

### Test Method 2: Use Test Webhook

1. **Click "Listen for test event"** on webhook node
2. Send a test POST request (see LOCALHOST_TESTING.md)
3. Watch the execution in real-time

### Test Method 3: Check Node Configuration

Click on each AI node and verify:

**Claude Node:**
```
✓ Text field shows: ={{$json.prompt}}
✓ Credential is selected
✓ Model is set
```

**ChatGPT Node:**
```
✓ Messages → Content shows: ={{$json.prompt}}
✓ Credential is selected
✓ Model is set
```

## Troubleshooting Connection Issues

### Issue: AI Node Not Receiving Prompt

**Symptoms:**
- AI node shows error: "Prompt is required"
- AI node output is empty

**Solution:**
1. Check the expression in AI node is exactly: `={{$json.prompt}}`
2. Click "Prepare Code for Review" node and verify output has `prompt` field
3. Check connection line exists between nodes

### Issue: Connection Line Missing

**Symptoms:**
- Nodes appear disconnected
- Workflow doesn't execute AI nodes

**Solution:**
1. Delete any existing connection (click line → Delete)
2. Recreate connection: Drag from source dot to target node
3. Verify connection appears in target node's "Input" section

### Issue: AI Returns Error

**Symptoms:**
- "API key invalid"
- "Rate limit exceeded"
- "Model not found"

**Solution:**
1. **Check credentials**: Credentials → Edit → Verify API key
2. **Test API key externally**:
   ```bash
   # Test OpenAI
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer YOUR_API_KEY"

   # Test Anthropic
   curl https://api.anthropic.com/v1/messages \
     -H "x-api-key: YOUR_API_KEY" \
     -H "anthropic-version: 2023-06-01" \
     -H "Content-Type: application/json" \
     -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":10,"messages":[{"role":"user","content":"hi"}]}'
   ```
3. **Check model name** matches available models
4. **Verify API has credits**

### Issue: Combine Reviews Gets No Data

**Symptoms:**
- "Combine Reviews" node shows no input
- Final comment is empty

**Solution:**
1. Check AI nodes are connected to "Combine Reviews"
2. Verify AI nodes completed successfully (green checkmark)
3. Check "Combine Reviews" input shows: "2 inputs" or "1 input"

## Advanced Connection Patterns

### Pattern 1: Fallback AI

If primary AI fails, use backup:

```
Prepare Code → Claude (primary)
            └→ IF (on error) → ChatGPT (fallback)
```

### Pattern 2: Cost Optimization

Use cheaper AI for simple reviews:

```
Prepare Code → IF (lines changed < 100)
                ├─ True → Claude Haiku
                └─ False → Claude Sonnet
```

### Pattern 3: Parallel + Sequential

Get quick summary, then detailed review:

```
Prepare Code → ChatGPT (fast summary) → Post summary
            └→ Claude (detailed) → Wait 30s → Post detailed
```

### Pattern 4: Multi-Model Consensus

Use multiple AIs and require agreement:

```
Prepare Code → Claude
            → ChatGPT
            → Gemini
            → Combine → Check consensus → Post if 2/3 agree
```

## Viewing Connection Details

### In N8N Canvas:

- **Solid line**: Active connection
- **Dotted line**: Disabled connection
- **Arrow**: Data flow direction
- **Number badge**: Multiple items passing through

### In Node Settings:

Click any node → Look at **"Input"** section:
- Shows which node(s) feed into this node
- Shows connection index (if multiple connections)

### In Execution View:

After running workflow:
- Click **"Executions"** tab
- Click on an execution
- Click the line between nodes to see data passed

## Complete Connection Checklist

Before running workflow, verify:

- [ ] "Prepare Code for Review" connected to AI node(s)
- [ ] AI node(s) connected to "Combine Reviews"
- [ ] AI node parameter shows: `={{$json.prompt}}`
- [ ] AI credentials configured and valid
- [ ] AI model names are correct
- [ ] "Combine Reviews" shows correct number of inputs
- [ ] No red error indicators on nodes
- [ ] Connections appear as solid lines
- [ ] Test execution completes successfully

## Quick Reference

### Essential N8N Expressions for AI Nodes

| Expression | Description | Example Use |
|------------|-------------|-------------|
| `={{$json.prompt}}` | Access prompt from previous node | AI node input |
| `={{$json.diffText}}` | Access raw diff text | Alternative input |
| `={{$json.files}}` | Access file list | Conditional routing |
| `={{$json.totalChunks}}` | Check if chunked | Multi-part handling |
| `={{$input.all()}}` | Get all inputs | Combine Reviews node |

### Node Types

| Node Type | N8N Category | Purpose |
|-----------|--------------|---------|
| Claude Code Review | AI → Anthropic | Claude AI reviews |
| ChatGPT Code Review | AI → OpenAI | GPT-4 reviews |
| Prepare Code | Code → JavaScript | Prepare prompt |
| Combine Reviews | Code → JavaScript | Merge AI outputs |

## Getting Help

If connections still don't work:

1. **Export your workflow**: Workflows → Menu → Export
2. **Check the JSON**: Look for "connections" section
3. **Compare with original**: Diff against `gitlab-pr-code-review.json`
4. **Check N8N docs**: https://docs.n8n.io/workflows/connections/
5. **Test simple workflow**: Create minimal workflow: Webhook → AI → Response

## Video Walkthrough Script

If you want to record yourself setting this up:

1. "Open N8N and import the workflow"
2. "Find the Prepare Code for Review node - it's the JavaScript node here"
3. "I'll connect it to Claude - click and drag from this dot"
4. "Drag to the Claude node and release - see the connection line"
5. "Do the same for ChatGPT - drag from the same dot"
6. "Now both AI nodes receive the prompt in parallel"
7. "Click on Claude node - see the prompt field shows ={{$json.prompt}}"
8. "This expression pulls the prompt from the previous node"
9. "Add your Anthropic API credential here"
10. "Repeat for ChatGPT with your OpenAI credential"
11. "Both AI nodes connect to Combine Reviews - drag from each"
12. "Now click Execute Workflow to test"
13. "See the flow - data goes from Prepare to both AIs, then combines"
14. "Check the output - here's Claude's review, here's ChatGPT's review"
15. "Combined into one final comment that posts to GitLab"

---

You're all set! The AI nodes are now properly connected and will receive the code review prompt from "Prepare Code for Review". 🚀
