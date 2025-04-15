import AxisSection from './AxisSection.jsx';
import DomainSection from './DomainSection.jsx';
import DataSection from './DataSection.jsx';
import BarPaddingSection from './BarPaddingSection.jsx';
import './ControlPanel.scss';

const ControlPanel = () => {
  return (
    <div className="controls-panel">
      <div className="header">Chart Controls</div>
      <div className="chart-controls">
        <DataSection />
        <AxisSection />
        <DomainSection />
        <BarPaddingSection />
      </div>
    </div>
  );
};

// Export components for direct use in other files if needed
export default ControlPanel; 