import { initializeApp } from "firebase/app";
import { getStorage, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import fetch from "node-fetch";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_APIKEY,
  authDomain: process.env.FIREBASE_AUTHDOMAIN,
  projectId: process.env.FIREBASE_PROJECTID,
  storageBucket: process.env.FIREBASE_STORAGEBUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGINGSENDERID,
  appId: process.env.FIREBASE_APPID
};

export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

export const uploadImage = async (url) => {
    try {
        const imageBuffer = await fetchImage(url); 
        const fileName = `images/${Date.now()}_${Math.floor(Math.random() * 1000000)}.jpg`;
        const imageRef = ref(storage, fileName);
        await uploadBytes(imageRef, imageBuffer, { contentType: 'image/jpeg' });
        const imageUrl = await getDownloadURL(imageRef);
        return imageUrl; 
      } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Failed to upload image to Firebase Storage');
      }
}

const fetchImage = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
  
      const buffer = await response.buffer();
      return buffer;
    } catch (error) {
      console.error('Error fetching image:', error);
      throw new Error('Failed to fetch image from the URL');
    }
};