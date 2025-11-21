[Installation & Setup](#2-installation--setup)
   - 2.1 [Installing Docker on Linux](#21-installing-docker-on-linux)
   - 2.2 [Installing Docker on Windows/Mac](#22-installing-docker-on-windowsmac)
   - 2.3 [Verify Installation](#23-verify-installation)
   - 2.4 [Post-Installation Steps](#24-post-installation-steps)

## 2. Installation & Setup

### 2.1 Installing Docker on Linux

**Ubuntu/Debian:**
```bash
# Update package index
sudo apt-get update

# Install prerequisites
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

**CentOS/RHEL:**
```bash
# Install required packages
sudo yum install -y yum-utils

# Add Docker repository
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Install Docker
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker
```

### 2.2 Installing Docker on Windows/Mac

**Windows:**
1. Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop)
2. Run the installer
3. Enable WSL 2 when prompted (recommended)
4. Restart your computer
5. Start Docker Desktop

**Mac:**
1. Download Docker Desktop for Mac
2. Drag to Applications folder
3. Open Docker from Applications
4. Grant necessary permissions

### 2.3 Verify Installation

```bash
# Check Docker version
docker --version
# Output: Docker version 24.0.0, build xxx

# Check Docker Compose version
docker compose version
# Output: Docker Compose version v2.20.0

# Run test container
docker run hello-world
```

**Expected Output:**
```
Hello from Docker!
This message shows that your installation appears to be working correctly.
```

### 2.4 Post-Installation Steps

**Run Docker without sudo (Linux):**
```bash
# Create docker group
sudo groupadd docker

# Add your user to docker group
sudo usermod -aG docker $USER

# Activate changes (or log out and back in)
newgrp docker

# Verify
docker run hello-world
```

**Configure Docker to start on boot:**
```bash
sudo systemctl enable docker.service
sudo systemctl enable containerd.service
```

---

