import './App.css';
import MapBase from './Components/MapBase';
import UI from './Components/UI';
import CellCard from './Components/CellCard';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <MapBase/>
        <UI/>
        <CellCard/>
      </header>
    </div>
  );
}

export default App;
