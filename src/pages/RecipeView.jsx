// src/pages/RecipeView.jsx
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, CardImg, Button } from 'reactstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const RecipeView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      const ref = doc(db, 'recipes', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setRecipe(snap.data());
      }
    };
    fetchRecipe();
  }, [id]);

  if (!recipe) return <div>Loading...</div>;

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col md="6">
          <Card>
            <CardImg
              top
              width="100%"
              src={recipe.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'}
              alt={recipe.name}
            />
          </Card>
        </Col>
        <Col md="6">
          <h2>{recipe.name}</h2>
          <p><strong>Source:</strong> {recipe.source}</p>
          <p><strong>Servings:</strong> {recipe.servings}</p>
          <p><strong>Prep Time:</strong> {recipe.prepTime}</p>
          <p><strong>Cook Time:</strong> {recipe.cookTime}</p>
          <div className="mt-3">
            {recipe.course?.map((c, i) => (
              <span key={i} className="badge bg-info text-dark me-2">#{c}</span>
            ))}
            {recipe.categories?.map((cat, i) => (
              <span key={i} className="badge bg-secondary text-light me-2">#{cat}</span>
            ))}
          </div>
          <div className="mt-4">
            <Button color="secondary" onClick={() => navigate('/')}>Back to Home</Button>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <h4>Ingredients</h4>
          <p style={{ whiteSpace: 'pre-wrap' }}>{recipe.ingredients}</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <h4>Directions</h4>
          <p style={{ whiteSpace: 'pre-wrap' }}>{recipe.directions}</p>
        </Col>
      </Row>

      {recipe.notes && (
        <Row className="mb-4">
          <Col>
            <h4>Notes</h4>
            <p style={{ whiteSpace: 'pre-wrap' }}>{recipe.notes}</p>
          </Col>
        </Row>
      )}

      <Row className="mb-4">
        <Col>
          <h4>Nutrition</h4>
          <ul>
            {Object.entries(recipe.nutrition || {}).map(([key, value]) => (
              <li key={key}><strong>{key}:</strong> {value}</li>
            ))}
          </ul>
        </Col>
      </Row>
    </Container>
  );
};

export default RecipeView;