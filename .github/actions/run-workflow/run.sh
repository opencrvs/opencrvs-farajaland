#!/usr/bin/env bash
set -euo pipefail

REPO="opencrvs/opencrvs-farajaland"       # Replace with your repo
POLL_INTERVAL=10                    # seconds
MAX_ATTEMPTS=60                     # 10 minutes max

echo "🚀 Triggering workflow $WORKFLOW on ref $REF with $WORKFLOW_ARGS..."
gh workflow run "$WORKFLOW" --repo "$REPO" --ref "$REF" $WORKFLOW_ARGS
echo "⏳ Waiting for workflow run to be listed..."
sleep 10

# Find the latest workflow run ID for the specified workflow
attempt=0
run_id=""
while [[ -z "$run_id" && $attempt -lt $MAX_ATTEMPTS ]]; do
run_id=$(gh run list \
    --repo "$REPO" \
    --workflow "$WORKFLOW" \
    --branch "$REF" \
    --json databaseId,status,headBranch \
    --jq 'map(select(.headBranch == "'"$REF"'")) | .[0].databaseId')

if [[ -n "$run_id" ]]; then
    echo "✅ Found run ID: $run_id"
    break
fi

((attempt++))
sleep $POLL_INTERVAL
done

if [[ -z "$run_id" ]]; then
echo "❌ Failed to find the workflow run after $((POLL_INTERVAL * MAX_ATTEMPTS)) seconds"
exit 1
fi

# TODO: Replace watch with neat output
# Wait for the workflow to complete
echo "⏳ Waiting for run $run_id to complete..."
echo "🔗 https://github.com/$REPO/actions/runs/$run_id"
# Poll until workflow is completed
status=""
MAX_ATTEMPTS=120
message_counter=0
attempt=0
while [[ "$status" != "completed" && $attempt -lt $MAX_ATTEMPTS ]]; do
    status=$(gh run view "$run_id" --repo "$REPO" --json status -q '.status')
    [[ "$status" == "completed" ]] && break
    sleep $POLL_INTERVAL
    ((attempt++))
    echo "incrementing attempt: $attempt"
    if (( attempt % 6 == 0 )); then
        ((message_counter++))
        echo "incrementing message_counter: $message_counter"
        if (( message_counter % 2 == 0 )); then
            echo "⏳ Still waiting for the workflow to complete..."
        else
            echo "⏳ Still waiting for the workflow to complete... (2)"
        fi
    fi
    echo "after loop attempt: $attempt"
done
# Get the result and output relevant summary
conclusion=$(gh run view "$run_id" --repo "$REPO" --json conclusion -q '.conclusion')
echo "🎯 Workflow finished with conclusion: $conclusion"

# Optional: print steps that failed or were skipped
echo "📋 Step summary (empty of all jobs were successful):"
gh run view "$run_id" --repo "$REPO" --json jobs -q '.jobs[].steps[] | select(.conclusion != "success") | "\(.name): \(.conclusion)"'

if [[ "$conclusion" != "success" ]]; then
    echo "❌ Workflow failed or was cancelled"
    exit 1
fi

echo "✅ Workflow succeeded!"
