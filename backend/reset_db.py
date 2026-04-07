import os
from app import app, db

with app.app_context():
    print("Dropping existing tables...")
    db.drop_all()
    print("Re-creating tables with new schema...")
    db.create_all()
    print("Database schema synchronized successfully (ANNUAL_PROFIT, ROI_PERCENTAGE).")
