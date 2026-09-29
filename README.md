# Sahasra Garments E-Commerce v1.0 — Master Codebase

A modular, reusable, production-ready fashion & garments e-commerce platform designed by **Sahasra Infotech Solutions Private Limited**.

Built as a **Master Template** that can be rapidly customized and deployed for multiple clothing stores, fashion brands, boutiques, textile houses, and saree retailers without changing the core application codebase.

---

## 1. Key Features

- **Storefront**:
  - High-fashion responsive homepage with configurable hero and promo banners.
  - Full product catalog with multi-facet filters: Categories, Brands, Sizes, Colors, and Price.
  - Garment Variant Engine: Complete independent SKU, stock, and pricing for Size/Color combinations.
  - Live search with debounced matching against titles, SKUs, fabrics, and tags.
  - Cart with coupon discount verification, automatic GST tax calculation, and free shipping thresholds.
  - Multi-step structured checkout supporting both Cash on Delivery (COD) and Online Payments.
  - Instant WhatsApp integration: Inquiries and order support with pre-filled messages.
  - Customer Accounts: Order tracking, visual status progression, and printable GST Tax Invoices.
  - Static policies: About Us, Contact, Privacy, Terms, Shipping Policy, and Return Policy.

- **Admin Portal (`/admin`)**:
  - Performance Dashboard: Real-time revenue, order counts, pending alerts, and low-stock warnings.
  - Product Management: Variant matrix generator, cloud image manager, and pricing/tagging controls.
  - Hierarchical Categories: Reorderable department and subcategory taxonomy.
  - Variant-Aware Inventory: Live stock controls with quick increment/decrement and low-stock alerts.
  - Order Fulfillment: Complete lifecycle transitions (`CONFIRMED` → `PROCESSING` → `PACKED` → `SHIPPED` → `DELIVERED`).
  - Customer Directory: Order histories and lifetime spending analytics.
  - Promotional Coupons: Percentage and fixed discounts with minimum order rules and caps.
  - Banner Management: Homepage hero slides and mid-page promotional banners.
  - Store Customization Settings: Centralized configuration for brand name, colors, helpline, WhatsApp, GSTIN, and policies.

---

## 2. Technology Stack

- **Framework**: Next.js 14 (App Router, Server Components & Server Actions)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS with CSS Variables for dynamic brand themes
- **Icons**: Lucide React
- **Database**: PostgreSQL
- **ORM**: Prisma ORM
- **Authentication**: JWT session tokens via `jose` and salted `bcryptjs` password hashing

---

## 3. Installation & Setup

### Prerequisites
- Node.js 18+ (Node 20 or 22 recommended)
- PostgreSQL 14+ running locally or in the cloud

### Steps

1. **Clone and Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Set your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://postgres:admin123@localhost:5432/sahasra_garments?schema=public"
   AUTH_SECRET="sahasra_master_ecommerce_super_secure_jwt_secret_key_2026_x99"
   DEFAULT_STORE_ID="default-store"
   NEXT_PUBLIC_STORE_URL="http://localhost:3000"
   ```

3. **Initialize Database Schema**:
   ```bash
   npx prisma db push
   ```

4. **Seed Demo Data & Admin Account**:
   ```bash
   node prisma/seed.js
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the storefront.

---

## 4. Default Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Store Administrator** | `admin@sahasra.com` | `Admin@12345` |
| **Demo Customer** | `customer@demo.com` | `Customer@12345` |

*(Quick-fill buttons are also available on `/login` for evaluation)*

---

## 5. Client Customization Process

To deploy this master template for a new client:

1. **Clone the master codebase** for the new client project.
2. **Point `DATABASE_URL`** to the client's PostgreSQL instance.
3. Run `npx prisma db push` and `node prisma/seed.js`.
4. Log into `/admin` with the admin credentials.
5. Navigate to **Store Settings** (`/admin/settings`) and configure:
   - **Store Name**, **Short Name**, **Tagline**, **Description**
   - **Brand Colors** (Primary, Secondary)
   - **Helpline Phone**, **WhatsApp Business Number**, **Support Email**
   - **Boutique Address**, **City**, **State**, **Pincode**
   - **GSTIN** and **Tax Rate**
   - **Shipping Rules** (Standard charge and free shipping threshold)
   - **Social Links** and **SEO Metadata**
6. Go to **Categories** & **Products** to upload the client's actual catalog.
7. Go to **Banners** to upload their promotional imagery.
8. Deploy to Vercel, VPS, or Docker container.

---

## 6. Production Build

Verify TypeScript compilation and Next.js production build:
```bash
npm run build
```

Start the production server:
```bash
npm start
```
