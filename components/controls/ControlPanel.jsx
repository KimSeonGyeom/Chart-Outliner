import DimensionsSection from './shared/DimensionsSection.jsx';
import AxisSection from './shared/AxisSection.jsx';
import DomainSection from './shared/DomainSection.jsx';
import StrokePatternSection from './shared/StrokePatternSection.jsx';
import FillSection from './shared/FillSection.jsx';
import DataSection from './shared/DataSection.jsx';
import BarPaddingSection from './bar/BarPaddingSection.jsx';
import TransformControls from './shared/TransformControls.jsx';
import './ControlPanel.scss';
import { useSharedStore } from '../store/sharedStore.js';

// Bar chart specific controls component
const BarControls = () => {
  return (
    <div className="chart-specific-controls">
      <BarPaddingSection />
    </div>
  );
};

// Shared controls component
const SharedControls = () => {
  return (
    <div className="shared-controls">
      <DataSection />
      <AxisSection />
      <DomainSection />
      {/* <StrokePatternSection />  */}
      {/* <FillSection /> */}
      {/* <TransformControls /> */}
    </div>
  );
};

const ControlPanel = () => {
  const chartType = useSharedStore(state => state.chartType);
  
  return (
    <div className="controls-panel">
      <div className="header">Chart Controls</div>
      <div className="chart-controls">
        <SharedControls />
        <BarControls />
      </div>
    </div>
  );
};

// Export components for direct use in other files if needed
export { BarControls, SharedControls };
export default ControlPanel; 