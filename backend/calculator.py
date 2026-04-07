"""
QC Hub — P&L Calculator Core Logic
Laundry / Linen Services for Healthcare & Hospitality
"""


# ─── Constants ────────────────────────────────────────────────────────────────

DEFAULT_CHEMICAL_COST_PER_KG = 3.0   # Rs per kg (editable via frontend)

# Kg of linen per bed/room per day (industry benchmarks)
KG_PER_BED_PER_DAY = {
    'healthcare': {
        'private': 3.5,
        'government': 3.0,
        'trust': 3.2,
    },
    'hospitality': {
        'city': {
            'star_3': 2.5,
            'star_4': 3.0,
            'star_5': 3.5,
        },
        'resort': {
            'star_3': 3.2,
            'star_4': 3.8,
            'star_5': 4.5,
        }
    }
}

# Operating days per month
OPERATING_DAYS = 26


def get_kg_factor(data: dict) -> float:
    """Return kg per unit (bed/room) per day based on industry & sub-type."""
    industry = data.get('industry', '').lower()
    sub_type = data.get('sub_type', '').lower()

    if industry == 'healthcare':
        return KG_PER_BED_PER_DAY['healthcare'].get(sub_type, 3.0)
    elif industry == 'hospitality':
        prop_type = data.get('property_type', 'city').lower()
        rating    = data.get('star_rating', 'star_3').lower()
        
        # Get property group (defaults to city)
        prop_group = KG_PER_BED_PER_DAY['hospitality'].get(prop_type, KG_PER_BED_PER_DAY['hospitality']['city'])
        
        # Get rating factor (defaults to 3-star)
        return prop_group.get(rating, 2.5)
    return 3.0


def to_f(val):
    try:
        return float(val) if val else 0.0
    except:
        return 0.0


def calculate_pl(data: dict) -> dict:
    """
    Main P&L calculation function.
    """

    # ── Input Parsing ──────────────────────────────────────────────────────────
    capacity        = to_f(data.get('capacity', 0))
    occupancy_pct   = to_f(data.get('occupancy_pct', 80)) / 100
    billing_rate    = to_f(data.get('billing_rate_per_kg', 0))
    total_investment= to_f(data.get('total_investment', 0))

    electricity_rate    = to_f(data.get('electricity_rate', 0))
    gas_rate            = to_f(data.get('gas_rate', 0))
    water_cost_per_kg   = to_f(data.get('water_cost_per_kg', 0))
    chemical_cost_per_kg= to_f(data.get('chemical_cost_per_kg', DEFAULT_CHEMICAL_COST_PER_KG))
    labour_monthly      = to_f(data.get('labour_cost_monthly', 0))
    linen_rental_charge = to_f(data.get('linen_rental_charge', 0))
    misc_monthly        = to_f(data.get('miscellaneous_monthly', 0))

    # Green Offsets (Monthly Rs)
    green_water_offset  = to_f(data.get('green_water_offset', 0))
    green_solar_offset  = to_f(data.get('green_solar_offset', 0))

    heating_source  = data.get('heating_source', 'electric').lower()
    linen_rental    = data.get('linen_rental', 'without').lower()

    # ── Volume Calculation ─────────────────────────────────────────────────────
    kg_factor = get_kg_factor(data)
    occupied_units = capacity * occupancy_pct

    kg_per_day     = occupied_units * kg_factor
    kg_per_month   = kg_per_day * OPERATING_DAYS

    # ── Revenue ───────────────────────────────────────────────────────────────
    billing_revenue = kg_per_month * billing_rate
    linen_revenue   = (kg_per_month * linen_rental_charge) if linen_rental == 'with' else 0.0
    total_revenue   = billing_revenue + linen_revenue

    # ── Variable Costs ────────────────────────────────────────────────────────
    # Electricity: approx 0.4 units per kg processed
    electricity_cost = (kg_per_month * 0.4 * electricity_rate) - green_solar_offset
    electricity_cost = max(0, electricity_cost)

    # Gas / Heating
    if heating_source == 'lpg':
        # ~0.05 kg LPG per kg linen
        gas_cost = kg_per_month * 0.05 * gas_rate
    elif heating_source == 'png':
        # ~0.06 SCM per kg linen
        gas_cost = kg_per_month * 0.06 * gas_rate
    else:
        gas_cost = 0.0   # electric — captured in electricity_cost

    water_cost      = (kg_per_month * water_cost_per_kg) - green_water_offset
    water_cost      = max(0, water_cost)

    chemical_cost   = kg_per_month * chemical_cost_per_kg

    total_variable_cost = electricity_cost + gas_cost + water_cost + chemical_cost

    # ── Fixed Costs ───────────────────────────────────────────────────────────
    total_fixed_cost = labour_monthly + misc_monthly

    # ── Totals ────────────────────────────────────────────────────────────────
    total_cost  = total_variable_cost + total_fixed_cost
    gross_profit= total_revenue - total_cost   # GOI (Gross Operating Income)

    goi_pct     = (gross_profit / total_revenue * 100) if total_revenue else 0
    cost_per_kg = (total_cost / kg_per_month) if kg_per_month else 0

    # ── ROI ───────────────────────────────────────────────────────────────────
    annual_profit   = gross_profit * 12
    roi_pct         = (annual_profit / total_investment * 100) if total_investment else 0
    payback_months  = (total_investment / gross_profit) if gross_profit > 0 else None

    return {
        # Volume
        'kg_per_day':           round(kg_per_day, 2),
        'kg_per_month':         round(kg_per_month, 2),
        'occupied_units':       round(occupied_units, 1),

        # Revenue
        'billing_revenue':      round(billing_revenue, 2),
        'linen_revenue':        round(linen_revenue, 2),
        'total_revenue':        round(total_revenue, 2),

        # Variable Costs
        'electricity_cost':     round(electricity_cost, 2),
        'gas_cost':             round(gas_cost, 2),
        'water_cost':           round(water_cost, 2),
        'chemical_cost':        round(chemical_cost, 2),
        'total_variable_cost':  round(total_variable_cost, 2),

        # Fixed Costs
        'labour_monthly':       round(labour_monthly, 2),
        'misc_monthly':         round(misc_monthly, 2),
        'total_fixed_cost':     round(total_fixed_cost, 2),

        # Summary
        'total_cost':           round(total_cost, 2),
        'gross_operating_income': round(gross_profit, 2),  # GOI
        'goi_percentage':       round(goi_pct, 2),
        'cost_per_kg':          round(cost_per_kg, 2),

        # Investment
        'total_investment':     round(total_investment, 2),
        'annual_profit':        round(annual_profit, 2),
        'roi_percentage':       round(roi_pct, 2),
        'payback_months':       round(payback_months, 1) if payback_months else None,
    }
