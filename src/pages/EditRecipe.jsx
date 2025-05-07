import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import {
  Container, Form, FormGroup, Label, Input, Button, Row, Col
} from 'reactstrap';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { getMetaTags, addMetaTag } from '../services/metaService';

const EditRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    course: [],
    categories: [],
    servings: '',
    prepTime: '',
    cookTime: '',
    notes: '',
    ingredients: [''],
    directions: [''],
    nutrition: {},
    imageUrl: '',
    source: ''
  });
  const [availableCourses, setAvailableCourses] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [newCourse, setNewCourse] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const addCourse = async () => {
    if (newCourse && !availableCourses.includes(newCourse)) {
      await addMetaTag('courses', newCourse);
      setAvailableCourses(prev => [...prev, newCourse]);
      setNewCourse('');
    }
  };

  const addCategory = async () => {
    if (newCategory && !availableCategories.includes(newCategory)) {
      await addMetaTag('categories', newCategory);
      setAvailableCategories(prev => [...prev, newCategory]);
      setNewCategory('');
    }
  };

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        const ref = doc(db, 'recipes', id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          const meta = await getMetaTags();
          setAvailableCourses(meta.course || []);
          setAvailableCategories(meta.category || []);
          setForm({
            name: data.name || '',
            course: Array.isArray(data.course) ? data.course : [],
            categories: Array.isArray(data.categories) ? data.categories : [],
            servings: data.servings || '',
            prepTime: data.prepTime || '',
            cookTime: data.cookTime || '',
            notes: data.notes || '',
            ingredients: Array.isArray(data.ingredients)
              ? data.ingredients
              : (typeof data.ingredients === 'string'
                ? data.ingredients.split('\n').map(s => s.trim()).filter(Boolean)
                : ['']),
            directions: Array.isArray(data.directions)
              ? data.directions
              : (typeof data.directions === 'string'
                ? data.directions.split('\n').map(s => s.trim()).filter(Boolean)
                : ['']),
            nutrition: typeof data.nutrition === 'object' && data.nutrition !== null ? data.nutrition : {},
            imageUrl: data.imageUrl || '',
            source: data.source || ''
          });
        } else {
          toast.error('Recipe not found.');
          navigate('/');
        }
      } catch (error) {
        console.error('Error loading recipe:', error);
        toast.error('Failed to load recipe.');
      }
    };
    loadRecipe();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev[field]];
      updated[index] = value;
      return { ...prev, [field]: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'recipes', id), form);
      toast.success('Recipe updated successfully! Redirecting...');
      setTimeout(() => {
        navigate(`/view/${id}`);
      }, 2000);
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error('Failed to update recipe.');
    }
  };

  return (
    <Container className="my-4">
      <h2>Edit {form.name || 'Recipe'}</h2>
      <Button color="outline-primary" className="mb-3" onClick={() => navigate(`/view/${id}`)}>
        Cancel
      </Button>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label for="name">Name</Label>
          <Input type="text" name="name" value={form.name} onChange={handleChange} required />
        </FormGroup>

        <FormGroup>
          <Label>Course</Label>
          <Select
            isMulti
            name="course"
            options={availableCourses.map(c => ({ label: c, value: c }))}
            value={form.course.map(c => ({ label: c, value: c }))}
            onChange={(selected) => setForm(prev => ({ ...prev, course: selected.map(s => s.value) }))}
            classNamePrefix="select"
          />
          <Input className="mt-2" placeholder="Add new course" value={newCourse} onChange={e => setNewCourse(e.target.value)} />
          <Button size="sm" className="mt-1" onClick={addCourse}>Add Course</Button>
        </FormGroup>

        <FormGroup>
          <Label>Categories</Label>
          <Select
            isMulti
            name="categories"
            options={availableCategories.map(c => ({ label: c, value: c }))}
            value={form.categories.map(c => ({ label: c, value: c }))}
            onChange={(selected) => setForm(prev => ({ ...prev, categories: selected.map(s => s.value) }))}
            classNamePrefix="select"
          />
          <Input className="mt-2" placeholder="Add new category" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
          <Button size="sm" className="mt-1" onClick={addCategory}>Add Category</Button>
        </FormGroup>

        <FormGroup>
          <Label for="servings">Servings</Label>
          <Input type="text" name="servings" value={form.servings} onChange={handleChange} />
        </FormGroup>

        <FormGroup>
          <Label for="prepTime">Prep Time</Label>
          <Input type="text" name="prepTime" value={form.prepTime} onChange={handleChange} />
        </FormGroup>

        <FormGroup>
          <Label for="cookTime">Cook Time</Label>
          <Input type="text" name="cookTime" value={form.cookTime} onChange={handleChange} />
        </FormGroup>

        <FormGroup>
          <Label for="notes">Notes</Label>
          <Input type="textarea" name="notes" value={form.notes} onChange={handleChange} />
        </FormGroup>

        <FormGroup>
          <Label>Ingredients</Label>
          {form.ingredients.map((item, idx) => (
            <Input key={idx} type="text" className="mb-2" value={item}
              onChange={(e) => handleArrayChange(idx, 'ingredients', e.target.value)} />
          ))}
          <Button size="sm" onClick={(e) => {
            e.preventDefault();
            setForm((prev) => ({ ...prev, ingredients: [...prev.ingredients, ''] }));
          }}>
            + Add Ingredient
          </Button>
        </FormGroup>

        <FormGroup>
          <Label>Directions</Label>
          {form.directions.map((item, idx) => (
            <Input key={idx} type="text" className="mb-2" value={item}
              onChange={(e) => handleArrayChange(idx, 'directions', e.target.value)} />
          ))}
          <Button size="sm" onClick={(e) => {
            e.preventDefault();
            setForm((prev) => ({ ...prev, directions: [...prev.directions, ''] }));
          }}>
            + Add Step
          </Button>
        </FormGroup>

        <FormGroup>
          <Label for="imageUrl">Image URL</Label>
          <Input type="text" name="imageUrl" value={form.imageUrl} onChange={handleChange} />
        </FormGroup>

        <FormGroup>
          <Label for="source">Source</Label>
          <Input type="text" name="source" value={form.source} onChange={handleChange} />
        </FormGroup>

        <Button color="outline-success" type="submit">
          <i className="bi bi-save me-2"></i>Update
        </Button>
      </Form>
    </Container>
  );
};

export default EditRecipe;
