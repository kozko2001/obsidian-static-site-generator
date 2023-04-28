FROM node:18-bullseye

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

RUN useradd -m obsidian

COPY entrypoint.sh /entrypoint.sh
COPY scripts/001-download-obsidian.sh /001-download-obsidian.sh

RUN chmod +x /001-download-obsidian.sh /entrypoint.sh

RUN bash -c "/001-download-obsidian.sh" && \
    chown -R obsidian:obsidian /tmp/obsidian-root

RUN mkdir -p /opt/.vnc && \
    echo "${VNC_PASSWD}" | vncpasswd -f > /opt/.vnc/passwd && \
    chmod 600 /opt/.vnc/passwd && \
    chown obsidian /opt/.vnc/passwd

USER obsidian

# Copy the startup script


EXPOSE $NO_VNC_PORT
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

COPY . /home/obsidian
RUN cd /home/obsidian; npm ci;

# Start the startup script
CMD ["/entrypoint.sh"]
