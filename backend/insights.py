def generate_ai_insights(pl_data=None, survey_data=None, estimate_data=None):
    """
    Cross-module diagnostic engine. 
    Analyzes financial, technical, and logistical data to provide executive-level advice.
    """
    insights = []
    
    # --- TECHNICAL RISK ANALYSIS (from Site Survey) ---
    if survey_data:
        # 1. Power Deficit
        if survey_data.get('available_kw', 0) < survey_data.get('benchmark_used', {}).get('required_kw', 0):
            insights.append({
                "type": "risk",
                "severity": "CRITICAL",
                "title": "Power Infrastructure Gap",
                "desc": f"Your site power ({survey_data['available_kw']}kW) is below the Electrolux requirement for {survey_data['target_model_label']}. Expect frequent motor trips and potential PCB damage.",
                "action": "Upgrade site electrical panel to at least " + str(survey_data['benchmark_used']['required_kw']) + "kW."
            })
            
        # 2. Logistical Block
        if survey_data.get('entry_width', 0) < survey_data.get('benchmark_used', {}).get('door_width', 0):
            insights.append({
                "type": "risk",
                "severity": "HIGH",
                "title": "Logistical Bottleneck",
                "desc": f"The passage width ({survey_data['entry_width']}mm) is narrower than the machine depth. On-site dismantling may be required, voiding its warranty.",
                "action": "Modify the entry point or select a smaller model like the WH6-11."
            })

    # --- FINANCIAL PERFORMANCE (from P&L) ---
    if pl_data:
        # 3. Low ROI Alert
        roi = pl_data.get('roi_percentage', 0)
        if roi < 30:
            insights.append({
                "type": "opportunity",
                "severity": "MEDIUM",
                "title": "ROI Optimization Needed",
                "desc": f"Your current ROI of {round(roi, 1)}% is below the target (35%).",
                "action": "Increase your billing rate per KG by at least ₹2.50 to hit a sub-12-month payback."
            })
            
        # 4. Energy Efficiency
        # (Assuming 'heating_source' is part of the payload, defaulting to 'electric' if not found)
        heating = pl_data.get('heating_source', 'electric')
        if heating.lower() == 'electric':
            insights.append({
                "type": "strategy",
                "severity": "HIGH",
                "title": "Heating Source Transition",
                "desc": "Switching from Electric to Steam/Gas heating can reduce your monthly OPEX by roughly 18-22%.",
                "action": "Incorporate a Diesel/Gas Steam Boiler in your Cost Estimate to lower utility costs."
            })

    # --- INVESTMENT SYNERGY (from Cost Estimator) ---
    if estimate_data:
        # 5. Over-invested in Machinery
        grand_total = estimate_data.get('grand_total', 0)
        if pl_data and pl_data.get('annual_profit', 0) > 0:
            profit_to_investment = pl_data['annual_profit'] / (grand_total * 100000) # lakhs to actual
            if profit_to_investment < 0.15:
                insights.append({
                    "type": "strategy",
                    "severity": "LOW",
                    "title": "Phased Scaling",
                    "desc": "Your initial investment is high compared to the year-one profit margin.",
                    "action": "Consider starting with fewer machines (e.g., 2 instead of 3) and scaling up as your occupancy stabilizes."
                })

    # --- Default Baseline Insight ---
    if not insights:
        insights.append({
            "type": "strategy",
            "severity": "NORMAL",
            "title": "Baseline Performance",
            "desc": "No critical technical or financial anomalies detected. Project is within Electrolux Operation Standards.",
            "action": "Maintain weekly preventive maintenance schedules for high-speed extraction reliability."
        })

    # --- Radar Chart Data Formulation ---
    # Metrics: Financial, Technical, Logistical, Strategy (Out of 100)
    radar = [
        {"subject": "Financial", "A": pl_data.get('roi_percentage', 60) if pl_data else 50, "fullMark": 100},
        {"subject": "Technical", "A": survey_data.get('readiness_score', 80) if survey_data else 50, "fullMark": 100},
        {"subject": "Logistical", "A": (survey_data.get('entry_width',0)/survey_data.get('benchmark_used',{}).get('door_width',1)*100) if survey_data else 50, "fullMark": 100},
        {"subject": "Operational", "A": 85, "fullMark": 100} # Placeholder Operational baseline
    ]

    return {
        "insights": insights,
        "radar": radar,
        "metrics": {
            "roi": pl_data.get('roi_percentage', 0) if pl_data else 0,
            "annual_profit": pl_data.get('annual_profit', 0) if pl_data else 0,
            "gop": pl_data.get('gop', 0) if pl_data else 0,
            "health_score": survey_data.get('readiness_score', 0) if survey_data else 0
        },
        "overall_health": "EXCELLENT" if len([i for i in insights if i['type'] == 'risk']) == 0 else "WARNING"
    }
