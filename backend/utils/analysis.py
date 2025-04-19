# structure of the input df
# rows: index
# columns: 
# --------------- image spec ---------------
# "data_trend"    := "falling" | "logarithmic"
# "data_count"    := 4 | 5 | 6
# "asset"         := "apartment" | "bottle" | "pine_tree" | "thin_man"
# "canny"         := "default" | "blur" | "sparse"
# "asset_size"    := 0.4 | 0.6 | 0.8
# "input_prompt"  := string
# --------------- evals ---------------
# "CLIP"          := list of floats; range=0-1; length=Match_count
# "Lie_Factor"    := float; range=0-
# "Match_count"   := integer; range=0-data_count
# "Rank_Sim"      := float; ramge=0-1

import pandas as pd
import numpy as np
import scipy.stats as stats
import os
import json
import altair as alt

def analyze_evaluation_metrics(df):
    # 1. Descriptive statistics for each metric by image specification
    results = {}
    
    # Image specs to analyze
    image_specs = ["data_trend", "data_count", "asset", "canny", "asset_size"]
    # Evaluation metrics to analyze
    eval_metrics = ["CLIP", "Lie_Factor", "Match_count", "Rank_Sim"]
    
    # Group-wise statistics
    for spec in image_specs:
        results[spec] = {}
        for metric in eval_metrics:
            # Get aggregate statistics by groups
            group_stats = df.groupby(spec)[metric].agg([
                'count', 'mean', 'std', 'min', 'max', 'median'
            ]).reset_index()
            results[spec][metric] = group_stats
            
    # 2. Statistical tests
    stat_tests = {}
    
    # For binary categories (t-test)
    if len(df["data_trend"].unique()) == 2:
        for metric in eval_metrics:
            group1 = df[df["data_trend"] == "falling"][metric]
            group2 = df[df["data_trend"] == "logarithmic"][metric]
            t_stat, p_val = stats.ttest_ind(group1, group2, equal_var=False)
            stat_tests[f"data_trend_{metric}"] = {
                "test": "t-test",
                "t_statistic": t_stat,
                "p_value": p_val
            }
    
    # For multi-level categories (ANOVA)
    for spec in ["asset", "canny", "data_count"]:
        if len(df[spec].unique()) > 2:
            for metric in eval_metrics:
                groups = [df[df[spec] == val][metric].values for val in df[spec].unique()]
                f_stat, p_val = stats.f_oneway(*groups)
                stat_tests[f"{spec}_{metric}"] = {
                    "test": "ANOVA",
                    "f_statistic": f_stat,
                    "p_value": p_val
                }
    
    # For numeric variables (correlation)
    for metric in eval_metrics:
        corr, p_val = stats.pearsonr(df["asset_size"], df[metric])
        stat_tests[f"asset_size_{metric}"] = {
            "test": "correlation",
            "correlation": corr,
            "p_value": p_val
        }
    
    return {
        "descriptive_stats": results,
        "statistical_tests": stat_tests
    }

def generate_visualizations(df, output_dir="./analysis_results"):
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Set max rows limit for Altair
    alt.data_transformers.disable_max_rows()
    
    # Evaluation metrics to visualize
    eval_metrics = ["CLIP", "Lie_Factor", "Match_count", "Rank_Sim"]
    # Image specs to analyze
    image_specs = ["data_trend", "data_count", "asset", "canny", "asset_size"]
    
    # Generate visualizations
    for metric in eval_metrics:
        for spec in ["data_trend", "data_count", "asset", "canny"]:
            chart = alt.Chart(df).mark_boxplot().encode(
                x=alt.X(spec),
                y=alt.Y(metric, title=metric),
                color=alt.Color(spec)
            ).properties(
                title=f"{metric} by {spec}",
                width=600,
                height=400
            )
            
            chart.save(f"{output_dir}/{metric}_by_{spec}_boxplot.html")
    
    # Correlation heatmap
    df_numeric = df.copy()
    for col in ["data_trend", "asset", "canny"]:
        df_numeric[col] = pd.factorize(df_numeric[col])[0]
    
    corr_matrix = df_numeric.corr().reset_index().melt('index')
    corr_matrix.columns = ['var1', 'var2', 'correlation']
    
    heatmap = alt.Chart(corr_matrix).mark_rect().encode(
        x='var1:O',
        y='var2:O',
        color=alt.Color('correlation:Q', scale=alt.Scale(scheme='bluered', domain=[-1, 1])),
        tooltip=['var1', 'var2', 'correlation']
    ).properties(
        title="Correlation Matrix",
        width=700,
        height=700
    )
    
    text = alt.Chart(corr_matrix).mark_text().encode(
        x='var1:O',
        y='var2:O',
        text=alt.Text('correlation:Q', format='.2f'),
        color=alt.condition(
            alt.datum.correlation > 0.5, 
            alt.value('white'),
            alt.value('black')
        )
    )
    
    corr_chart = (heatmap + text).properties(
        title="Correlation Matrix of Features and Metrics"
    )
    
    corr_chart.save(f"{output_dir}/correlation_heatmap.html")

def main(input_data_path):
    # Load the data
    df = pd.read_csv(input_data_path)
    
    # Run statistical analysis
    analysis_results = analyze_evaluation_metrics(df)
    
    # Generate visualizations
    generate_visualizations(df)
    
    # Save results to JSON
    with open("./analysis_results/statistics.json", "w") as f:
        json.dump(analysis_results, f, indent=4)
    
    # Print key findings
    print("Key Findings:")
    for spec in ["data_trend", "data_count", "asset", "canny", "asset_size"]:
        for metric in ["CLIP", "Lie_Factor", "Match_count", "Rank_Sim"]:
            if f"{spec}_{metric}" in analysis_results["statistical_tests"]:
                test_result = analysis_results["statistical_tests"][f"{spec}_{metric}"]
                if test_result["p_value"] < 0.05:
                    print(f"* Significant effect of {spec} on {metric} (p={test_result['p_value']:.4f})")
    
    # Find best asset for CLIP scores
    asset_clip_stats = analysis_results["descriptive_stats"]["asset"]["CLIP"]
    best_asset = asset_clip_stats.sort_values(by="mean", ascending=False).iloc[0]
    print(f"The asset '{best_asset[0]}' yields the highest CLIP scores with mean: {best_asset['mean']:.4f}")
    
    # Find the best combination for minimizing Lie_Factor
    best_combinations = df.groupby(["data_trend", "data_count", "asset", "canny", "asset_size"])["Lie_Factor"].mean().reset_index()
    best_combination = best_combinations.sort_values(by="Lie_Factor").iloc[0]
    
    print("Best combination for minimizing Lie_Factor:")
    for spec in ["data_trend", "data_count", "asset", "canny", "asset_size"]:
        print(f"- {spec}: {best_combination[spec]}")
    print(f"Average Lie_Factor: {best_combination['Lie_Factor']:.4f}")
    
    return analysis_results

