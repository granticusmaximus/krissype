// RecipeForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, addDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { shortenUrl } from '../services/shortLinkService';
import { Container, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RecipeForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    course: [],
    categories: [],
    servingSize: '',
    prepTime: '',
    cookTime: '',
    notes: '',
    ingredients: [],
    directions: [],
    nutrition: {},
    imageUrl: '',
  });

  useEffect(() => {
    if (isEdit) {
      const loadRecipe = async () => {
        const ref = doc(db, 'recipes', id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          console.log('Loaded ingredients:', data.ingredients);
          console.log('typeof ingredients:', typeof data.ingredients);
          // Ensure ingredients and directions are sanitized to arrays or []
          const ingredients = Array.isArray(data.ingredients)
            ? data.ingredients
            : typeof data.ingredients === 'string'
            ? [data.ingredients]
            : [];

          const directions = Array.isArray(data.directions)
            ? data.directions
            : typeof data.directions === 'string'
            ? [data.directions]
            : [];

          setForm({
            name: data.name || '',
            course: Array.isArray(data.course) ? data.course : [],
            categories: Array.isArray(data.categories) ? data.categories : [],
            servingSize: data.servingSize || '',
            prepTime: data.prepTime || '',
            cookTime: data.cookTime || '',
            notes: data.notes || '',
            ingredients,
            directions,
            nutrition: typeof data.nutrition === 'object' && data.nutrition !== null ? data.nutrition : {},
            imageUrl: data.imageUrl || '',
            id,
          });
        }
      };
      loadRecipe();
    }
  }, [isEdit, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const safeForm = {
      ...form,
      ingredients: Array.isArray(form.ingredients) ? form.ingredients : [],
      directions: Array.isArray(form.directions) ? form.directions : [],
    };
    try {
      if (isEdit) {
        await setDoc(doc(db, 'recipes', id), safeForm);
        toast.success('Recipe updated successfully!');
      } else {
        await addDoc(collection(db, 'recipes'), safeForm);
        toast.success('Recipe added successfully!');
      }
      navigate('/');
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error('Failed to save recipe.');
    }
  };

  const handleShare = async () => {
    const fullUrl = `${window.location.origin}/view/${id}`;
    try {
      const shortUrl = await shortenUrl(fullUrl);
      await navigator.clipboard.writeText(shortUrl);
      toast.success('Short URL copied to clipboard!');
    } catch (error) {
      toast.error('Failed to generate short URL');
      console.error(error);
    }
  };

  return (
    <Container className="my-4">
      <ToastContainer />
      <h2>{isEdit ? 'Edit Recipe' : 'Add Recipe'}</h2>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label for="name">Name</Label>
          <Input type="text" name="name" id="name" value={form.name} onChange={handleChange} required />
        </FormGroup>

        <FormGroup>
          <Label for="course">Course</Label>
          <Input
            type="text"
            name="course"
            id="course"
            value={form.course.join(', ')}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                course: e.target.value.split(',').map((x) => x.trim()),
              }))
            }
          />
        </FormGroup>

        <FormGroup>
          <Label for="categories">Categories</Label>
          <Input
            type="text"
            name="categories"
            id="categories"
            value={form.categories.join(', ')}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                categories: e.target.value.split(',').map((x) => x.trim()),
              }))
            }
          />
        </FormGroup>

        <FormGroup>
          <Label for="servingSize">Serving Size</Label>
          <Input type="text" name="servingSize" id="servingSize" value={form.servingSize} onChange={handleChange} />
        </FormGroup>

        <FormGroup>
          <Label for="prepTime">Prep Time</Label>
          <Input type="text" name="prepTime" id="prepTime" value={form.prepTime} onChange={handleChange} />
        </FormGroup>

        <FormGroup>
          <Label for="cookTime">Cook Time</Label>
          <Input type="text" name="cookTime" id="cookTime" value={form.cookTime} onChange={handleChange} />
        </FormGroup>

        <FormGroup>
          <Label for="notes">Notes</Label>
          <Input type="textarea" name="notes" id="notes" value={form.notes} onChange={handleChange} />
        </FormGroup>

        <FormGroup>
          <Label>Ingredients</Label>
          {(() => {
            const ingredientsList = (() => {
              if (Array.isArray(form.ingredients)) return form.ingredients;
              if (typeof form.ingredients === 'string') return [form.ingredients];
              if (form.ingredients == null) return [];
              try {
                const parsed = JSON.parse(JSON.stringify(form.ingredients));
                return Array.isArray(parsed) ? parsed : [];
              } catch {
                return [];
              }
            })();

            return ingredientsList.map((item, idx) => {
              return (
                <Input
                  key={idx}
                  type="text"
                  value={item}
                  onChange={(e) => {
                    setForm((prev) => {
                      const current = (() => {
                        if (Array.isArray(prev.ingredients)) return prev.ingredients;
                        if (typeof prev.ingredients === 'string') return [prev.ingredients];
                        if (prev.ingredients == null) return [];
                        try {
                          const parsed = JSON.parse(JSON.stringify(prev.ingredients));
                          return Array.isArray(parsed) ? parsed : [];
                        } catch {
                          return [];
                        }
                      })();
                      const updated = [...current];
                      updated[idx] = e.target.value;
                      return { ...prev, ingredients: updated };
                    });
                  }}
                  className="mb-2"
                />
              );
            });
          })()}
          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              setForm((prev) => ({
                ...prev,
                ingredients: [...(Array.isArray(prev.ingredients) ? prev.ingredients : []), ''],
              }));
            }}
          >
            + Add Ingredient
          </Button>
        </FormGroup>

        <FormGroup>
          <Label>Directions</Label>
          {(() => {
            const directionsList = Array.isArray(form.directions)
              ? form.directions
              : typeof form.directions === 'string'
              ? [form.directions]
              : [];

            return directionsList.map((step, idx) => (
              <Input
                key={idx}
                type="text"
                value={step}
                onChange={(e) => {
                  const updated = [...directionsList];
                  updated[idx] = e.target.value;
                  setForm((prev) => ({ ...prev, directions: updated }));
                }}
                className="mb-2"
              />
            ));
          })()}
          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              setForm((prev) => ({
                ...prev,
                directions: [...(Array.isArray(prev.directions) ? prev.directions : []), ''],
              }));
            }}
          >
            + Add Step
          </Button>
        </FormGroup>

        <FormGroup>
          <Label for="imageUrl">Image URL</Label>
          <Input type="text" name="imageUrl" id="imageUrl" value={form.imageUrl} onChange={handleChange} />
        </FormGroup>

        <Button type="submit" color="primary">{isEdit ? 'Update' : 'Add'}</Button>{' '}
        {isEdit && (
          <Button color="info" className="ms-2" onClick={handleShare}>Share Recipe</Button>
        )}
      </Form>
    </Container>
  );
};

export default RecipeForm;