import csv
import random
import os

# According to analysis.py, these are the valid values:
# "data_trend"    := "falling" | "logarithmic"
# "data_count"    := 4 | 5 | 6
# "asset"         := "apartment" | "bottle" | "pine_tree" | "thin_man"
# "canny"         := "default" | "blur" | "sparse"
# "asset_size"    := 0.4 | 0.6 | 0.8
# "input_prompt"  := string
# "CLIP"          := float; range=0-1
# "Lie_Factor"    := float; range=0-
# "Match_count"   := integer; range=0-data_count
# "Rank_Sim"      := float; range=0-1

# Define possible values based on analysis.py
data_trends = ["falling", "logarithmic"]
data_counts = [4, 5, 6]
assets = ["apartment", "bottle", "pine_tree", "thin_man"]
canny_types = ["default", "blur", "sparse"]
asset_sizes = [0.4, 0.6, 0.8]

# Prompts for each asset
prompt_templates = {
    "apartment": ["apartment building data", "apartment values", "housing market trends", "rental prices", "declining apartment prices"],
    "bottle": ["bottle consumption", "bottle usage trend", "container sales", "fluid container data", "increasing bottle sales"],
    "pine_tree": ["pine tree growth", "pine forest decline", "forestry data", "conifer statistics", "pine tree data trend"],
    "thin_man": ["weight loss trend", "height increase data", "human measurements", "body statistics", "physique analysis"]
}

# Generate new rows
new_rows = []
for _ in range(300):
    asset = random.choice(assets)
    data_trend = random.choice(data_trends)
    data_count = random.choice(data_counts)
    canny = random.choice(canny_types)
    asset_size = random.choice(asset_sizes)
    input_prompt = random.choice(prompt_templates.get(asset, ["data visualization"]))
    
    # Ensure Match_count is within range (0 to data_count)
    match_count = random.randint(2, data_count)
    
    # Generate values in proper ranges
    clip = round(random.uniform(0.45, 0.7), 2)  # CLIP range 0-1 (using values similar to original data)
    lie_factor = round(random.uniform(0.9, 1.4), 1)  # Lie_Factor range 0+ (using values similar to original data)
    rank_sim = round(random.uniform(0.6, 0.85), 2)  # Rank_Sim range 0-1 (using values similar to original data)
    
    new_rows.append([
        data_trend, data_count, asset, canny, asset_size, 
        input_prompt, clip, lie_factor, match_count, rank_sim
    ])

# Read the existing rows
existing_data = []
try:
    with open('backend/data/dummy_data.csv', 'r') as f:
        reader = csv.reader(f)
        existing_data = list(reader)
except FileNotFoundError:
    # If the file doesn't exist, include a header row
    existing_data = [["data_trend", "data_count", "asset", "canny", "asset_size", 
                       "input_prompt", "CLIP", "Lie_Factor", "Match_count", "Rank_Sim"]]

# Write the combined data
with open('backend/data/dummy_data.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerows(existing_data)
    writer.writerows(new_rows)

print(f"Added {len(new_rows)} new rows to dummy_data.csv")
print(f"Total rows in file: {len(existing_data) + len(new_rows)}") 