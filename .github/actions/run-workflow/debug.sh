run_id=15204135661
REPO=opencrvs/opencrvs-farajaland
status=""
MAX_ATTEMPTS=120
message_counter=0
POLL_INTERVAL=1
attempt=0
while [[ "$status" != "completed" && $attempt -lt $MAX_ATTEMPTS ]]; do
    status=$(gh run view "$run_id" --repo "$REPO" --json status -q '.status')
    [[ "$status" == "completed" ]] && break
    sleep $POLL_INTERVAL
    ((attempt++))
    if (( attempt % 6 == 0 )); then
        message_counter=$((message_counter + 1))
        if (( message_counter % 2 == 0 )); then
            echo "⏳ Still waiting for the workflow to complete..."
        else
            echo "⏳ Still waiting for the workflow to complete... (2)"
        fi
    fi
done