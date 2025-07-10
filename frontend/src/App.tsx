import './App.css';
import CustomStyles from './AppTheme';
import HeaderBar from './components/HeaderBar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage'; 

function App() {
  return (
    <Router>
      <CustomStyles>
        <HeaderBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          
        </Routes>
      </CustomStyles>
    </Router>
  );
}

export default App;