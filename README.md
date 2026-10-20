# LAPY PROCARE — Enterprise Computer Repair & IT Services Platform

> **Your Technology. Our Expertise.**  
> *Fast. Reliable. Professional.*

LAPY PROCARE is a premium, full-stack MERN (MongoDB, Express, React, Node.js) platform engineered specifically for computer repair centers, chip-level logic board servicing, custom gaming and workstation PC building, networking, and commercial CCTV installation management.

---

## 1. Business Profile & Identity

- **Business Name:** Lapy Procare
- **Email:** [lapyprocare@gmail.com](mailto:lapyprocare@gmail.com)
- **Phone / WhatsApp:** [+91 7666104889](https://wa.me/917666104889)
- **Location:** Near St. Joseph Engineering College, Vamanjoor, Mangaluru, Karnataka – 575028, India
- **Currency:** Indian Rupee (₹, INR)
- **Timezone:** Asia/Kolkata (IST)

---

## 2. Complete Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Zustand, TanStack Query, React Hook Form, Zod, Recharts, Sonner, Canvas Confetti |
| **Backend** | Node.js LTS, Express.js, Socket.IO, Mongoose, JWT + HTTP-only cookies, Bcrypt, Helmet, CORS, Express-Rate-Limit, PDFKit, Multer, Nodemailer, Winston |
| **Database** | MongoDB 7.0 / MongoDB Atlas with atomic sequence counters |
| **DevOps** | Docker, Docker Compose, Nginx Reverse Proxy, Raspberry Pi 5 (ARM64) support, Cloudflare Tunnel |

---

## 3. Key Platform Capabilities

### 🌐 Public Portal & Digital Showcase
- **Dark Premium Aesthetic:** Inspired by Linear, Apple, and Stripe design systems with electric blue `#00AFFF`, deep navy `#050B18`, glassmorphism cards, and subtle glow effects.
- **Service Catalog:** 10 core technology categories (Laptop Motherboards, Desktops, NVMe Upgrades, Custom PCs, CCTV, Enterprise AMC).
- **Public Repair Telemetry:** Privacy-safe tracking where customers query collision-safe ticket IDs (e.g., `LPC-2026-000001`) with live Socket.IO stage transitions.
- **Interactive Custom PC Builder:** Dynamic hardware configurator with real-time socket compatibility checks (LGA1700/AM5), DDR4/DDR5 matching, and PSU peak load calculations.
- **AI Virtual IT Troubleshooter:** Preliminary hardware triage assistant with strict safety rules and immediate service routing.
- **Direct WhatsApp Hub:** Floating action button (`https://wa.me/917666104889`) with pre-templated booking prompts.

### 👤 Customer Experience Portal
- **7-Step Booking Wizard:** Device category, Brand/Model, Problem selection, Photo uploads, Service preference (Drop-off vs. Doorstep), Dynamic capacity-checked slot reservation, and instant collision-safe ticket dispatch.
- **Repair History:** Status progression badges, technician diagnostic notes, and appointment details.
- **Digital Quotations:** Review itemized diagnostic reports, approve/reject estimates, ask clarification questions, and download official PDF estimates.
- **GST Invoices:** Download generated tax invoices with itemized labour, components, and warranty terms.

### 🛡️ Administrator Operations Suite
- **Analytics Dashboard:** Recharts monthly repair volume bar charts and device distribution donut graphs with real data from MongoDB transactions.
- **Booking & Stage Progression:** Search, filter by status, update stages, assign technicians, and log internal or customer-visible notes.
- **Quotation Generator:** Build quotes linking inventory items and labour with automated 18% GST calculation.
- **Invoice & Ledger:** Record customer payments (Cash, UPI, Card, Bank Transfer) and track outstanding balances.
- **Inventory Control:** Monitor spare parts stock, SKU tracking, low-stock threshold warnings, and audit log movements.
- **System Settings:** Control business hours, toggle doorstep availability, and manage AI assistant activation.

### 🔧 Field Technician Workspace
- **Assigned Repair Desk:** View queued jobs, update multimeter diagnostic observations, progress through allowed stages, and submit completion reports.

---

## 4. End-to-End Verified Workflow

```
Customer Registers Account
          │
          ▼
Schedules Repair Booking (Validates Slot Capacity & Generates LPC-YYYY-XXXXXX)
          │
          ▼
Admin & Lead Tech Performs Diagnosis & Logs Component Faults
          │
          ▼
Admin Issues Official Itemized Quotation
          │
          ▼
Customer Digitally Approves Quotation
          │
          ▼
Repair Progresses with Live Socket.IO Updates
          │
          ▼
Testing Complete & Invoice Generated (Downloadable PDF)
          │
          ▼
Device Ready for Collection at Vamanjoor Service Center
```

---

## 5. Local Development Setup

### Prerequisites
- Node.js v20+ and npm
- MongoDB running locally on port `27017` or a MongoDB Atlas URI

### 1. Clone & Install Dependencies

```bash
# Clone repository
git clone <REPO_URL> lapy-procare
cd lapy-procare

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

Create `backend/.env` (see `backend/.env.example` for full options):

```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/lapy_procare?retryWrites=true&w=majority
CLIENT_URL=http://localhost:3000
JWT_ACCESS_SECRET=lapy_procare_super_secure_jwt_access_secret_key_2026_xyz987
JWT_REFRESH_SECRET=lapy_procare_super_secure_jwt_refresh_secret_key_2026_abc123
COOKIE_SECRET=lapy_procare_session_cookie_signature_secret_9999
```

### 3. Seed Database

Populates the default services, inventory, PC parts, and initial accounts:

```bash
cd backend
npm run seed
```

**Default Seed Credentials:**
- **Admin & Lead Tech:** `admin@lapyprocare.com` | `Admin@Lapy2026!`
- **Customer:** `customer@gmail.com` | `Customer@123`

### 4. Run Automated Tests

```bash
cd backend
npm test
```

### 5. Start the Stack

```bash
# Terminal 1: Start Backend (Port 5001)
cd backend
npm run dev

# Terminal 2: Start Frontend (Port 5173)
cd frontend
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 6. Production Deployment with Docker Compose

```bash
# Build and run containers
docker compose up -d --build

# Inspect status
docker compose ps
```

Refer to [RASPBERRY_PI_GUIDE.md](./RASPBERRY_PI_GUIDE.md) for detailed ARM64 and Cloudflare Tunnel instructions.
