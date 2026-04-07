"""
QC Hub — Sustainability Intelligence
Water Recycling & Solar ROI Logic
"""

# ─── Constants ────────────────────────────────────────────────────────────────

# Average Water Consumption: 15 Litres per KG of linen
WATER_LITRES_PER_KG = 15.0

# Typical Solar Yield: ~4 Units (kWh) per kWp per day in India
SOLAR_DAILY_YIELD_PER_KWP = 4.0

# Peak Electrical Loads (Electric Heated Models) - approx kW
PEAK_LOADS_ELECTRIC = {
    "WH6-33": 23.0,
    "WH6-20": 18.0,
    "WH6-11": 10.0,
    "TD6-33": 36.0,
    "TD6-20": 30.0,
    "TD6-11": 18.0,
    "SLAB-BOILER": 0.0,  # Boiler is steam source itself
    "AIR-COMP": 2.0
}

# Peak Electrical Loads (Steam Heated Models) - approx kW
PEAK_LOADS_STEAM = {
    "WH6-33": 2.2,
    "WH6-20": 1.5,
    "WH6-11": 1.1,
    "TD6-33": 1.5,
    "TD6-20": 1.0,
    "TD6-11": 1.0,
    "SLAB-BOILER": 1.0, # Controls
    "AIR-COMP": 2.0
}

def calculate_sustainability(data):
    """
    Inputs:
    - items: list of machines (from estimator)
    - heating_type: 'electric' or 'steam'
    - daily_kg: target capacity
    - water_cost_per_kl: cost of water in Rs per Kilolitre
    - electricity_rate: cost of unit in Rs
    - stp_capex_per_kld: approx Rs 80,000 to 120,000 per KLD
    - solar_capex_per_kwp: approx Rs 50,000
    """
    
    heating_type = data.get('heating_type', 'electric').lower()
    items = data.get('items', [])
    daily_kg = float(data.get('daily_kg', 0))
    water_cost_per_kl = float(data.get('water_cost_per_kl', 80)) # Rs per KL
    electricity_rate = float(data.get('electricity_rate', 10))
    
    # ── 1. Peak Load Calculation ──────────────────────────────────────────────
    load_map = PEAK_LOADS_ELECTRIC if heating_type == 'electric' else PEAK_LOADS_STEAM
    total_peak_kw = 0.0
    
    for item in items:
        # Match label to find model ID
        label = item.get('label', '')
        for model_id, peak_kw in load_map.items():
            if model_id in label:
                total_peak_kw += peak_kw * item.get('qty', 1)
                break
    
    # Add buffer for infrastructure/lighting (approx 15%)
    total_peak_kw = round(total_peak_kw * 1.15, 2)

    # ── 2. Water Recycling ROI (STP/ETP) ──────────────────────────────────────
    total_water_daily_litres = daily_kg * WATER_LITRES_PER_KG
    total_water_kld = total_water_daily_litres / 1000.0
    
    # Recycling Recovery Rate: 80%
    recovery_rate = 0.8
    water_saved_kld = total_water_kld * recovery_rate
    
    daily_savings_water = water_saved_kld * water_cost_per_kl
    monthly_savings_water = daily_savings_water * 30
    
    # STP Capex: Approx Rs 1 Lakh per KLD capacity
    stp_capex = water_saved_kld * 100000 
    stp_payback_months = stp_capex / monthly_savings_water if monthly_savings_water > 0 else 0

    # ── 3. Solar ROI ──────────────────────────────────────────────────────────
    # Recommendation: Size solar to 120% of peak load to buffer for cloudy days
    recommended_solar_kwp = round(total_peak_kw * 1.2, 1)
    
    daily_solar_generation = recommended_solar_kwp * SOLAR_DAILY_YIELD_PER_KWP
    daily_savings_solar = daily_solar_generation * electricity_rate
    monthly_savings_solar = daily_savings_solar * 30
    
    # Solar Capex: Approx Rs 55,000 per kWp
    solar_capex = recommended_solar_kwp * 55000
    solar_payback_years = (solar_capex / (monthly_savings_solar * 12)) if monthly_savings_solar > 0 else 0

    return {
        "peak_load_kw": total_peak_kw,
        "water_metrics": {
            "daily_consumption_kld": round(total_water_kld, 2),
            "water_saved_kld": round(water_saved_kld, 2),
            "monthly_savings": round(monthly_savings_water, 2),
            "estimated_stp_capex": round(stp_capex, 2),
            "payback_months": round(stp_payback_months, 1)
        },
        "solar_metrics": {
            "recommended_kwp": recommended_solar_kwp,
            "daily_generation_kwh": round(daily_solar_generation, 2),
            "monthly_savings": round(monthly_savings_solar, 2),
            "estimated_solar_capex": round(solar_capex, 2),
            "payback_years": round(solar_payback_years, 1)
        },
        "co2_reduction_annual_tons": round((daily_solar_generation * 365 * 0.8) / 1000.0, 2) # 0.8kg CO2 per kWh
    }
