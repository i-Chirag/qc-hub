import math

# Electrolux Professional Typical Pricing (INR Lakhs)
EQUIPMENT_LIBRARY = {
    "WH6-33": {"label": "Electrolux WH6-33 (33kg Washer)", "price": 19.5, "cap": 33},
    "WH6-20": {"label": "Electrolux WH6-20 (20kg Washer)", "price": 14.0, "cap": 20},
    "WH6-11": {"label": "Electrolux WH6-11 (11kg Washer)", "price": 8.5,  "cap": 11},
    "TD6-33": {"label": "Electrolux TD6-33 (33kg Dryer)",  "price": 11.5, "cap": 33},
    "TD6-20": {"label": "Electrolux TD6-20 (20kg Dryer)",  "price": 7.5,  "cap": 20},
    "TD6-11": {"label": "Electrolux TD6-11 (11kg Dryer)",  "price": 4.5,  "cap": 11},
    "SLAB-BOILER": {"label": "Steam Boiler (100kg Steam)", "price": 3.5,  "cap": 100},
    "AIR-COMP":    {"label": "Air Compressor (2 HP)",      "price": 0.8,  "cap": 1}
}

def recommend_cost_estimate(target_kg, shift_h=8):
    """Generates a recommended machinery mix and initial budget estimate."""
    
    hourly_target = float(target_kg) / float(shift_h)
    
    # 1. Determine Machine Model Strategy
    # One cycle is ~45 mins. 1.25 cycles per hour.
    if hourly_target > 45:
        model_w = "WH6-33"; model_d = "TD6-33"
    elif hourly_target > 15:
        model_w = "WH6-20"; model_d = "TD6-20"
    else:
        model_w = "WH6-11"; model_d = "TD6-11"
        
    capacity_per_machine = EQUIPMENT_LIBRARY[model_w]["cap"] * 1.25
    count = math.ceil(hourly_target / capacity_per_machine)
    
    items = []
    # Add Washers
    items.append({
        "label": EQUIPMENT_LIBRARY[model_w]["label"],
        "qty": count,
        "unit_price": EQUIPMENT_LIBRARY[model_w]["price"],
        "total": round(count * EQUIPMENT_LIBRARY[model_w]["price"], 2)
    })
    
    # Add Dryers
    items.append({
        "label": EQUIPMENT_LIBRARY[model_d]["label"],
        "qty": count,
        "unit_price": EQUIPMENT_LIBRARY[model_d]["price"],
        "total": round(count * EQUIPMENT_LIBRARY[model_d]["price"], 2)
    })
    
    # Add Ancillary
    if count > 0:
        items.append({
            "label": EQUIPMENT_LIBRARY["SLAB-BOILER"]["label"],
            "qty": 1,
            "unit_price": EQUIPMENT_LIBRARY["SLAB-BOILER"]["price"],
            "total": EQUIPMENT_LIBRARY["SLAB-BOILER"]["price"]
        })
        items.append({
            "label": EQUIPMENT_LIBRARY["AIR-COMP"]["label"],
            "qty": 1,
            "unit_price": EQUIPMENT_LIBRARY["AIR-COMP"]["price"],
            "total": EQUIPMENT_LIBRARY["AIR-COMP"]["price"]
        })

    # Infrastructure Estimate (approx 15% of machinery cost)
    machinery_total = sum(i["total"] for i in items)
    infra_cost = round(machinery_total * 0.15, 2)
    items.append({
        "label": "Electrical, Plumbing & Civil Foundations (Est)",
        "qty": 1,
        "unit_price": infra_cost,
        "total": infra_cost
    })
    
    grand_total = round(sum(i["total"] for i in items), 2)
    
    return {
        "target_kg": target_kg,
        "hourly_capacity_achieved": round(count * capacity_per_machine, 1),
        "shift_hours": shift_h,
        "items": items,
        "grand_total": grand_total,
        "estimated_space_sqft": count * 500 # Approximate rule: 500sqft per major machine set
    }
