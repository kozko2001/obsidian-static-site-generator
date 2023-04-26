FROM ubuntu:latest

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive \
    DISPLAY=:0 \
    VNC_PORT=5900 \
    NO_VNC_PORT=6080 \
    VNC_PASSWD="obsidian"

# Install necessary packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        wget \
        unzip \
        net-tools \
        curl \
        git \
        python3-numpy \
        python3 \
        python3-pip \
        xterm \
        net-tools \
        tigervnc-standalone-server \
        tigervnc-common \
        tigervnc-tools \
        git \
        socat \
        libglib2.0-0 libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libgtk-3-0 libgbm1 libasound2 \
        xvfb && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install noVNC
RUN mkdir -p /opt/novnc && \
     git clone https://github.com/novnc/noVNC.git --depth 1 --branch v1.3.0 /opt/novnc \
	&& git clone https://github.com/novnc/websockify /opt/novnc/utils/websockify \
	&& rm -rf /root/noVNC/.git \
	&& rm -rf /root/noVNC/utils/websockify/.git

RUN useradd -m -u 1000 obsidian

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER obsidian

RUN mkdir -p /home/obsidian/.vnc && \
    echo "${VNC_PASSWD}" | vncpasswd -f > /home/obsidian/.vnc/passwd && \
    chmod 600 /home/obsidian/.vnc/passwd
ARG OBSIDIAN_VERSION=0.15.9

RUN \
    echo "**** download obsidian ****" && \
        curl \
        https://github.com/obsidianmd/obsidian-releases/releases/download/v$OBSIDIAN_VERSION/Obsidian-$OBSIDIAN_VERSION.AppImage \
        -L \
        -o /home/obsidian/obsidian.AppImage

RUN \
    echo "**** extract obsidian ****" && \
        chmod +x /home/obsidian/obsidian.AppImage && \
        cd /home/obsidian && \
        /home/obsidian/obsidian.AppImage --appimage-extract 
# Copy the startup script


EXPOSE $VNC_PORT $NO_VNC_PORT

# Start the startup script
CMD ["/entrypoint.sh"]
