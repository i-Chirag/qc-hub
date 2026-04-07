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

## P&L Calculation Formula

```
Volume:
  occupied_units = capacity × occupancy%
  kg_per_day     = occupied_units × kg_factor (by industry/type)
  kg_per_month   = kg_per_day × 26 (operating days)

Revenue:
  billing_revenue = kg_per_month × billing_rate
  linen_revenue   = kg_per_month × linen_rate  (if applicable)
  total_revenue   = billing_revenue + linen_revenue

Variable Costs:
  electricity = kg × 0.4 units × electricity_rate
  gas         = kg × consumption_factor × gas_rate
  water       = kg × water_cost_per_kg
  chemicals   = kg × chemical_cost_per_kg (default ₹3)

Fixed Costs:
  labour + miscellaneous

GOI (Gross Operating Income) = Total Revenue − Total Costs
ROI = (GOI × 12) / Total Investment × 100
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
- [ ] Site Survey Module
- [ ] Cost Estimator
- [ ] AI/ML Insights (forecasting, anomaly detection)
- [ ] Multi-user auth
- [ ] PDF report export
- [ ] Mobile app (React Native)
