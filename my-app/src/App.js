import './App.css';
import MapBase from './Components/MapBase';
import UI from './Components/UI';
import CellCard from './Components/CellCard';
import GanttBot from './Components/GanttBot';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <MapBase />
        <UI />
        <CellCard />
        <GanttBot />
      </header>
    </div>
  );
}

export default App;
