import './App.css';
import MapBase from './Components/MapBase';
import CellCard from './Components/CellCard';
import GanttBot from './Components/GanttBot';
import ClusterView from './Components/ClusterView';
import StatMat from './Components/StatMat';
import UI from './Components/UI';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <MapBase />
        <CellCard />
        <GanttBot />
        <ClusterView />
        <StatMat />
        <UI />
      </header>
    </div>
  );
}

export default App;
