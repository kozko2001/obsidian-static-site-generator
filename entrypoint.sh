#!/bin/bash

mkdir /home/obsidian/.config

# Start vnc wm
vncserver :0 -geometry 1624x1024 -depth 24 -rfbauth /opt/.vnc/passwd &

# Start noVNC
/opt/novnc/utils/novnc_proxy --vnc localhost:5900 --listen 6080 &

sleep 3
echo "Waiting... you can connect using VNC http://localhost:6080/vnc.html"
read 

# Start obsidian
cd /app
npm run export -- --vault /vault --output /output

# Stop container after obsidian
pkill bash
