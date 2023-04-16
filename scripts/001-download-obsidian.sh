curl -L https://github.com/obsidianmd/obsidian-releases/releases/download/v1.1.16/Obsidian-1.1.16.AppImage  --output /tmp/obsidian.AppImage

chmod +x /tmp/obsidian.AppImage

/tmp/obsidian.AppImage --appimage-extract

mv squashfs-root /tmp/obsidian-root
