import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';

const META_DOC = 'meta/tags'; // Document path

export const getMetaTags = async () => {
  const ref = doc(db, 'meta', 'tags');
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return {
      courses: snap.data().courses || [],
      categories: snap.data().categories || [],
    };
  }

  // fallback if document doesn't exist
  await setDoc(ref, { courses: [], categories: [] });
  return { courses: [], categories: [] };
};

export const addMetaTag = async (field, value) => {
  const ref = doc(db, 'meta', 'tags');
  await updateDoc(ref, {
    [field]: arrayUnion(value)
  });
};