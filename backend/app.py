from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from calculator import calculate_pl
from survey import run_site_audit
from estimator import recommend_cost_estimate
from insights import generate_ai_insights
from sustainability import calculate_sustainability
from models import db, Project, SiteSurvey, ProjectEstimate, SustainabilityAudit, User
import os
from datetime import timedelta

app = Flask(__name__)
CORS(app)

# ─── Auth Config ──────────────────────────────────────────────────────────────
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY') or 'qc-hub-secure-key-2026'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
jwt = JWTManager(app)

# ─── Database Config ──────────────────────────────────────────────────────────
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL') or \
    'sqlite:///' + os.path.join(basedir, 'qc_hub.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    db.create_all()
    # Seed Admin User if not exists
    if not User.query.filter_by(username='admin').first():
        admin = User(username='admin')
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()
        print("Admin user seeded: admin / admin123")

@app.route('/')
def index():
    return jsonify({
        'message': 'QC Hub API is running',
        'endpoints': {
            'login': '/api/auth/login',
            'health': '/api/health'
        }
    })

# ─── Authentication ───────────────────────────────────────────────────────────

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        access_token = create_access_token(identity=username)
        return jsonify({
            'token': access_token,
            'username': username
        }), 200
    
    return jsonify({'error': 'Invalid credentials'}), 401

# ─── P&L Calculator ───────────────────────────────────────────────────────────

@app.route('/api/pl/calculate', methods=['POST'])
@jwt_required()
def calculate():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    try:
        result = calculate_pl(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/pl/save', methods=['POST'])
@jwt_required()
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
        return jsonify({"error": str(e)}), 400

# ─── Site Survey ──────────────────────────────────────────────────────────────

@app.route('/api/survey/audit', methods=['POST'])
@jwt_required()
def audit_site():
    data = request.json
    try:
        audit_results = run_site_audit(data)
        return jsonify(audit_results)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/survey/save', methods=['POST'])
@jwt_required()
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

# ─── Cost Estimator ───────────────────────────────────────────────────────────

@app.route('/api/estimate/recommend', methods=['POST'])
@jwt_required()
def recommend():
    data = request.json
    try:
        res = recommend_cost_estimate(data.get('target_kg'), data.get('shift_h', 8))
        return jsonify(res)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/estimate/save', methods=['POST'])
@jwt_required()
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

# ─── Sustainability Intelligence ──────────────────────────────────────────────

@app.route('/api/sustainability/analyze', methods=['POST'])
@jwt_required()
def analyze_sustainability():
    data = request.json
    try:
        res = calculate_sustainability(data)
        return jsonify(res)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/sustainability/save', methods=['POST'])
@jwt_required()
def save_sustainability():
    data = request.json
    import json
    try:
        new_audit = SustainabilityAudit(
            entity_name=data.get('entity_name'),
            location=data.get('location'),
            water_savings_kld=data.get('water_metrics', {}).get('water_saved_kld'),
            payload=json.dumps(data)
        )
        db.session.add(new_audit)
        db.session.commit()
        return jsonify({"message": "Sustainability Audit archived", "id": new_audit.id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ─── AI Insights ──────────────────────────────────────────────────────────────

@app.route('/api/insights/latest', methods=['GET'])
@jwt_required()
def analyze_latest():
    try:
        latest_pl = Project.query.order_by(Project.created_at.desc()).first()
        latest_survey = SiteSurvey.query.order_by(SiteSurvey.created_at.desc()).first()
        latest_est = ProjectEstimate.query.order_by(ProjectEstimate.created_at.desc()).first()
        
        import json
        from survey import run_site_audit
        survey_pkg = None
        if latest_survey:
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
        return jsonify({"error": str(e)}), 400

# ─── Vault Endpoints ──────────────────────────────────────────────────────────

@app.route('/api/projects/all', methods=['GET'])
@jwt_required()
def get_all_projects():
    pl_projects = Project.query.all()
    surveys = SiteSurvey.query.all()
    estimates = ProjectEstimate.query.all()
    green_audits = SustainabilityAudit.query.all()

    combined = [p.to_dict() for p in pl_projects] + \
               [s.to_dict() for s in surveys] + \
               [e.to_dict() for e in estimates] + \
               [g.to_dict() for g in green_audits]
    
    combined.sort(key=lambda x: x['created_at'], reverse=True)
    return jsonify(combined)

@app.route('/api/projects/detail/<string:p_type>/<int:p_id>', methods=['GET'])
@jwt_required()
def get_project_detail(p_type, p_id):
    if p_type == 'financial':
        item = Project.query.get_or_404(p_id)
    elif p_type == 'technical':
        item = SiteSurvey.query.get_or_404(p_id)
    elif p_type == 'budget':
        item = ProjectEstimate.query.get_or_404(p_id)
    elif p_type == 'green':
        item = SustainabilityAudit.query.get_or_404(p_id)
    else:
        return jsonify({"error": "Invalid project type"}), 400
        
    data = item.to_dict()
    data['type'] = p_type
    return jsonify(data)

@app.route('/api/pl/projects/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_project(id):
    obj = Project.query.get_or_404(id)
    db.session.delete(obj)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/survey/projects/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_survey(id):
    obj = SiteSurvey.query.get_or_404(id)
    db.session.delete(obj)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/estimate/projects/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_estimate(id):
    obj = ProjectEstimate.query.get_or_404(id)
    db.session.delete(obj)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/sustainability/projects/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_green(id):
    obj = SustainabilityAudit.query.get_or_404(id)
    db.session.delete(obj)
    db.session.commit()
    return jsonify({'success': True})

# ─── Health Check ─────────────────────────────────────────────────────────────

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'QC Hub API', 'version': '1.1.0 (Auth Active)'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=os.environ.get('FLASK_DEBUG', 'False').lower() == 'true', host='0.0.0.0', port=port)
