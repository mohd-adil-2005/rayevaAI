import './App.css';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import CategoryTagPage from './pages/CategoryTagPage';
import ProposalPage from './pages/ProposalPage';
import ProductListPage from './pages/ProductListPage';
import ProposalListPage from './pages/ProposalListPage';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="header">
          <h1 className="logo">Rayeva AI</h1>
          <p className="tagline">Sustainable Commerce</p>
          <nav className="nav">
            <NavLink to="/" end>Category & Tags</NavLink>
            <NavLink to="/products">Products</NavLink>
            <NavLink to="/proposal">Proposal</NavLink>
            <NavLink to="/proposals">Proposals</NavLink>
          </nav>
        </header>
        <main className="main">
          <Routes>
            <Route path="/" element={<CategoryTagPage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/proposal" element={<ProposalPage />} />
            <Route path="/proposals" element={<ProposalListPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
