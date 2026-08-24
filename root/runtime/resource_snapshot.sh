#!/bin/bash
# Resource Snapshot Script for ROOT
echo "--- RESOURCE SNAPSHOT ---"
date
echo "[CPU]"
top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print "Usage: " 100 - $1 "%"}'
echo "[RAM]"
free -m | awk 'NR==2{printf "Used: %sMB / Total: %sMB (%.2f%%)\n", $3, $2, $3*100/$2 }'
echo "[LOAD]"
uptime | awk -F'load average:' '{ print $2 }'
echo "-------------------------"
