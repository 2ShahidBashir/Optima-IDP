#!/bin/bash
cd "$(dirname "$0")"
echo "Starting local server..."
echo "Please open http://localhost:8000 in your browser if it doesn't open automatically."
python3 -m http.server 8000 &
PID=$!
sleep 1
open http://localhost:8000
wait $PID
