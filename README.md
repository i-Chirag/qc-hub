# QC Hub — Quality Control Platform

A modular platform for laundry operations management.
Built for scalability: multiple modules, Python backend, React frontend, deployable to any host.

---

## Project Structure

```
qc_hub/
├── backend/                  ← Python Flask API
│   ├── app.py                ← Main Flask app + API routes
│   ├── calculator.py         ← P&L / GOI calculation logic
│   ├── models.py             ← SQLAlchemy DB models
│   └── requirements.txt
│
├── frontend/                 ← React (Vite) frontend
│   ├── src/
│   │   ├── api/index.js      ← API service layer
│   │   ├── components/
│   │   │   └── ResultPanel.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   └── PLCalculator.jsx
│   │   ├── App.jsx           ← Routing + Sidebar
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## Setup — Local Development

### Backend (Python)
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
# API running at http://localhost:5000
```

### Frontend (React)
```bash
cd frontend
npm install
npm run dev
# UI running at http://localhost:5173
```

---

## API Endpoints

| Method | Endpoint                  | Description             |
|--------|---------------------------|-------------------------|
| POST   | /api/pl/calculate         | Calculate P&L / GOI     |
| POST   | /api/pl/save              | Save a project           |
| GET    | /api/pl/projects          | List all projects        |
| GET    | /api/pl/projects/:id      | Get single project       |
| DELETE | /api/pl/projects/:id      | Delete project           |
| GET    | /api/health               | Health check             |

---

## P&L Calculation — Financial Digital Twin

The system uses a high-fidelity "Digital Twin" model synchronized with factory-standard operational spreadsheets.

```
Volume:
  kg_per_month   = Capacity (Rooms/Beds) × Linen/Unit (KG) × Operating Days (Manual)

Revenue:
  primary_rev    = kg_per_month × billing_rate
  guest_rev      = guest_laundry_kg × guest_laundry_rate
  surcharge_rev  = kg_per_month × clean_surcharge_rate
  total_revenue  = primary_rev + guest_rev + surcharge_rev (Net)

Variable Costs (Operational):
  electricity    = kg_per_month × 0.30 units/kg × electricity_rate
  gas/png        = kg_per_month × 0.04 units/kg × gas_rate
  water          = kg_per_month × water_cost_per_kg
  chemicals      = kg_per_month × chemical_cost_per_kg (default ₹3)

Fixed Costs (Manpower & Overheads):
  manpower       = (Operators_Qty × Rate) + (Manager_Qty × Rate)
  overheads      = R&M + QC Supervision + Misc + Food + Linen Rental

Result:
  GOP (Gross Operating Profit) = Total Revenue (Net) − Total Expenses
  ROI = (GOP × 12) / Total Investment × 100
  Cost/KG = Total Expenses / kg_per_month
```

---

## 🚀 Go Live (For Free)

You can host this portal online for free using **Vercel** (Frontend) and **Render** (Backend).

### Step 1: Upload to GitHub
Initialize a git repository in this folder and push your code to a new GitHub repository.

### Step 2: Deploy the Backend (on Render.com)
1.  Create a new **Web Service** on Render.
2.  Connect your GitHub repository.
3.  Set the **Root Directory** to `backend`.
4.  Set the **Start Command** to: `gunicorn app:app` (Render will automatically find your `requirements.txt`).
5.  *Wait for the internal URL to be generated (e.g., `https://qc-hub-api.onrender.com`).*

### Step 3: Deploy the Frontend (on Vercel.com)
1.  Import your project from GitHub into Vercel.
2.  Set the **Root Directory** to `frontend`.
3.  Add an **Environment Variable** named `VITE_API_BASE`.
4.  Set the value to: `https://your-backend-url.onrender.com/api`
5.  Click **Deploy**.

Done! Your site will be live at `https://your-project.vercel.app`

---

## Roadmap

- [x] P&L / GOI Calculator
- [x] Site Survey Module
- [x] Cost Estimator
- [x] AI/ML Insights (Diagnostics)
- [ ] **Phase 1: Project Command Center** (Lifecycle Tracking)
- [ ] **Phase 2: Investment-Grade Reports** (Pro PDF Engine)
- [ ] **Phase 3: Sustainability Audit** (Water/Solar STP ROI)
- [ ] **Phase 4: Enterprise Mode** (Auth/Login/Multi-Tenant)
- [ ] Mobile app (React Native)

---

## 🌟 QC Hub Elite — The Roadmap

### 1. The Project Command Center
Move from "calculating" to "managing."
*   **Project Vault:** A centralized table to view, edit, and track status (`Draft` → `Surveyed` → `Approved`).
*   **A/B Comparison:** Side-by-side ROI comparison for different fuel sources (Electric vs. Steam).

### 2. Professional "Investment-Grade" Reports
Generate the documents needed to close a deal.
*   **Executive Summary:** Automated PDF with branding, charts, and 5-year ROI projections.
*   **Technical Audit:** Professional site-readiness reports for engineering teams.

### 3. Sustainability & Optimization
The future of laundry is Green.
*   **Water Recycling ROI:** Analysis of STP/ETP (Sewage Treatment) payback.
*   **Solar ROI:** Sizing solar panels based on laundry peak loads.
*   **AI Optimizer:** Machine mix suggestions for lowest peak load consumption.

### 4. Enterprise Infrastructure
*   **Authentication:** Multi-user login/signup.
*   **Organization Mode:** Manage distinct clients (e.g., Hotel chains vs. Industrial laundries) under one sales account.
