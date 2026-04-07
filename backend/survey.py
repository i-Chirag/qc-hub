# survey.py - Technical Audit Engine for QC Hub
# Calibrated for Electrolux Professional Machinery

ELECTROLUX_MODELS = {
    "WH6-6": {
        "label": "WH6-6 (6kg Batch)",
        "required_kw": 4.4,
        "water_inlet": 0.75,
        "door_width": 700, # Machine is 595mm
    },
    "WH6-11": {
        "label": "WH6-11 (11kg Batch)",
        "required_kw": 10.0,
        "water_inlet": 0.75,
        "door_width": 900, # Machine is 830mm
    },
    "WH6-20": {
        "label": "WH6-20 (20kg Batch)",
        "required_kw": 18.0,
        "water_inlet": 1.0,
        "door_width": 1050, # Machine is 970mm
    },
    "WH6-33": {
        "label": "WH6-33 (33kg Batch)",
        "required_kw": 23.0,
        "water_inlet": 1.0,
        "door_width": 1100, # Machine is 1020mm
    }
}

def run_site_audit(data: dict) -> dict:
    """Analyze site survey data against Electrolux Professional benchmarks."""
    
    model_id = data.get('target_model', 'WH6-6')
    benchmark = ELECTROLUX_MODELS.get(model_id, ELECTROLUX_MODELS["WH6-6"])
        
    gaps = []
    scores = {}
    
    # 2. Power Audit
    available_kw = float(data.get('available_kw', 0))
    if available_kw < benchmark['required_kw']:
        deficit_pct = round(((benchmark['required_kw'] - available_kw) / benchmark['required_kw']) * 100)
        gaps.append(f"Power Deficit: Site has {available_kw}kW. Electrolux {model_id} needs {benchmark['required_kw']}kW ({deficit_pct}% shortfall).")
        scores['power'] = round((available_kw / benchmark['required_kw']) * 100)
    else:
        scores['power'] = 100
        
    # 3. Logistics Audit (Clearance)
    door_w = float(data.get('entry_width', 0))
    if door_w < benchmark['door_width']:
        gaps.append(f"Logistics: Entry width ({door_w}mm) is tight. {model_id} requires {benchmark['door_width']}mm for safe passage.")
        scores['logistics'] = round((door_w / benchmark['door_width']) * 100)
    else:
        scores['logistics'] = 100
        
    # 4. Fluid Audit (Water)
    inlet = float(data.get('water_inlet_size', 0))
    if inlet < benchmark['water_inlet']:
        gaps.append(f"Water: Site has {inlet}\" inlet. {model_id} standard is {benchmark['water_inlet']}\". Cycle times may increase.")
        scores['fluid'] = round((inlet / benchmark['water_inlet']) * 100)
    else:
        scores['fluid'] = 100
        
    # 5. Foundation Audit
    floor_ok = data.get('floor_loading_ok', False)
    scores['foundation'] = 100 if floor_ok else 40
    if not floor_ok:
        gaps.append("Foundation: Risk detected. Floor load capacity must be certified for high-speed vibration.")

    # Calculate Overall Readiness
    overall = round(sum(scores.values()) / len(scores))
    
    status = "PRISTINE" if overall >= 95 else "QUALIFIED" if overall >= 80 else "NEEDS UPGRADES"
    if overall < 55: status = "NOT SUITABLE"

    return {
        "readiness_score": overall,
        "readiness_status": status,
        "categorical_scores": scores,
        "gap_analysis": gaps,
        "benchmark_used": benchmark,
        "target_model_label": benchmark["label"]
    }
