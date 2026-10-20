# LAPY PROCARE — RASPBERRY PI 5 (ARM64) & MONGODB ATLAS PRODUCTION GUIDE

This document provides a production-tested, step-by-step deployment procedure to host **LAPY PROCARE** on a **Raspberry Pi 5 (4GB / 8GB ARM64)** with **MongoDB Atlas Cloud Database**, Docker, Nginx, and single unified **Admin & Lead Technician** superuser management.

---

## 1. System Architecture on Raspberry Pi 5

By utilizing **MongoDB Atlas** in the cloud rather than running a heavy local MongoDB database instance on the Pi:
- **Massive RAM Savings:** Frees up ~800MB–1.2GB of physical memory on the Pi 5.
- **Zero Storage Wear:** Eliminates relentless database journal writes and wear on MicroSD / NVMe storage.
- **Automated Cloud Backups:** Your repair tickets, customer data, and invoices remain completely safe in MongoDB Atlas even if your Pi loses power.
- **Unified Superuser:** You are both the **Administrator & Master Technician**. There are no external technician logins or technician assignment bottlenecks.

```
                      Internet / Local Network
                                 │
                                 ▼
         ┌─────────────────────────────────────────────────┐
         │            Raspberry Pi 5 (ARM64)               │
         │                                                 │
         │   Port 3000 (HTTP - Web Application)            │
         │   ┌─────────────────────────────────────────┐   │
         │   │  lapy_frontend (Nginx Alpine)           │   │
         │   │  • Serves React Single Page Application │   │
         │   │  • Gzip compression & asset caching     │   │
         │   │  • Proxies /api/ and /socket.io/ ───────┼─┐ │
         │   └─────────────────────────────────────────┘ │ │
         │                                               │ │
         │   Port 5001 (HTTP - Backend API & Sockets)    │ │
         │   ┌─────────────────────────────────────────┐ │ │
         │   │  lapy_backend (Node.js 20 Alpine) ◄─────┼─┘ │
         │   │  • Express REST API (Port 5001)         │   │
         │   │  • JWT Auth & HTTP-only Cookies         │   │
         │   │  • PDF Invoice & Quotation Generation   │   │
         │   └────────────────────┬────────────────────┘   │
         └────────────────────────┼────────────────────────┘
                                  │ TLS 1.3 / SSL
                                  ▼
                    ┌───────────────────────────┐
                    │    MongoDB Atlas Cloud    │
                    │    Cluster (Replica Set)  │
                    └───────────────────────────┘
```

---

## 2. Step 1: Set Up Free MongoDB Atlas Cluster

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and sign in / register.
2. Click **Build a Database** and select the **M0 Free Cluster** (Shared).
   - Provider: AWS or Google Cloud (choose region closest to Mangaluru/India, e.g., `ap-south-1` Mumbai).
   - Cluster Name: `Cluster0` (or your preferred name).
3. **Configure Database Access:**
   - Go to **Security → Database Access → Add New Database User**.
   - Authentication Method: **Password**.
   - Username: e.g. `lapy_admin`
   - Password: Click *Autogenerate Secure Password* (copy and save this password!).
   - Database User Privileges: `Read and write to any database`.
4. **Configure Network Access:**
   - Go to **Security → Network Access → Add IP Address**.
   - Select **Allow Access From Anywhere (`0.0.0.0/0`)** so your Raspberry Pi can connect regardless of dynamic home/office IP changes.
   - Click **Confirm**.
5. **Get Your Connection String:**
   - Go to **Database → Clusters → Connect → Drivers (Node.js)**.
   - Copy the SRV connection string:
     ```
     mongodb+srv://lapy_admin:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your database user password, and append `/lapy_procare` before the `?` query string:
     ```
     mongodb+srv://lapy_admin:YourSecretPassword@cluster0.xxxx.mongodb.net/lapy_procare?retryWrites=true&w=majority
     ```

---

## 3. Step 2: Prepare Raspberry Pi 5

SSH into your Raspberry Pi 5 or open the terminal:

```bash
# 1. Update OS packages
sudo apt update && sudo apt upgrade -y

# 2. Install official Docker Engine (native ARM64)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Allow your user to run Docker without sudo
sudo usermod -aG docker $USER
newgrp docker

# 4. Install Git & Docker Compose Plugin
sudo apt install -y docker-compose-plugin git

# 5. Verify installation
docker --version
docker compose version
```

---

## 4. Step 3: Clone Repository & Configure Environment

```bash
# 1. Clone repository to your Pi
cd ~
git clone <YOUR_GIT_REPOSITORY_URL> lapy-procare
cd lapy-procare

# 2. Create your production environment file
cp .env.example .env
nano .env
```

Set the following critical variables in `.env`:

```env
# Host Ports Configuration (Different from 80 and 5000)
FRONTEND_PORT=3000
BACKEND_PORT=5001
PORT=5001
NODE_ENV=production
CLIENT_URL=http://<YOUR_RASPBERRY_PI_IP>:3000

# Paste your MongoDB Atlas URI here:
MONGO_URI=mongodb+srv://lapy_admin:YourPassword@cluster0.xxxx.mongodb.net/lapy_procare?retryWrites=true&w=majority

# Strong random keys
JWT_ACCESS_SECRET=paste_long_random_string_here_12345
JWT_REFRESH_SECRET=paste_another_random_string_here_67890
COOKIE_SECRET=paste_cookie_secret_here_abcde
```

Save and exit nano (`Ctrl+O`, `Enter`, `Ctrl+X`).

---

## 5. Step 4: Build & Launch Stack

```bash
# Build multi-architecture ARM64 images and start in background
docker compose up -d --build
```

Docker will build:
1. `lapy_backend` on host port **5001** (Node.js 20 LTS ARM64 native)
2. `lapy_frontend` on host port **3000** (React production bundle built and served via Nginx)

Verify both containers are running and healthy:
```bash
docker compose ps
```

You should see:
- `lapy_backend` — `Up (healthy) 0.0.0.0:5001->5001/tcp`
- `lapy_frontend` — `Up 0.0.0.0:3000->80/tcp`

---

## 6. Step 5: Seed MongoDB Atlas Database

Initialize the database in MongoDB Atlas with default administrative settings, inventory items, and test accounts:

```bash
docker compose exec backend npm run seed
```

This provisions:
- **Admin & Lead Technician:**
  - Email: `admin@lapyprocare.com`
  - Password: `Admin@Lapy2026!`
- **Customer Account:**
  - Email: `customer@gmail.com`
  - Password: `Customer@123`

*(Technician login is removed because the Admin superuser handles all diagnostic notes, repairs, and completions directly).*

---

## 7. Step 6: Access LAPY PROCARE

Open your web browser from any phone, laptop, or tablet connected to your local network:
- **Web Application:** `http://<YOUR_RASPBERRY_PI_IP>:3000`
- **Admin Suite:** `http://<YOUR_RASPBERRY_PI_IP>:3000/login` → Sign in with `admin@lapyprocare.com`
- **Customer Portal:** `http://<YOUR_RASPBERRY_PI_IP>:3000/login` → Sign in with `customer@gmail.com`
- **Direct Backend API / Health:** `http://<YOUR_RASPBERRY_PI_IP>:5001/health`

---

## 8. Making LAPY PROCARE Public with Cloudflare Tunnel (Free HTTPS)

To expose your Raspberry Pi website to customers across the internet with a free SSL certificate without opening router ports:

1. Install Cloudflare Tunnel (`cloudflared`) on your Pi:
   ```bash
   curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
   sudo dpkg -i cloudflared.deb
   ```
2. Authenticate and create a tunnel:
   ```bash
   cloudflared tunnel login
   cloudflared tunnel create lapy-tunnel
   ```
3. Route your domain (e.g. `repair.lapyprocare.com`) to `http://localhost:80`:
   ```bash
   cloudflared tunnel route dns lapy-tunnel repair.lapyprocare.com
   ```
4. Run tunnel as a persistent systemd service:
   ```bash
   sudo cloudflared service install <YOUR_TUNNEL_TOKEN>
   ```

Your platform is now live on the internet with automatic SSL, DDoS protection, and high-speed global caching.

---

## 9. Useful Maintenance Commands

```bash
# View real-time logs
docker compose logs -f

# View backend logs only
docker compose logs -f backend

# Restart the entire stack
docker compose restart

# Stop the stack
docker compose down

# Re-run database seeding
docker compose exec backend npm run seed

# Update to latest git changes
git pull
docker compose up -d --build
```
