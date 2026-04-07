"""
QC Hub — Water Sustainability Intelligence
Water Recycling ROI Logic (Standalone)
"""

def calculate_sustainability(data):
    """
    Calculates Water Recycling ROI for a standalone hypothetical audit.
    Inputs:
    - daily_kg: target capacity
    - water_cost_per_kl: cost of water in Rs per Kilolitre
    - stp_plant_cost: Manual CAPEX entry for the recycling plant
    """
    daily_kg        = float(data.get('daily_kg', 500))
    water_cost_kl   = float(data.get('water_cost_per_kl', 80))
    stp_plant_cost  = float(data.get('stp_plant_cost', 800000)) # Default CAPEX for STP/ETP

    # 1. Water Recycling Metrics (STP/ETP)
    # Average laundry uses 15L per kg.
    daily_effluent_kl = (daily_kg * 15) / 1000
    # Recovery rate is typically 80% for technical grade water.
    water_saved_kld = daily_effluent_kl * 0.8
    
    monthly_water_saved_kl = water_saved_kld * 30
    monthly_water_savings_rs = monthly_water_saved_kl * water_cost_kl
    
    payback_months = stp_plant_cost / monthly_water_savings_rs if monthly_water_savings_rs > 0 else 0
    
    return {
        "daily_kg": daily_kg,
        "water_metrics": {
            "daily_effluent_kl": round(daily_effluent_kl, 2),
            "water_saved_kld": round(water_saved_kld, 2),
            "monthly_water_saved_kl": round(monthly_water_saved_kl, 1),
            "monthly_savings": round(monthly_water_savings_rs, 2),
            "payback_months": round(payback_months, 1),
            "recovery_percent": 80
        }
    }
