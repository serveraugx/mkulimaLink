# 🌱 Mkulima Link

**Smart Agriculture for Food Security**  
*Built for Tech & AI Expo Zanzibar 2026 — Challenge 08: Agritech*

Mkulima Link is a two-sided intelligence platform bridging the gap between rural smallholder farmers and modern agronomic intelligence. It synthesizes real-time weather, Sentinel-2 crop health, and live WFP market prices, and delivers them entirely offline via AI-composed SMS.

![Mkulima Link Platform](https://img.shields.io/badge/Status-Expo_Ready-emerald.svg)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js_14_%7C_PostgreSQL_%7C_Prisma-blue)
![Data](https://img.shields.io/badge/Data-Copernicus_%7C_NASA_%7C_WFP-orange)

---

## 🎯 The Problem

Tanzanian smallholders produce the majority of the nation's food, but face two massive bottlenecks:
1. **Farming Blind:** Without smartphones, rural farmers cannot access modern weather forecasting, soil analysis, or early-warning crop health tracking, leading to massive yield losses.
2. **Price Exploitation:** Without access to live spot prices, farmers are routinely underpaid by predatory middlemen who exploit the information gap.

## 💡 The Solution

Mkulima Link fixes the information gap without requiring the farmer to buy a smartphone or a data plan.
* **For Farmers:** Our backend ingests heavy public science data (satellites, weather, soil). Our AI Decision Engine reads it, translates it into actionable Swahili advice, and pushes it to basic feature phones via SMS.
* **For Buyers:** We ingest live UN World Food Programme (WFP) market prices. Buyers can browse farmer listings and buy directly, securing their supply chain while ensuring the farmer gets a fair market premium.

---

## ✨ Key Features

* 🛰️ **Copernicus Satellite Integration:** Live NDVI (Normalized Difference Vegetation Index) calculation using the European Space Agency's Sentinel-2 satellites to track exact crop health trajectories.
* 🌦️ **Climate & Drought Intelligence:** Merges Open-Meteo live forecasting with NASA POWER 30-year climatology baselines to calculate real drought anomalies.
* 🌍 **ISRIC SoilGrids:** Geographic radius search algorithm querying global 250m soil maps for pH and nitrogen levels without physical soil tests.
* 📈 **WFP Market Price Ingestion:** Automated pipeline fetching live Tanzania commodity prices from the Humanitarian Data Exchange (HDX).
* 📱 **Offline AI Advisories:** Gemini-powered Decision Engine synthesizes 6 layers of data into a single, highly contextual Swahili SMS sent via Briq API.
* 🛡️ **Vision AI Disease Check:** Farmers can upload a photo of a sick plant at an internet cafe or via an extension worker. The platform uses a multimodal AI cascade to provide instant Swahili diagnosis and remediation.
* 🤝 **Zero-Middleman Marketplace:** Farmers list produce; commercial buyers can view listings, compare against WFP spot prices, and send binding purchase interests.

---

## 🛠️ Tech Stack & Digital Sovereignty

Mkulima Link is built on an open-source, sovereign architecture:

* **Frontend & Backend:** Next.js 14 (App Router), React, Tailwind CSS, Zustand.
* **Database:** PostgreSQL managed by Prisma ORM.
* **AI Architecture:** Multi-provider fallback cascade:
  1. *Google Gemini (2.5 Flash)* - Primary reasoning and vision.
  2. *Groq (Llama-3/OSS)* - High-speed text fallback.
  3. *Local LLM (Gemma/Llama via LM Studio)* - **Offline sovereign fallback**. Ensures Tanzanian agricultural data can be processed entirely on local servers without relying on foreign internet infrastructure.

---

## 📊 Open Data Sources

We rely entirely on 100% free, public, and open-science data sources:
* **Copernicus Data Space Ecosystem (ESA)** - Satellite Imagery / NDVI.
* **Open-Meteo** - Live Weather Models.
* **NASA POWER** - Historical Climatology & Precipitation.
* **ISRIC SoilGrids 2.0** - Global Soil Maps.
* **UN World Food Programme (WFP)** - Market Prices.
* **FAOSTAT (UN FAO)** - National Crop Yield Data.

---

## 💼 Business Model

**B2B2C Freemium Model:**
* **Farmers:** 100% Free. SMS advisories and marketplace listing cost the farmer nothing.
* **Commercial Buyers / Cooperatives:** SaaS Subscription. Buyers pay for access to the marketplace and aggregate satellite crop-yield forecasting to secure supply chains early.
* **Government / NGOs:** API Licensing. Access to the admin dashboard and anonymized real-time national food security trends.

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites
* Node.js 18+
* Docker (for local PostgreSQL database)

### 2. Environment Variables
Create a `.env.local` file in the root directory:
```env
# Database
DATABASE_URL="postgresql://mkulima:mkulima@localhost:5432/mkulima"
JWT_SECRET="dev-only-change-me-mkulima-secret"

# AI Providers
GEMINI_API_KEY="your_gemini_key"
GEMINI_MODEL="gemini-3.8-flash"

# SMS Configuration (Briq)
BRIQ_API_KEY="your_briq_key"
BRIQ_DEMO_MODE=true # Set to true to bypass actual telecom delivery for demos

# Satellite Configuration
COPERNICUS_CLIENT_ID="your_client_id"
COPERNICUS_CLIENT_SECRET="your_client_secret"
```

### 3. Installation & Setup
```bash
# Install dependencies
npm install

# Start the local database
npm run db:up

# Push the schema and seed the initial data
npx prisma db push
npx prisma db seed

# Run the development server
npm run dev
```

### 4. Demo Accounts
The database is pre-seeded with three roles. Log in at `http://localhost:3000/login`.
All accounts share the password: `mkulima123`

* **Farmer:** `juma@mkulima.demo`
* **Buyer:** `amina@mkulima.demo`
* **Admin:** `admin@mkulima.demo`

---
*Built with ❤️ in Tanzania for Tech & AI Expo Zanzibar 2026.*

