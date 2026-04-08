"""
QC Hub — P&L Calculator Core Logic (Digital Twin Edition)
Precision modeling for Laundry & Linen Services.
"""

def to_f(val):
    try:
        if isinstance(val, str):
            val = val.replace(',', '')
        return float(val) if val else 0.0
    except:
        return 0.0

def calculate_pl(data: dict) -> dict:
    """
    Main P&L calculation function - Directly synchronized with Excel formulas.
    """

    # ── 1. Input Parsing (Revenue Side) ────────────────────────────────────────
    capacity        = to_f(data.get('capacity', 0))        # Rooms/Beds
    linen_per_unit  = to_f(data.get('linen_per_unit', 0))   # KG per unit
    operating_days  = to_f(data.get('operating_days', 30))
    billing_rate    = to_f(data.get('billing_rate_per_kg', 0))
    
    # Guest Laundry
    guest_laundry_kg    = to_f(data.get('guest_laundry_kg', 0))
    guest_laundry_rate  = to_f(data.get('guest_laundry_rate', 0))
    
    # Surcharges
    clean_surcharge_rate= to_f(data.get('clean_surcharge_rate', 0)) # Revenue surcharge
    
    total_investment    = to_f(data.get('total_investment', 0))

    # ── 2. Input Parsing (Expense Side) ────────────────────────────────────────
    electricity_rate        = to_f(data.get('electricity_rate', 11)) # Industry standard
    gas_rate                = to_f(data.get('gas_rate', 0))
    water_cost_per_kg       = to_f(data.get('water_cost_per_kg', 0))
    chemical_cost_per_kg    = to_f(data.get('chemical_cost_per_kg', 3))
    
    # Manpower Breakdown
    operators_qty   = to_f(data.get('operators_qty', 0))
    operators_rate  = to_f(data.get('operators_rate', 0))
    manager_qty     = to_f(data.get('manager_qty', 0))
    manager_rate    = to_f(data.get('manager_rate', 0))

    # Overheads & Surcharges
    rm_monthly              = to_f(data.get('rm_monthly', 0))
    food_cost_per_unit      = to_f(data.get('food_cost_total', 0)) # Manual entry
    misc_monthly            = to_f(data.get('miscellaneous_monthly', 0))
    qc_supervision_monthly  = to_f(data.get('qc_supervision_monthly', 0))
    clean_billing_surcharge = to_f(data.get('clean_billing_surcharge', 0)) # Expense surcharge
    linen_rental_cost_fixed = to_f(data.get('linen_rental_cost_fixed', 0))

    # ── 3. Volume Calculation ──────────────────────────────────────────────────
    # Formula: Rooms * Linen/Unit * Days
    # Example: 80 * 7 * 30 = 16,800
    kg_per_month   = capacity * linen_per_unit * operating_days

    # ── 4. Revenue Calculation ─────────────────────────────────────────────────
    laundry_revenue      = kg_per_month * billing_rate
    guest_revenue        = guest_laundry_kg * guest_laundry_rate
    surcharge_rev_total  = kg_per_month * clean_surcharge_rate
    
    total_revenue_net    = laundry_revenue + guest_revenue + surcharge_rev_total

    # ── 5. Variable Cost Calculation ───────────────────────────────────────────
    # Electricity: Excel benchmark = 0.30 units/kg
    electricity_cost     = kg_per_month * 0.30 * electricity_rate
    
    # Png/Gas: Excel benchmark = 0.04 units/kg
    gas_cost             = kg_per_month * 0.04 * gas_rate
    
    water_cost           = kg_per_month * water_cost_per_kg
    chemical_cost        = kg_per_month * chemical_cost_per_kg

    total_variable_cost  = electricity_cost + gas_cost + water_cost + chemical_cost

    # ── 6. Fixed Cost Calculation ──────────────────────────────────────────────
    total_manpower_cost  = (operators_qty * operators_rate) + (manager_qty * manager_rate)
    
    total_fixed_cost     = total_manpower_cost + rm_monthly + food_cost_per_unit + \
                           misc_monthly + qc_supervision_monthly + \
                           clean_billing_surcharge + linen_rental_cost_fixed

    # ── 7. Summary Metrics ─────────────────────────────────────────────────────
    total_cost           = total_variable_cost + total_fixed_cost
    gop                  = total_revenue_net - total_cost
    gop_percentage       = (gop / total_revenue_net * 100) if total_revenue_net else 0
    cost_per_kg          = (total_cost / kg_per_month) if kg_per_month else 0

    annual_gop           = gop * 12
    roi_percentage       = (annual_gop / total_investment * 100) if total_investment else 0
    payback_months       = (total_investment / gop) if gop > 0 else 0

    return {
        # Metadata
        'capacity': capacity,
        'operating_days': operating_days,
        
        # Volume
        'kg_per_month': round(kg_per_month, 0),
        
        # Revenue Breakdown
        'laundry_revenue_monthly': round(laundry_revenue, 0),
        'guest_revenue_monthly':   round(guest_revenue, 0),
        'total_revenue_net':       round(total_revenue_net, 0),

        # Variable Cost Breakdown
        'electricity_cost':   round(electricity_cost, 0),
        'gas_cost':           round(gas_cost, 0),
        'chemical_cost':      round(chemical_cost, 0),
        'total_variable':     round(total_variable_cost, 0),

        # Fixed Cost Breakdown
        'manpower_cost':      round(total_manpower_cost, 0),
        'rm_cost':            round(rm_monthly, 0),
        'qc_cost':            round(qc_supervision_monthly, 0),
        'total_fixed':        round(total_fixed_cost, 0),

        # Summary
        'total_expanses':     round(total_cost, 0),
        'gop':                round(gop, 0),
        'gop_percentage':     round(gop_percentage, 1),
        'cost_per_kg':        round(cost_per_kg, 2),
        'annual_gop':         round(annual_gop, 0),
        'roi_percentage':     round(roi_percentage, 1),
        'payback_months':     round(payback_months, 1)
    }
