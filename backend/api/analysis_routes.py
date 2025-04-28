import os
import pandas as pd
import numpy as np
from flask import Blueprint, jsonify, request

# Create the analysis blueprint
analysis_bp = Blueprint('analysis', __name__, url_prefix='/api/analysis')

# Path to the metrics CSV file
METRICS_CSV_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'metrics_87809342.csv')

@analysis_bp.route('/metrics', methods=['GET'])
def get_metrics():
    """Return the available metrics"""
    metrics = [
        { 
            "id": "CLIP", 
            "label": "CLIP Score",
            "color": "#4f46e5",
        },
        { 
            "id": "Lie_Factor", 
            "label": "Lie Factor",
            "color": "#ef4444",
        },
        { 
            "id": "Match_count", 
            "label": "Match Count",
            "color": "#10b981",
        },
        { 
            "id": "Rank_Sim", 
            "label": "Rank Similarity",
            "color": "#f59e0b",
        }
    ]
    return jsonify(metrics)

@analysis_bp.route('/variables', methods=['GET'])
def get_variables():
    """Return the available variables for analysis"""
    variables = [
        {'id': 'data_trend', 'label': 'Data Trend'},
        {'id': 'data_count', 'label': 'Data Count'},
        {'id': 'asset', 'label': 'Asset Type'},
        {'id': 'canny', 'label': 'Canny Technique'},
        {'id': 'asset_size', 'label': 'Asset Size'},
        {'id': 'cond_scale', 'label': 'Cond Scale'}
    ]
    return jsonify(variables)

@analysis_bp.route('/data', methods=['GET'])
def get_analysis_data():
    """Return the raw CSV data"""
    try:
        # Check if the CSV file exists
        if not os.path.exists(METRICS_CSV_PATH):
            return jsonify({"error": f"CSV file not found at {METRICS_CSV_PATH}"}), 404
        
        # Read the CSV file
        df = pd.read_csv(METRICS_CSV_PATH)
        
        # Convert DataFrame to a list of dictionaries
        data = df.to_dict(orient='records')
        
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@analysis_bp.route('/summary', methods=['GET'])
def get_summary_data():
    """
    Return summarized data grouped by a specific variable and metric.
    Query parameters:
    - variable: The variable to group by (e.g., 'data_trend')
    - metric: The metric to calculate averages for (e.g., 'CLIP')
    """
    try:
        # Get query parameters
        variable = request.args.get('variable', 'data_trend')
        metric = request.args.get('metric', 'CLIP')
        
        # Check if the CSV file exists
        if not os.path.exists(METRICS_CSV_PATH):
            return jsonify({"error": f"CSV file not found at {METRICS_CSV_PATH}"}), 404
        
        # Read the CSV file
        df = pd.read_csv(METRICS_CSV_PATH)
        
        # Group by the specified variable and calculate the mean for the specified metric
        # Handle 'inf' values by replacing them with NaN
        df[metric] = pd.to_numeric(df[metric], errors='coerce')
        
        # Group by the variable and calculate mean
        grouped = df.groupby(variable)[metric].mean().reset_index()
        
        # Convert to a list of dictionaries with 'category' and 'value' keys for D3.js
        result = [{"category": row[variable], "value": row[metric]} for _, row in grouped.iterrows()]
        
        return jsonify(result)
    except Exception as e:
        import traceback
        error_traceback = traceback.format_exc()
        return jsonify({"error": str(e), "traceback": error_traceback}), 500

@analysis_bp.route('/aggregated', methods=['GET'])
def get_aggregated_data():
    """
    Return all metrics aggregated by all variables.
    This provides a complete dataset for the analysis page.
    """
    try:
        # Check if the CSV file exists
        if not os.path.exists(METRICS_CSV_PATH):
            return jsonify({"error": f"CSV file not found at {METRICS_CSV_PATH}"}), 404
        
        # Read the CSV file
        df = pd.read_csv(METRICS_CSV_PATH)
        
        # Define variables and metrics
        variables = ['data_trend', 'data_count', 'asset', 'canny', 'asset_size', 'cond_scale']
        metrics = ['CLIP', 'Lie_Factor', 'Match_count', 'Rank_Sim']
        
        # Replace infinity values with NaN
        df = df.replace([np.inf, -np.inf], np.nan)
        
        # Initialize the result dictionary
        result = {}
        
        # Process each variable
        for variable in variables:
            result[variable] = {}
            
            # Process each metric for this variable
            for metric in metrics:
                # Group by the variable and calculate mean for the metric
                grouped = df.groupby(variable)[metric].mean().reset_index()
                
                # Convert to a list of dictionaries with 'category' and 'value' keys
                metric_data = [
                    {"category": str(row[variable]), "value": float(row[metric]) if not pd.isna(row[metric]) else 0} 
                    for _, row in grouped.iterrows()
                ]
                
                result[variable][metric] = metric_data
        
        return jsonify(result)
    except Exception as e:
        import traceback
        error_traceback = traceback.format_exc()
        return jsonify({"error": str(e), "traceback": error_traceback}), 500 