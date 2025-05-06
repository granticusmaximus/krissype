import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RecipeForm from './pages/RecipeForm';
import RecipeView from './pages/RecipeView';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/add" element={<RecipeForm />} />
      <Route path="/edit/:id" element={<RecipeForm />} /> {/* ✅ Edit route */}
      <Route path="/recipe/:id" element={<RecipeView />} />
    </Routes>
  );
}

export default App;