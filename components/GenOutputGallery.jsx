const data_trend = ["falling", "logarithmic"];
const data_count = [4, 5, 6];
const canny_technique = ["default", "sparse", "blur"];
const asset = ["pine_tree", "thin_man", "bottle", "apartment"];
const width_scale = ["scale0.4", "scale0.6", "scale0.8"];

// file name format: "[data_trend]-[data_count]-[canny_technique]-[asset]-[width_scale].png"
// where are the files located?: "public/outputs/"
import { useState, useEffect } from 'react';
import './GenOutputGallery.scss';

export default function GenOutputGallery() {
  const [selected_match, setSelectedMatch] = useState("data_trend");
  
  // Shared parameters across both images
  const [sharedParams, setSharedParams] = useState({
    data_trend: "falling",
    data_count: "4",
    canny_technique: "default",
    asset: "pine_tree",
    width_scale: "scale0.4"
  });
  
  // Values specifically for the comparison parameter
  const [comparisonValues, setComparisonValues] = useState({
    left: "falling",
    right: "logarithmic"
  });
  
  // Update shared parameters
  const updateSharedParam = (param, value) => {
    setSharedParams({
      ...sharedParams,
      [param]: value
    });
  };
  
  // Generate filenames based on parameters
  const getLeftImageFilename = () => {
    const params = { ...sharedParams };
    params[selected_match] = comparisonValues.left;
    return `${params.data_trend}-${params.data_count}-${params.canny_technique}-${params.asset}-${params.width_scale}.png`;
  };
  
  const getRightImageFilename = () => {
    const params = { ...sharedParams };
    params[selected_match] = comparisonValues.right;
    return `${params.data_trend}-${params.data_count}-${params.canny_technique}-${params.asset}-${params.width_scale}.png`;
  };
  
  // Get labels for the compared values
  const getComparisonLabels = () => {
    const leftVal = comparisonValues.left;
    const rightVal = comparisonValues.right;
    
    switch (selected_match) {
      case "data_trend":
        return [leftVal === "falling" ? "Falling" : "Logarithmic", 
                rightVal === "falling" ? "Falling" : "Logarithmic"];
      case "data_count":
        return [`${leftVal} Data Points`, `${rightVal} Data Points`];
      case "canny_technique":
        return [leftVal.charAt(0).toUpperCase() + leftVal.slice(1), 
                rightVal.charAt(0).toUpperCase() + rightVal.slice(1)];
      case "asset":
        return [leftVal.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()), 
                rightVal.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())];
      case "width_scale":
        return [`Scale ${leftVal.replace('scale', '')}`, 
                `Scale ${rightVal.replace('scale', '')}`];
      default:
        return ["Option 1", "Option 2"];
    }
  };
  
  // Get current pair of images
  const currentImage1 = getLeftImageFilename();
  const currentImage2 = getRightImageFilename();
  
  // Update the compared parameters when selection changes
  useEffect(() => {
    switch (selected_match) {
      case "data_trend":
        setComparisonValues({
          left: "falling",
          right: "logarithmic"
        });
        break;
      case "data_count":
        setComparisonValues({
          left: "4",
          right: "6"
        });
        break;
      case "canny_technique":
        setComparisonValues({
          left: "default",
          right: "blur"
        });
        break;
      case "asset":
        setComparisonValues({
          left: "pine_tree",
          right: "thin_man"
        });
        break;
      case "width_scale":
        setComparisonValues({
          left: "scale0.4",
          right: "scale0.8"
        });
        break;
    }
  }, [selected_match]);

  const labels = getComparisonLabels();

  return (
    <div className="output-gallery">
      <div className="controls-section">
        <div className="match-selector">
          <label>Compare by: </label>
          <select 
            value={selected_match}
            onChange={(e) => setSelectedMatch(e.target.value)}
          >
            <option value="data_trend">data_trend</option>
            <option value="data_count">data_count</option>
            <option value="canny_technique">canny_technique</option>
            <option value="asset">asset</option>
            <option value="width_scale">width_scale</option>
          </select>
        </div>
        
        <div className="shared-parameter-selectors">
          {/* Data Trend Selector */}
          <div className="selector-group">
            <label>Data Trend:</label>
            <select 
              value={selected_match === "data_trend" ? comparisonValues.left : sharedParams.data_trend}
              onChange={(e) => updateSharedParam("data_trend", e.target.value)}
              disabled={selected_match === "data_trend"}
            >
              {data_trend.map(trend => (
                <option key={trend} value={trend}>{trend}</option>
              ))}
            </select>
          </div>
          
          {/* Data Count Selector */}
          <div className="selector-group">
            <label>Data Count:</label>
            <select 
              value={selected_match === "data_count" ? comparisonValues.left : sharedParams.data_count}
              onChange={(e) => updateSharedParam("data_count", e.target.value)}
              disabled={selected_match === "data_count"}
            >
              {data_count.map(count => (
                <option key={count} value={count}>{count}</option>
              ))}
            </select>
          </div>
          
          {/* Canny Technique Selector */}
          <div className="selector-group">
            <label>Canny:</label>
            <select 
              value={selected_match === "canny_technique" ? comparisonValues.left : sharedParams.canny_technique}
              onChange={(e) => updateSharedParam("canny_technique", e.target.value)}
              disabled={selected_match === "canny_technique"}
            >
              {canny_technique.map(technique => (
                <option key={technique} value={technique}>{technique}</option>
              ))}
            </select>
          </div>
          
          {/* Asset Selector */}
          <div className="selector-group">
            <label>Asset:</label>
            <select 
              value={selected_match === "asset" ? comparisonValues.left : sharedParams.asset}
              onChange={(e) => updateSharedParam("asset", e.target.value)}
              disabled={selected_match === "asset"}
            >
              {asset.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          
          {/* Width Scale Selector */}
          <div className="selector-group">
            <label>Width:</label>
            <select 
              value={selected_match === "width_scale" ? comparisonValues.left : sharedParams.width_scale}
              onChange={(e) => updateSharedParam("width_scale", e.target.value)}
              disabled={selected_match === "width_scale"}
            >
              {width_scale.map(scale => (
                <option key={scale} value={scale}>{scale}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="image-comparison-container">
        <div className="image-comparison">
          <h3 className="comparison-label">{labels[0]}</h3>
          
          <div className="large-image-wrapper">
            <img 
              src={`/outputs/${currentImage1}`} 
              alt={currentImage1} 
              className="large-image"
            />
          </div>
        </div>
        
        <div className="image-comparison">
          <h3 className="comparison-label">{labels[1]}</h3>
          
          <div className="large-image-wrapper">
            <img 
              src={`/outputs/${currentImage2}`} 
              alt={currentImage2} 
              className="large-image"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
