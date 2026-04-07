from flask import Flask, request, jsonify
from flask_cors import CORS
from calculator import calculate_pl
from survey import run_site_audit
from estimator import recommend_cost_estimate
from insights import generate_ai_insights
from models import db, Project, SiteSurvey, ProjectEstimate
import os

app = Flask(__name__)
CORS(app)

# Production Config
# Use an absolute path for the SQLite database so it works on cloud providers
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL') or \
    'sqlite:///' + os.path.join(basedir, 'qc_hub.db')

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return jsonify({
        'message': 'QC Hub API is running',
        'endpoints': {
            'health': '/api/health',
            'calculate': '/api/pl/calculate',
            'projects': '/api/pl/projects'
        }
    })

# ─── P&L Calculator ───────────────────────────────────────────────────────────

@app.route('/api/pl/calculate', methods=['POST'])
def calculate():
    """Main P&L calculation endpoint"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    try:
        result = calculate_pl(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/pl/save', methods=['POST'])
def save_project():
    data = request.json
    import json
    try:
        new_project = Project(
            name=data.get('entity_name') or data.get('name') or "Untitled Project",
            location=data.get('location'),
            industry=data.get('industry'),
            category=data.get('category'),
            annual_profit=data.get('annual_profit'),
            roi_percentage=data.get('roi_percentage'),
            payload=json.dumps(data)
        )
        db.session.add(new_project)
        db.session.commit()
        return jsonify({"message": "Project archived successfully", "id": new_project.id}), 201
    except Exception as e:
        print(f"SAVE ERROR: {e}")
        return jsonify({"error": str(e)}), 400

@app.route('/api/survey/audit', methods=['POST'])
def audit_site():
    data = request.json
    try:
        audit_results = run_site_audit(data)
        return jsonify(audit_results)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/survey/save', methods=['POST'])
def save_survey():
    data = request.json
    try:
        new_survey = SiteSurvey(
            entity_name=data.get('entity_name'),
            location=data.get('location'),
            readiness_score=data.get('readiness_score'),
            readiness_status=data.get('readiness_status'),
            target_capacity=data.get('target_capacity'),
            available_kw=data.get('available_kw'),
            entry_width=data.get('entry_width'),
            water_inlet_size=data.get('water_inlet_size'),
            floor_loading_ok=data.get('floor_loading_ok')
        )
        db.session.add(new_survey)
        db.session.commit()
        return jsonify({"message": "Site Survey archived", "id": new_survey.id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/estimate/recommend', methods=['POST'])
def recommend():
    data = request.json
    try:
        res = recommend_cost_estimate(data.get('target_kg'), data.get('shift_h', 8))
        return jsonify(res)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/estimate/save', methods=['POST'])
def save_estimate():
    data = request.json
    import json
    try:
        new_est = ProjectEstimate(
            entity_name=data.get('entity_name'),
            location=data.get('location'),
            target_kg=data.get('target_kg'),
            grand_total=data.get('grand_total'),
            items_json=json.dumps(data.get('items'))
        )
        db.session.add(new_est)
        db.session.commit()
        return jsonify({"message": "Project Estimate archived", "id": new_est.id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/insights/analyze', methods=['POST'])
def analyze():
    data = request.json # Contains pl_data, survey_data, and estimate_data
    try:
        insights_res = generate_ai_insights(
            data.get('pl_data'), 
            data.get('survey_data'), 
            data.get('estimate_data')
        )
        return jsonify(insights_res)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/insights/latest', methods=['GET'])
def analyze_latest():
    """Pulls the most recent data from all modules to generate an automated project audit."""
    try:
        latest_pl = Project.query.order_by(Project.created_at.desc()).first()
        latest_survey = SiteSurvey.query.order_by(SiteSurvey.created_at.desc()).first()
        latest_est = ProjectEstimate.query.order_by(ProjectEstimate.created_at.desc()).first()
        
        # Format survey data for the engine
        import json
        from survey import run_site_audit
        survey_pkg = None
        if latest_survey:
            # We run a fresh audit on the latest survey to get full details
            target_model = "WH6-6"
            if latest_survey.readiness_status and "(" in latest_survey.readiness_status:
                 target_model = latest_survey.readiness_status.split('(')[0].strip()
            
            survey_pkg = run_site_audit({
                "target_model": target_model,
                "available_kw": latest_survey.available_kw,
                "entry_width": latest_survey.entry_width,
                "water_inlet_size": latest_survey.water_inlet_size,
                "floor_loading_ok": latest_survey.floor_loading_ok
            })

        pl_pkg = None
        if latest_pl:
            pl_pkg = {
                "roi_percentage": latest_pl.roi_percentage,
                "annual_profit": latest_pl.annual_profit,
                "heating_source": "steam" if "Steam" in (latest_pl.payload or "") else "electric"
            }

        est_pkg = None
        if latest_est:
            est_pkg = {
                "grand_total": latest_est.grand_total,
                "items": json.loads(latest_est.items_json) if latest_est.items_json else []
            }

        res = generate_ai_insights(pl_pkg, survey_pkg, est_pkg)
        res['entity_name'] = latest_pl.name if latest_pl else (latest_survey.entity_name if latest_survey else "New Project")
        return jsonify(res)
    except Exception as e:
        print(f"INSIGHTS ERROR: {e}")
        return jsonify({"error": str(e)}), 400


@app.route('/api/pl/projects', methods=['GET'])
def get_projects():
    """List all saved projects"""
    projects = Project.query.order_by(Project.created_at.desc()).all()
    return jsonify([p.to_dict() for p in projects])


@app.route('/api/pl/projects/<int:project_id>', methods=['GET'])
def get_project(project_id):
    project = Project.query.get_or_404(project_id)
    return jsonify(project.to_dict())


@app.route('/api/projects/all', methods=['GET'])
def get_all_projects():
    """Unifies P&L, Survey, and Estimate records for the main vault list."""
    pl_projects = Project.query.order_by(Project.created_at.desc()).all()
    surveys = SiteSurvey.query.order_by(SiteSurvey.created_at.desc()).all()
    estimates = ProjectEstimate.query.order_by(ProjectEstimate.created_at.desc()).all()

    # Combine and sort all types
    combined = [p.to_dict() for p in pl_projects] + \
               [s.to_dict() for s in surveys] + \
               [e.to_dict() for e in estimates]
    
    # Final sort by date
    combined.sort(key=lambda x: x['created_at'], reverse=True)
    return jsonify(combined)

@app.route('/api/pl/projects/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    project = Project.query.get_or_404(project_id)
    db.session.delete(project)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/survey/projects/<int:id>', methods=['DELETE'])
def delete_survey(id):
    obj = SiteSurvey.query.get_or_404(id)
    db.session.delete(obj)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/estimate/projects/<int:id>', methods=['DELETE'])
def delete_estimate(id):
    obj = ProjectEstimate.query.get_or_404(id)
    db.session.delete(obj)
    db.session.commit()
    return jsonify({'success': True})


# ─── Health Check ─────────────────────────────────────────────────────────────

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'QC Hub API', 'version': '1.0.0'})


if __name__ == '__main__':
    # Render and other providers use the PORT environment variable
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=os.environ.get('FLASK_DEBUG', 'False').lower() == 'true', host='0.0.0.0', port=port)
