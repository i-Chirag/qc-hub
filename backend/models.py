from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Project(db.Model):
    __tablename__ = 'projects'

    id          = db.Column(db.Integer, primary_key=True)
    name            = db.Column(db.String(200), nullable=False)
    location        = db.Column(db.String(200))
    industry        = db.Column(db.String(50))
    category        = db.Column(db.String(50))
    annual_profit   = db.Column(db.Float)
    roi_percentage  = db.Column(db.Float)
    payload         = db.Column(db.Text)   # full JSON stored as string
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at  = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id':         self.id,
            'name':       self.name,
            'location':   self.location,
            'industry':   self.industry,
            'category':   self.category,
            'annual_profit': self.annual_profit,
            'roi_percentage': self.roi_percentage,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'type':       'financial'
        }

class SiteSurvey(db.Model):
    __tablename__ = 'site_surveys'
    id = db.Column(db.Integer, primary_key=True)
    entity_name = db.Column(db.String(100))
    location = db.Column(db.String(100))
    readiness_score = db.Column(db.Integer)
    readiness_status = db.Column(db.String(50))
    target_capacity = db.Column(db.Float)
    available_kw = db.Column(db.Float)
    entry_width = db.Column(db.Float)
    water_inlet_size = db.Column(db.Float)
    floor_loading_ok = db.Column(db.Boolean)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id':               self.id,
            'entity_name':      self.entity_name,
            'location':         self.location,
            'readiness_score':  self.readiness_score,
            'readiness_status': self.readiness_status,
            'target_capacity':  self.target_capacity,
            'available_kw':     self.available_kw,
            'created_at':       self.created_at.isoformat() if self.created_at else None,
            'type':             'technical'
        }

class ProjectEstimate(db.Model):
    __tablename__ = 'estimates'
    id = db.Column(db.Integer, primary_key=True)
    entity_name = db.Column(db.String(100))
    location = db.Column(db.String(100))
    target_kg = db.Column(db.Float)
    grand_total = db.Column(db.Float)
    items_json = db.Column(db.Text) # Storing the list as a JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id':           self.id,
            'entity_name':  self.entity_name,
            'location':     self.location,
            'target_kg':    self.target_kg,
            'grand_total':  self.grand_total,
            'created_at':   self.created_at.isoformat() if self.created_at else None,
            'type':         'budget'
        }
