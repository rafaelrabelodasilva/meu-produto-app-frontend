import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { DeviceEventEmitter } from 'react-native';

const TOKEN_KEY = 'user_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const AUTH_EVENTS = {
  TOKEN_REFRESHED: 'auth:token_refreshed',
  TOKEN_CLEARED: 'auth:token_cleared',
};

// Detecta o IP da máquina de desenvolvimento automaticamente para funcionar em Celular Físico e Emulador
const debuggerHost = Constants.expoConfig?.hostUri;
const localhost = debuggerHost?.split(':').shift();

export const API_URL = localhost 
  ? `http://${localhost}:3000` 
  : 'http://localhost:3000';

export const getImageUrl = (url: string | undefined) => 
  url ? `${API_URL}/uploads/${url}?t=${new Date().getTime()}` : null;

console.log('API_URL configurada para:', API_URL);

export async function apiFetch(endpoint: string, options: RequestInit = {}, token?: string | null) {
  const isFormData = options.body instanceof FormData;
  
  const headers: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  const currentToken = token || (await SecureStore.getItemAsync(TOKEN_KEY));

  if (currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`;
  }

  console.log(`Fazendo fetch em: ${API_URL}${endpoint}`);
  
  try {
    let response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Se der 401 Unauthorized e não for uma rota de auth básica, tentamos o refresh
    if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
      console.log('Token expirado (401), tentando refresh...');
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            const newAccessToken = refreshData.access_token;
            
            console.log('Token renovado com sucesso!');
            await SecureStore.setItemAsync(TOKEN_KEY, newAccessToken);
            
            // Notifica o AuthContext sobre o novo token
            DeviceEventEmitter.emit(AUTH_EVENTS.TOKEN_REFRESHED, newAccessToken);
            
            // Refaz a requisição original com o novo token
            headers['Authorization'] = `Bearer ${newAccessToken}`;
            response = await fetch(`${API_URL}${endpoint}`, {
              ...options,
              headers,
            });
          } else {
            console.warn('Falha ao renovar token com refresh token.');
            // Se o refresh falhar, limpamos os tokens para forçar logout no app
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
            DeviceEventEmitter.emit(AUTH_EVENTS.TOKEN_CLEARED);
          }
        } catch (refreshErr) {
          console.error('Erro durante tentativa de refresh:', refreshErr);
        }
      } else {
        // Se nem tem refresh token, limpa tudo e desloga
        DeviceEventEmitter.emit(AUTH_EVENTS.TOKEN_CLEARED);
      }
    }

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro na resposta da API:', data);
      throw new Error(data.message || 'Erro na requisição');
    }

    return data;
  } catch (error) {
    console.error('Falha no fetch:', error);
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
  refresh: (refreshToken: string) => apiFetch('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  }),
  getMe: (token?: string | null) => apiFetch('/auth/me', {}, token),
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
  update: (userId: string, data: any) => apiFetch(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteAccount: (userId: string, token?: string | null) => apiFetch(`/users/${userId}`, {
    method: 'DELETE',
  }, token),
};

export const productsApi = {
  list: (token?: string | null) => apiFetch('/products', {}, token),
  create: (productData: any, token?: string | null) => apiFetch('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  }, token),
  get: (id: string, token?: string | null) => apiFetch(`/products/${id}`, {}, token),
  update: (id: string, productData: any, token?: string | null) => apiFetch(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(productData),
  }, token),
  delete: (id: string, token?: string | null) => apiFetch(`/products/${id}`, {
    method: 'DELETE',
  }, token),
  uploadImage: (productId: string, formData: FormData) => apiFetch(`/products/${productId}/images`, {
    method: 'POST',
    body: formData,
  }),
  updateImage: (productId: string, imageId: string, formData: FormData) => apiFetch(`/products/${productId}/images/${imageId}`, {
    method: 'PATCH',
    body: formData,
  }),
};

export const categoriesApi = {
  list: (token?: string | null) => apiFetch('/categories', {}, token),
  create: (data: { name: string }, token?: string | null) => apiFetch('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token),
};
