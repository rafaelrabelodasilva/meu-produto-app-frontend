import Constants from 'expo-constants';

// Detecta o IP da máquina de desenvolvimento automaticamente para funcionar em Celular Físico e Emulador
const debuggerHost = Constants.expoConfig?.hostUri;
const localhost = debuggerHost?.split(':').shift();

const API_URL = localhost 
  ? `http://${localhost}:3000` 
  : 'http://localhost:3000';

console.log('API_URL configurada para:', API_URL);

export async function apiFetch(endpoint: string, options: RequestInit = {}, token?: string | null) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log(`Fazendo fetch em: ${API_URL}${endpoint}`);
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro na resposta da API:', data);
      throw new Error(data.message || 'Erro na requisição');
    }

    return data;
  } catch (error) {
    console.error('Falha catastrófica no fetch:', error);
    throw error;
  }
}

export const authApi = {
  register: (userData: any) => apiFetch('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  login: (credentials: any) => apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  getMe: (token: string) => apiFetch('/auth/me', {}, token),
  forgotPassword: (email: string) => apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  resetPassword: (data: any) => apiFetch('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

export const userApi = {
  deleteAccount: (token: string, userId: string) => apiFetch(`/users/${userId}`, {
    method: 'DELETE',
  }, token),
};

export const productsApi = {
  list: (token: string) => apiFetch('/products', {}, token),
  create: (token: string, productData: any) => apiFetch('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  }, token),
  get: (token: string, id: string) => apiFetch(`/products/${id}`, {}, token),
  update: (token: string, id: string, productData: any) => apiFetch(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(productData),
  }, token),
  delete: (token: string, id: string) => apiFetch(`/products/${id}`, {
    method: 'DELETE',
  }, token),
};
