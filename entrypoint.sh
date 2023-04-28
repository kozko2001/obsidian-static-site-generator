#!/bin/bash

mkdir /home/obsidian/.config

# Start vnc wm
vncserver :0 -geometry 1624x1024 -depth 24 -rfbauth /opt/.vnc/passwd &

# Start noVNC
/opt/novnc/utils/novnc_proxy --vnc localhost:5900 --listen 6080 &

sleep 3
echo "waiting to start"
read 

# Start obsidian
cd /home/obsidian
node script.js

# Stop container after obsidian
pkill bash
