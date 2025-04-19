from flask import Blueprint, jsonify
import os
import json
from backend.utils.analysis import analyze_evaluation_metrics
import pandas as pd

analysis_bp = Blueprint('analysis', __name__)

@analysis_bp.route('/api/run-analysis', methods=['GET'])
def run_analysis():
    try:
        # Path to the dummy dataset
        data_path = "backend/data/dummy_data.csv"
        
        # Check if file exists
        if not os.path.exists(data_path):
            return jsonify({"error": f"Dataset not found at {data_path}"}), 404
        
        # Load the data
        df = pd.read_csv(data_path)
        
        # Run statistical analysis
        analysis_results = analyze_evaluation_metrics(df)
        
        # Also include raw data for frontend visualizations
        raw_data = df.to_dict(orient='records')
        
        return jsonify({
            "status": "success",
            "message": "Analysis completed successfully",
            "results": analysis_results,
            "raw_data": raw_data
        }), 200
    except Exception as e:
        return jsonify({"error": f"Error running analysis: {str(e)}"}), 500
        
@analysis_bp.route('/api/get-summary', methods=['GET'])
def get_summary():
    try:
        # Path to the dummy dataset
        data_path = "backend/data/dummy_data.csv"
        
        # Check if file exists
        if not os.path.exists(data_path):
            return jsonify({"error": f"Dataset not found at {data_path}"}), 404
        
        # Load the data
        df = pd.read_csv(data_path)
        
        # Basic summary statistics
        summary = {
            "total_records": len(df),
            "metrics_summary": {
                metric: {
                    "mean": float(df[metric].mean()),
                    "min": float(df[metric].min()),
                    "max": float(df[metric].max())
                }
                for metric in ["CLIP", "Lie_Factor", "Match_count", "Rank_Sim"]
            },
            "distribution": {
                "data_trend": df["data_trend"].value_counts().to_dict(),
                "asset": df["asset"].value_counts().to_dict(),
                "data_count": df["data_count"].value_counts().to_dict()
            }
        }
        
        return jsonify(summary), 200
    except Exception as e:
        return jsonify({"error": f"Error getting summary: {str(e)}"}), 500 