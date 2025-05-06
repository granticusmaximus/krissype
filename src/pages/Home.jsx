// src/pages/Home.jsx (Full version with search bar and tag filtering)
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Input, Label } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import { fetchRecipes } from '../services/firestore';
import { getMetaTags } from '../services/metaService';

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchRecipes();
      setRecipes(data);
      setFilteredRecipes(data);
      const meta = await getMetaTags();
      setCourses(meta.courses || []);
      setCategories(meta.categories || []);
    };
    loadData();
  }, []);

  useEffect(() => {
    let filtered = [...recipes];

    if (selectedCourse) {
      filtered = filtered.filter(r => r.course?.includes(selectedCourse));
    }

    if (selectedCategory) {
      filtered = filtered.filter(r => r.categories?.includes(selectedCategory));
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.name?.toLowerCase().includes(lower) ||
        r.ingredients?.toLowerCase().includes(lower) ||
        r.course?.some(c => c.toLowerCase().includes(lower)) ||
        r.categories?.some(cat => cat.toLowerCase().includes(lower))
      );
    }

    setFilteredRecipes(filtered);
  }, [selectedCourse, selectedCategory, searchTerm, recipes]);

  return (
    <Container className="py-4">
      <Row className="mb-3">
        <Col><h2>Recipes</h2></Col>
        <Col className="text-end">
          <Button color="primary" onClick={() => navigate('/add')}>+ Add Recipe</Button>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md="4">
          <Label for="searchInput">Search Recipes</Label>
          <Input
            id="searchInput"
            placeholder="Search by name, ingredient, or tag"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md="4">
          <Label for="courseFilter">Filter by Course</Label>
          <Input
            type="select"
            id="courseFilter"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">-- All --</option>
            {courses.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </Input>
        </Col>
        <Col md="4">
          <Label for="categoryFilter">Filter by Category</Label>
          <Input
            type="select"
            id="categoryFilter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">-- All --</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Input>
        </Col>
      </Row>

      <Row xs="1" sm="2" md="3" lg="4" className="g-4">
        {filteredRecipes.map(recipe => (
          <Col key={recipe.id}>
            <RecipeCard
              title={recipe.name}
              imageUrl={recipe.imageUrl}
              onClick={() => navigate(`/view/${recipe.id}`)}
              course={recipe.course}
              categories={recipe.categories}
            />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Home;