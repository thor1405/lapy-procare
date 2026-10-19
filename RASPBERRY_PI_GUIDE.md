# LAPY PROCARE — RASPBERRY PI 5 (ARM64) & LINUX PRODUCTION DEPLOYMENT GUIDE

This document provides a production-tested, step-by-step deployment procedure to host **LAPY PROCARE** on a **Raspberry Pi 5 (8GB / 4GB ARM64)** or any Ubuntu / Debian Linux server using Docker, Nginx, and Cloudflare Tunnel for secure HTTPS without port forwarding.

---

## 1. System Prerequisites
- **Hardware:** Raspberry Pi 5 (4GB or 8GB recommended) with active cooling / heatsink case.
- **Operating System:** Raspberry Pi OS 64-bit (Bookworm) or Ubuntu Server 24.04 LTS (aarch64 / ARM64).
- **Storage:** High Endurance NVMe PCIe HAT or SanDisk Extreme A2 MicroSD (32GB+).
- **Network:** Static local IP address or DHCP reservation on your local router.

---

## 2. Install Docker & Docker Compose on Raspberry Pi 5

Run the following commands on your Raspberry Pi:

```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install official Docker engine
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Add current user to docker group (to run without sudo)
sudo usermod -aG docker $USER
newgrp docker

# 4. Install Docker Compose plugin
sudo apt install -y docker-compose-plugin git

# 5. Verify ARM64 Docker installation
docker --version
docker compose version
```

---

## 3. Clone Repository & Setup Environment

```bash
# 1. Clone repository into home directory
cd /home/pi
git clone <YOUR_GIT_REPOSITORY_URL> lapy-procare
cd lapy-procare

# 2. Prepare environment configuration
cp backend/.env.example backend/.env
nano backend/.env
```

Ensure your `backend/.env` has secure keys configured:
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb://mongo:27017/lapy_procare
CLIENT_URL=https://your-domain.com
JWT_ACCESS_SECRET=your_generated_random_64_character_hex_string
JWT_REFRESH_SECRET=your_generated_random_64_character_hex_string
COOKIE_SECRET=your_generated_random_cookie_secret
OPENAI_API_KEY=your_openai_key_if_using_ai
```

---

## 4. Seed Database on ARM64

To initialize the default Administrator, Technician, sample inventory, and service catalogs:

```bash
# Start MongoDB first
docker compose up -d mongo

# Run seed script inside backend container
docker compose run --rm backend npm run seed
```

Default credentials provisioned:
- **Admin:** `admin@lapyprocare.com` / `Admin@Lapy2026!`
- **Technician:** `technician@lapyprocare.com` / `Tech@Lapy2026!`
- **Customer:** `customer@gmail.com` / `Customer@123`

---

## 5. Build & Launch LAPY PROCARE Stack

```bash
# Build multi-architecture ARM64 images and start stack in background
docker compose up -d --build

# Verify running containers
docker compose ps
```

All 3 containers should report healthy and running:
1. `lapy_mongo` on `27017`
2. `lapy_backend` on `5000`
3. `lapy_frontend` on `80` (Serving React static bundle + Nginx proxy to backend)

---

## 6. Zero-Config HTTPS via Cloudflare Tunnel (Recommended)

To securely expose Lapy Procare to the public internet with high performance, free SSL, and DDoS mitigation without opening router ports:

```bash
# 1. Install cloudflared on ARM64
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
sudo dpkg -i cloudflared.deb

# 2. Login to your Cloudflare account
cloudflared tunnel login

# 3. Create a tunnel named lapy-tunnel
cloudflared tunnel create lapy-tunnel

# 4. Route your domain (e.g., lapyprocare.com) to the local Nginx container (port 80)
# Configure ~/.cloudflared/config.yml:
tunnel: <TUNNEL_UUID>
credentials-file: /home/pi/.cloudflared/<TUNNEL_UUID>.json

ingress:
  - hostname: lapyprocare.com
    service: http://localhost:80
  - service: http_status:404

# 5. Install as systemd background daemon
sudo cloudflared service install
sudo systemctl enable --now cloudflared
```

Your Lapy Procare platform is now live on `https://lapyprocare.com` directly powered by your Raspberry Pi 5!

---

## 7. Performance & Maintenance on Raspberry Pi 5

- **Check logs:**
  ```bash
  docker compose logs -f backend
  ```
- **Automated restart on boot:**
  Docker containers are configured with `restart: always` to automatically boot up after power outages.
- **NVMe performance tuning:**
  If using an NVMe HAT on Raspberry Pi 5, add `dtparam=pciex1_gen=3` to `/boot/firmware/config.txt` to enable PCIe Gen 3.0 speeds (~850 MB/s disk I/O).
