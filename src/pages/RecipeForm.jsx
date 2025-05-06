// src/pages/RecipeForm.jsx (Full version with react-select for course and categories)
import React, { useEffect, useState } from 'react';
import {
  Container, Row, Col, Nav, NavItem, NavLink,
  TabContent, TabPane, Button, FormGroup, Label, Input
} from 'reactstrap';
import classnames from 'classnames';
import { useNavigate, useParams } from 'react-router-dom';
import { addRecipe } from '../services/firestore';
import { uploadImage } from '../services/storage';
import { getMetaTags, addMetaTag } from '../services/metaService';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { FaArrowLeft } from 'react-icons/fa';
import Select from 'react-select';

const RecipeForm = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '', source: '', servings: '',
    course: [], categories: [],
    prepHours: '', prepMinutes: '',
    cookHours: '', cookMinutes: '',
    ingredients: '', directions: '', notes: '',
    isFavorite: false,
    nutrition: {
      calories: '', fat: '', saturatedFat: '', cholesterol: '',
      sodium: '', carbs: '', fiber: '', sugar: '', protein: ''
    },
    image: null,
    imageUrl: '',
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [courseOptions, setCourseOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [newCourse, setNewCourse] = useState('');
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    const loadMeta = async () => {
      const { courses, categories } = await getMetaTags();
      setCourseOptions(courses);
      setCategoryOptions(categories);
    };

    const loadRecipe = async () => {
      if (isEdit) {
        const ref = doc(db, 'recipes', id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setForm({
            ...data,
            prepHours: data.prepTime?.includes('hr') ? data.prepTime.split(' ')[0] : '',
            prepMinutes: data.prepTime?.includes('min') ? data.prepTime.split(' ')[0] : '',
            cookHours: data.cookTime?.includes('hr') ? data.cookTime.split(' ')[0] : '',
            cookMinutes: data.cookTime?.includes('min') ? data.cookTime.split(' ')[0] : '',
            image: null
          });
          if (data.imageUrl) setImagePreview(data.imageUrl);
        }
      }
    };

    loadMeta();
    loadRecipe();
  }, [id, isEdit]);

  const toggle = (tab) => setActiveTab(tab);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setForm(prev => ({ ...prev, [name]: val }));
  };

  const handleNutritionChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, nutrition: { ...prev.nutrition, [name]: value } }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addCourse = async () => {
    if (newCourse && !courseOptions.includes(newCourse)) {
      await addMetaTag('courses', newCourse);
      setCourseOptions(prev => [...prev, newCourse]);
      setNewCourse('');
    }
  };

  const addCategory = async () => {
    if (newCategory && !categoryOptions.includes(newCategory)) {
      await addMetaTag('categories', newCategory);
      setCategoryOptions(prev => [...prev, newCategory]);
      setNewCategory('');
    }
  };

  const handleSubmit = async () => {
    try {
      let imageUrl = form.imageUrl || '';
      if (form.image) imageUrl = await uploadImage(form.image);

      const prepTime = form.prepHours
        ? `${form.prepHours} hr`
        : form.prepMinutes ? `${form.prepMinutes} min` : '';
      const cookTime = form.cookHours
        ? `${form.cookHours} hr`
        : form.cookMinutes ? `${form.cookMinutes} min` : '';

      const recipeData = {
        ...form,
        prepTime,
        cookTime,
        imageUrl,
        createdAt: form.createdAt || new Date(),
      };

      if (isEdit) {
        const ref = doc(db, 'recipes', id);
        await updateDoc(ref, recipeData);
      } else {
        await addRecipe(recipeData);
      }

      alert(`Recipe ${isEdit ? 'updated' : 'saved'}!`);
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('Failed to save recipe.');
    }
  };

  const minuteOptions = Array.from({ length: 12 }, (_, i) => (i + 1) * 5);
  const hourOptions = Array.from({ length: 6 }, (_, i) => i + 1);

  return (
    <Container className="py-4">
      <Row className="mb-2">
        <Col>
          <Button color="secondary" onClick={() => navigate('/')}> <FaArrowLeft className="me-2" /> Back to Home </Button>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col><h3>{isEdit ? 'Edit' : 'Add'} Recipe</h3></Col>
        <Col className="text-end">
          <Button color="primary" className="me-2" onClick={handleSubmit}>Save Recipe</Button>
          <Button color="outline-secondary" onClick={() => navigate('/')}>Cancel</Button>
        </Col>
      </Row>

      <Nav tabs className="mb-3">
        {['overview', 'ingredients', 'directions', 'notes', 'nutrition', 'photos'].map(tab => (
          <NavItem key={tab}>
            <NavLink
              className={classnames({ active: activeTab === tab })}
              onClick={() => toggle(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </NavLink>
          </NavItem>
        ))}
      </Nav>

      <TabContent activeTab={activeTab}>
        <TabPane tabId="overview">
          <FormGroup>
            <Label>Name</Label>
            <Input name="name" value={form.name} onChange={handleChange} />
          </FormGroup>
          <FormGroup>
            <Label>Source</Label>
            <Input name="source" value={form.source} onChange={handleChange} />
          </FormGroup>
          <FormGroup>
            <Label>Servings</Label>
            <Input name="servings" value={form.servings} onChange={handleChange} />
          </FormGroup>
          <FormGroup>
            <Label>Prep Time</Label>
            <Row>
              <Col>
                <Input type="select" name="prepMinutes" value={form.prepMinutes} onChange={handleChange}>
                  <option value="">-- Minutes --</option>
                  {minuteOptions.map(min => <option key={min} value={min}>{min} min</option>)}
                </Input>
              </Col>
              <Col>
                <Input type="select" name="prepHours" value={form.prepHours} onChange={handleChange}>
                  <option value="">-- Hours --</option>
                  {hourOptions.map(hr => <option key={hr} value={hr}>{hr} hr</option>)}
                </Input>
              </Col>
            </Row>
          </FormGroup>
          <FormGroup>
            <Label>Cook Time</Label>
            <Row>
              <Col>
                <Input type="select" name="cookMinutes" value={form.cookMinutes} onChange={handleChange}>
                  <option value="">-- Minutes --</option>
                  {minuteOptions.map(min => <option key={min} value={min}>{min} min</option>)}
                </Input>
              </Col>
              <Col>
                <Input type="select" name="cookHours" value={form.cookHours} onChange={handleChange}>
                  <option value="">-- Hours --</option>
                  {hourOptions.map(hr => <option key={hr} value={hr}>{hr} hr</option>)}
                </Input>
              </Col>
            </Row>
          </FormGroup>
          <FormGroup>
            <Label>Notes</Label>
            <Input type="textarea" name="notes" value={form.notes} onChange={handleChange} />
          </FormGroup>
          <FormGroup>
            <Label>Course</Label>
            <Select
              isMulti
              name="course"
              options={courseOptions.map(c => ({ label: c, value: c }))}
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
              options={categoryOptions.map(c => ({ label: c, value: c }))}
              value={form.categories.map(c => ({ label: c, value: c }))}
              onChange={(selected) => setForm(prev => ({ ...prev, categories: selected.map(s => s.value) }))}
              classNamePrefix="select"
            />
            <Input className="mt-2" placeholder="Add new category" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
            <Button size="sm" className="mt-1" onClick={addCategory}>Add Category</Button>
          </FormGroup>
          <FormGroup check>
            <Label check>
              <Input type="checkbox" name="isFavorite" checked={form.isFavorite} onChange={handleChange} />{' '}
              Mark as Favorite
            </Label>
          </FormGroup>
        </TabPane>

        <TabPane tabId="ingredients">
          <FormGroup>
            <Label>Ingredients</Label>
            <Input type="textarea" name="ingredients" value={form.ingredients} onChange={handleChange} rows="10" />
          </FormGroup>
        </TabPane>

        <TabPane tabId="directions">
          <FormGroup>
            <Label>Directions</Label>
            <Input type="textarea" name="directions" value={form.directions} onChange={handleChange} rows="10" />
          </FormGroup>
        </TabPane>

        <TabPane tabId="notes">
          <FormGroup>
            <Label>Additional Notes</Label>
            <Input type="textarea" name="notes" value={form.notes} onChange={handleChange} rows="5" />
          </FormGroup>
        </TabPane>

        <TabPane tabId="nutrition">
          {Object.entries(form.nutrition).map(([key, val]) => (
            <FormGroup key={key}>
              <Label>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
              <Input name={key} value={val} onChange={handleNutritionChange} />
            </FormGroup>
          ))}
        </TabPane>

        <TabPane tabId="photos">
          <FormGroup>
            <Label>Upload Photo</Label>
            <Input type="file" onChange={handleImageChange} accept="image/*" />
            {imagePreview && <img src={imagePreview} alt="Preview" className="img-fluid mt-2 rounded" style={{ maxHeight: '200px' }} />}
          </FormGroup>
        </TabPane>
      </TabContent>
    </Container>
  );
};

export default RecipeForm;