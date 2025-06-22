 import axios from 'axios';

 const API = axios.create({
baseURL: process.env.REACT_APP_API_URL,
 });

// login 
export const loginUser = async (email, password) => {
  const response = await API.post('/auth/login', { email, password });
  return response.data;
};

//Register
export const registerUser = async (email, password) => {
  const response = await API.post('/auth/register', { email, password });
  return response.data;
};

// getAllRecipes
export const getAllRecipes = async () => {
  const response = await API.get('/recipes'); 
  return response.data;
};
// deleteRecipeById
export const deleteRecipeById = async (id, token) => {
  await API.delete(`/recipes/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
// updateRecipeById
export const updateRecipeById = async (id, formData, token) => {
  try {
    const res = await API.put(`/recipes/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (err) {
    console.error('Erreur modification recette:', err.response?.data || err.message);
    throw new Error('Erreur mise à jour recette');
  }
};
// addRecipe
export const addRecipe = async (formData, token) => {
  try {
    const res = await API.post('/recipes', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error) {
    console.error('Erreur ajout recette :', error.response?.data || error.message);
    throw new Error('Erreur ajout recette');
  }
};

export const getAllUsers = async (token) => {
  const res = await API.get('/auth', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteUserById = async (id, token) => {
  await API.delete(`/auth/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const promoteUserToAdmin = async (id, token) => {
  const res = await API.patch(`/auth/${id}/promote`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};



export const deleteAllRecipes = async (token) => {
  await API.delete('/recipes/all', {
    headers: { Authorization: `Bearer ${token}` },
  });
};




export const demoteAdminToUser = async (id, token) => {
  const res = await API.patch(`/auth/${id}/demote`, null, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

