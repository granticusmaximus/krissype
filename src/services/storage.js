import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export const uploadImage = async (file) => {
  const filename = `${Date.now()}_${file.name}`;
  const imageRef = ref(storage, `recipe-images/${filename}`);
  await uploadBytes(imageRef, file);
  const url = await getDownloadURL(imageRef); // ✅ This is the only safe way to get a public URL
  return url;
};