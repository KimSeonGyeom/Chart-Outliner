import React from 'react';
import { useSharedStore } from '../../store/sharedStore';

const TransformControls = () => {
  // Get transformation settings and actions from store
  const transformationType = useSharedStore((state) => state.transformationType);
  const translationX = useSharedStore((state) => state.translationX);
  const translationY = useSharedStore((state) => state.translationY);
  const scaleX = useSharedStore((state) => state.scaleX);
  const scaleY = useSharedStore((state) => state.scaleY);
  const rotation = useSharedStore((state) => state.rotation);
  const skewX = useSharedStore((state) => state.skewX);
  const skewY = useSharedStore((state) => state.skewY);
  const perspective = useSharedStore((state) => state.perspective);
  const distortionType = useSharedStore((state) => state.distortionType);
  const distortionAmount = useSharedStore((state) => state.distortionAmount);
  const distortionCenterX = useSharedStore((state) => state.distortionCenterX);
  const distortionCenterY = useSharedStore((state) => state.distortionCenterY);
  
  // Get actions
  const setTransformationType = useSharedStore((state) => state.setTransformationType);
  const setTranslationX = useSharedStore((state) => state.setTranslationX);
  const setTranslationY = useSharedStore((state) => state.setTranslationY);
  const setScaleX = useSharedStore((state) => state.setScaleX);
  const setScaleY = useSharedStore((state) => state.setScaleY);
  const setRotation = useSharedStore((state) => state.setRotation);
  const setSkewX = useSharedStore((state) => state.setSkewX);
  const setSkewY = useSharedStore((state) => state.setSkewY);
  const setPerspective = useSharedStore((state) => state.setPerspective);
  const setDistortionType = useSharedStore((state) => state.setDistortionType);
  const setDistortionAmount = useSharedStore((state) => state.setDistortionAmount);
  const setDistortionCenterX = useSharedStore((state) => state.setDistortionCenterX);
  const setDistortionCenterY = useSharedStore((state) => state.setDistortionCenterY);
  
  // Handle number inputs
  const handleNumberInput = (setter) => (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setter(value);
    }
  };
  
  return (
    <div className="control-section">
      <h3 className="control-heading">Transformations</h3>
      
      <div className="control-row">
        <label htmlFor="transformationType">Transformation Type:</label>
        <select 
          id="transformationType" 
          value={transformationType} 
          onChange={(e) => setTransformationType(e.target.value)}
          className="control-select"
        >
          <option value="none">None</option>
          <option value="translation">Translation</option>
          <option value="affine">Affine</option>
          <option value="projective">Projective</option>
          <option value="distortion">Distortion</option>
        </select>
      </div>
      
      {/* Show relevant controls based on the transformation type */}
      {transformationType !== 'none' && (
        <div className="transform-controls">
          {/* Translation controls */}
          {transformationType === 'translation' || transformationType === 'affine' ? (
            <>
              <div className="control-row">
                <label htmlFor="translationX">Translation X:</label>
                <input
                  id="translationX"
                  type="range"
                  min="-100"
                  max="100"
                  value={translationX}
                  onChange={handleNumberInput(setTranslationX)}
                  className="control-slider"
                />
                <input
                  type="number"
                  value={translationX}
                  onChange={handleNumberInput(setTranslationX)}
                  className="control-number"
                />
              </div>
              
              <div className="control-row">
                <label htmlFor="translationY">Translation Y:</label>
                <input
                  id="translationY"
                  type="range"
                  min="-100"
                  max="100"
                  value={translationY}
                  onChange={handleNumberInput(setTranslationY)}
                  className="control-slider"
                />
                <input
                  type="number"
                  value={translationY}
                  onChange={handleNumberInput(setTranslationY)}
                  className="control-number"
                />
              </div>
            </>
          ) : null}
          
          {/* Affine transformation controls */}
          {transformationType === 'affine' && (
            <>
              <div className="control-row">
                <label htmlFor="scaleX">Scale X:</label>
                <input
                  id="scaleX"
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={scaleX}
                  onChange={handleNumberInput(setScaleX)}
                  className="control-slider"
                />
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={scaleX}
                  onChange={handleNumberInput(setScaleX)}
                  className="control-number"
                />
              </div>
              
              <div className="control-row">
                <label htmlFor="scaleY">Scale Y:</label>
                <input
                  id="scaleY"
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={scaleY}
                  onChange={handleNumberInput(setScaleY)}
                  className="control-slider"
                />
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={scaleY}
                  onChange={handleNumberInput(setScaleY)}
                  className="control-number"
                />
              </div>
              
              <div className="control-row">
                <label htmlFor="rotation">Rotation (deg):</label>
                <input
                  id="rotation"
                  type="range"
                  min="-180"
                  max="180"
                  value={rotation}
                  onChange={handleNumberInput(setRotation)}
                  className="control-slider"
                />
                <input
                  type="number"
                  min="-180"
                  max="180"
                  value={rotation}
                  onChange={handleNumberInput(setRotation)}
                  className="control-number"
                />
              </div>
              
              <div className="control-row">
                <label htmlFor="skewX">Skew X (deg):</label>
                <input
                  id="skewX"
                  type="range"
                  min="-60"
                  max="60"
                  value={skewX}
                  onChange={handleNumberInput(setSkewX)}
                  className="control-slider"
                />
                <input
                  type="number"
                  min="-60"
                  max="60"
                  value={skewX}
                  onChange={handleNumberInput(setSkewX)}
                  className="control-number"
                />
              </div>
              
              <div className="control-row">
                <label htmlFor="skewY">Skew Y (deg):</label>
                <input
                  id="skewY"
                  type="range"
                  min="-60"
                  max="60"
                  value={skewY}
                  onChange={handleNumberInput(setSkewY)}
                  className="control-slider"
                />
                <input
                  type="number"
                  min="-60"
                  max="60"
                  value={skewY}
                  onChange={handleNumberInput(setSkewY)}
                  className="control-number"
                />
              </div>
            </>
          )}
          
          {/* Projective transformation controls */}
          {transformationType === 'projective' && (
            <>
              <div className="control-row">
                <label htmlFor="perspective">Perspective:</label>
                <input
                  id="perspective"
                  type="range"
                  min="100"
                  max="2000"
                  value={perspective}
                  onChange={handleNumberInput(setPerspective)}
                  className="control-slider"
                />
                <input
                  type="number"
                  min="100"
                  max="2000"
                  value={perspective}
                  onChange={handleNumberInput(setPerspective)}
                  className="control-number"
                />
              </div>
              
              <div className="control-row">
                <label htmlFor="rotation">Rotation X (deg):</label>
                <input
                  id="rotation"
                  type="range"
                  min="-45"
                  max="45"
                  value={rotation}
                  onChange={handleNumberInput(setRotation)}
                  className="control-slider"
                />
                <input
                  type="number"
                  min="-45"
                  max="45"
                  value={rotation}
                  onChange={handleNumberInput(setRotation)}
                  className="control-number"
                />
              </div>
              
              <div className="control-row">
                <label htmlFor="skewX">Rotation Y (deg):</label>
                <input
                  id="skewX"
                  type="range"
                  min="-45"
                  max="45"
                  value={skewX}
                  onChange={handleNumberInput(setSkewX)}
                  className="control-slider"
                />
                <input
                  type="number"
                  min="-45"
                  max="45"
                  value={skewX}
                  onChange={handleNumberInput(setSkewX)}
                  className="control-number"
                />
              </div>
            </>
          )}
          
          {/* Distortion controls */}
          {transformationType === 'distortion' && (
            <>
              <div className="control-row">
                <label htmlFor="distortionType">Distortion Type:</label>
                <select 
                  id="distortionType" 
                  value={distortionType} 
                  onChange={(e) => setDistortionType(e.target.value)}
                  className="control-select"
                >
                  <option value="wave">Wave</option>
                  <option value="barrel">Barrel</option>
                  <option value="pincushion">Pincushion</option>
                  <option value="curvedHorizon">Curved Horizon</option>
                </select>
              </div>
              
              <div className="control-row">
                <label htmlFor="distortionAmount">Intensity:</label>
                <input
                  id="distortionAmount"
                  type="range"
                  min="1"
                  max="50"
                  value={distortionAmount}
                  onChange={handleNumberInput(setDistortionAmount)}
                  className="control-slider"
                />
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={distortionAmount}
                  onChange={handleNumberInput(setDistortionAmount)}
                  className="control-number"
                />
              </div>
              
              {/* Center controls for barrel, pincushion, and curved horizon distortions */}
              {['barrel', 'pincushion', 'curvedHorizon'].includes(distortionType) && (
                <>
                  <div className="control-row">
                    <label htmlFor="distortionCenterX">Center X:</label>
                    <input
                      id="distortionCenterX"
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={distortionCenterX}
                      onChange={handleNumberInput(setDistortionCenterX)}
                      className="control-slider"
                    />
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={distortionCenterX}
                      onChange={handleNumberInput(setDistortionCenterX)}
                      className="control-number"
                    />
                  </div>
                  
                  <div className="control-row">
                    <label htmlFor="distortionCenterY">Center Y:</label>
                    <input
                      id="distortionCenterY"
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={distortionCenterY}
                      onChange={handleNumberInput(setDistortionCenterY)}
                      className="control-slider"
                    />
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={distortionCenterY}
                      onChange={handleNumberInput(setDistortionCenterY)}
                      className="control-number"
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TransformControls; 