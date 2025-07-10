import './App.css';
import CustomStyles from './AppTheme';
import HeaderBar from './components/HeaderBar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import { Box } from '@mui/material';

function App() {
  return (
    <Router>
      <CustomStyles>
        <Box sx={{
          backgroundColor: 'background.default',
          minHeight: '100vh',
          width: '100%',
          overflow: 'hidden'
        }}>
          <HeaderBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </Box>
      </CustomStyles>
    </Router>
  );
}

export default App;