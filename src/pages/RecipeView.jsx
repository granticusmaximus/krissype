import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Container, Button, Row, Col } from 'reactstrap';

const RecipeView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const ref = doc(db, 'recipes', id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setRecipe({
            name: data.name || 'Untitled',
            course: Array.isArray(data.course) ? data.course : [],
            categories: Array.isArray(data.categories) ? data.categories : [],
            ingredients: Array.isArray(data.ingredients)
              ? data.ingredients
              : typeof data.ingredients === 'string'
              ? data.ingredients.split('\n').map(s => s.trim()).filter(Boolean)
              : [],
            directions: Array.isArray(data.directions)
              ? data.directions
              : typeof data.directions === 'string'
              ? data.directions.split('\n').map(s => s.trim()).filter(Boolean)
              : [],
            servingSize: data.servings || data.servingSize || '—',
            prepTime: data.prepTime || data.prepMinutes || '—',
            cookTime: data.cookTime || '—',
            notes: data.notes || '—',
            nutrition: typeof data.nutrition === 'object' && data.nutrition !== null ? data.nutrition : {},
            imageUrl: data.imageUrl || '',
            utensils: data.utensils || [],
          });
        } else {
          console.error('Recipe not found');
        }
      } catch (error) {
        console.error('Error fetching recipe:', error);
      }
    };

    fetchRecipe();
  }, [id]);

  return (
    <Container className="my-4">
      {!recipe ? (
        <p>Loading...</p>
      ) : (
        <>
          <h2>{recipe.name}</h2>
          <div className="mb-3">
            {recipe.course?.map((c, i) => (
              <span key={`course-${i}`} className="badge rounded-pill bg-info text-dark me-2">
                #{c}
              </span>
            ))}
            {recipe.categories?.map((cat, i) => (
              <span key={`category-${i}`} className="badge rounded-pill bg-secondary text-light me-2">
                #{cat}
              </span>
            ))}
          </div>
          <div className="mb-3">
            <Button color="primary" className="me-2" onClick={() => navigate(`/edit/${id}`)}>
              Edit Recipe
            </Button>
            <Button color="secondary" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
          <Row className="mb-4">
            <Col md={6}>
              {recipe.imageUrl ? (
                <img
                  src={recipe.imageUrl}
                  alt={recipe.name}
                  className="img-fluid"
                  style={{ maxHeight: '300px', objectFit: 'cover' }}
                />
              ) : (
                <img
                  src="https://placehold.co/600x300?text=No+Image"
                  alt="No Image"
                  className="img-fluid"
                  style={{ maxHeight: '300px', objectFit: 'cover' }}
                />
              )}
            </Col>
            <Col md={6}>
              <p><strong>Serving Size:</strong> {recipe.servingSize || '—'}</p>
              <p><strong>Prep Time:</strong> {recipe.prepTime || '—'}</p>
              <p><strong>Cook Time:</strong> {recipe.cookTime || '—'}</p>
              <p><strong>Notes:</strong> {recipe.notes || '—'}</p>
              <p><strong>Ingredients:</strong></p>
              <ul className="mb-3">
                {recipe.ingredients.map((item, idx) => (
                  <li key={idx} className="mb-2">{item}</li>
                ))}
              </ul>
              <p><strong>Directions:</strong></p>
              <ul className="mb-3">
                {recipe.directions.map((step, idx) => (
                  <li key={idx} className="mb-2">{step}</li>
                ))}
              </ul>
              <p><strong>Nutrition:</strong></p>
              <ul className="mb-3">
                {Object.entries(recipe.nutrition).map(([key, value]) => (
                  <li key={key}><strong>{key}:</strong> {value}</li>
                ))}
              </ul>
              <p><strong>Utensils Needed:</strong></p>
              <ul className="mb-3">
                {recipe.utensils && recipe.utensils.length > 0 ? (
                  recipe.utensils.map((utensil, idx) => (
                    <li key={idx}>{utensil}</li>
                  ))
                ) : (
                  <li>None specified</li>
                )}
              </ul>
            </Col>
          </Row>

        </>
      )}
    </Container>
  );
};

export default RecipeView;