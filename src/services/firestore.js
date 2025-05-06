import { db } from './firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export const fetchRecipes = async () => {
  const snapshot = await getDocs(collection(db, 'recipes'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addRecipe = async (recipe) => {
  await addDoc(collection(db, 'recipes'), recipe);
};