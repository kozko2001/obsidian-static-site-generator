#!/bin/bash

mv /home/obsidian/squashfs-root /tmp/obsidian-root

# Start vnc
vncserver :0 -geometry 1024x768 -depth 24 -rfbauth /home/obsidian/.vnc/passwd &

# Start noVNC
/opt/novnc/utils/novnc_proxy --vnc localhost:5900 --listen 6080 &


#websockify -D --web=/opt/novnc/ 6081 localhost:5900 &

# Start xterm
DISPLAY=:0 /tmp/obsidian-root/obsidian --no-sandbox

wait
# Wait for background processes
