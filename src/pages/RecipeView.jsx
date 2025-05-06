import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, addDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
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
    ingredients: [''],
    directions: [''],
    nutrition: {},
    imageUrl: '',
  });

  useEffect(() => {
    if (isEdit) {
      const loadRecipe = async () => {
        const ref = doc(db, 'recipes', id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setForm({ ...snap.data(), id });
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
    try {
      if (isEdit) {
        await setDoc(doc(db, 'recipes', id), form);
        toast.success('Recipe updated successfully!');
      } else {
        await addDoc(collection(db, 'recipes'), form);
        toast.success('Recipe added successfully!');
      }
      navigate('/');
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error('Failed to save recipe.');
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
          <Input
            type="text"
            name="servingSize"
            id="servingSize"
            value={form.servingSize}
            onChange={handleChange}
          />
        </FormGroup>

        <FormGroup>
          <Label for="prepTime">Prep Time</Label>
          <Input
            type="text"
            name="prepTime"
            id="prepTime"
            value={form.prepTime}
            onChange={handleChange}
          />
        </FormGroup>

        <FormGroup>
          <Label for="cookTime">Cook Time</Label>
          <Input
            type="text"
            name="cookTime"
            id="cookTime"
            value={form.cookTime}
            onChange={handleChange}
          />
        </FormGroup>

        <FormGroup>
          <Label for="notes">Notes</Label>
          <Input
            type="textarea"
            name="notes"
            id="notes"
            value={form.notes}
            onChange={handleChange}
          />
        </FormGroup>

        <FormGroup>
          <Label>Ingredients</Label>
          {form.ingredients.map((item, idx) => (
            <Input
              key={idx}
              type="text"
              value={item}
              onChange={(e) => {
                const updated = [...form.ingredients];
                updated[idx] = e.target.value;
                setForm((prev) => ({ ...prev, ingredients: updated }));
              }}
              className="mb-2"
            />
          ))}
          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              setForm((prev) => ({
                ...prev,
                ingredients: [...prev.ingredients, ''],
              }));
            }}
          >
            + Add Ingredient
          </Button>
        </FormGroup>

        <FormGroup>
          <Label>Directions</Label>
          {form.directions.map((step, idx) => (
            <Input
              key={idx}
              type="text"
              value={step}
              onChange={(e) => {
                const updated = [...form.directions];
                updated[idx] = e.target.value;
                setForm((prev) => ({ ...prev, directions: updated }));
              }}
              className="mb-2"
            />
          ))}
          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              setForm((prev) => ({
                ...prev,
                directions: [...prev.directions, ''],
              }));
            }}
          >
            + Add Step
          </Button>
        </FormGroup>

        <FormGroup>
          <Label for="imageUrl">Image URL</Label>
          <Input
            type="text"
            name="imageUrl"
            id="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
          />
        </FormGroup>
        <Button type="submit" color="primary">{isEdit ? 'Update' : 'Add'}</Button>
      </Form>
    </Container>
  );
};

export default RecipeForm;