import { useState } from 'react'
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import HelloWorld from './helloWorld/helloWorld.jsx';
import Map from './Map/Map.jsx';

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h1>look here if it render</h1>
      <Map/>
    </div>
  );
}

export default App
