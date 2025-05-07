import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RecipeForm from './pages/RecipeForm';
import RecipeView from './pages/RecipeView';
import EditRecipe from 'pages/EditRecipe';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/add" element={<RecipeForm />} />
      <Route path="/edit/:id" element={<EditRecipe />} />
      <Route path="/view/:id" element={<RecipeView />} /> {/* 👈 This is critical */}
    </Routes>
  );
}

export default App;