// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MyNavbar from './components/Navbar';
import Panel from './components/Panel';
import Panel2 from './components/Panel2';
//import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  return (
    <Router>
      <MyNavbar />
      <Routes>
        <Route path="/" element={<Panel />} />
        <Route path="/panel2" element={<Panel2 />} />
      </Routes>
    </Router>
  );
};

export default App;
