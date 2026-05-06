import Constants from 'expo-constants';
import { storage } from '../utils/storage';
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

// Prioriza a URL de produção definida em variável de ambiente (EAS Build)
// Caso contrário, tenta o IP local (Dev) ou localhost
const rawUrl = process.env.EXPO_PUBLIC_API_URL || (localhost 
  ? `http://${localhost}:3000` 
  : 'http://localhost:3000');

// Remove barra final se existir para evitar erro de "//" nas rotas
export const API_URL = rawUrl.replace(/\/$/, '');

export const getImageUrl = (url: string | undefined) => {
  if (!url) return null;
  
  // Se a URL já for absoluta (começa com http), retorna ela mesma
  if (url.startsWith('http')) return url;
  
  // Se por algum motivo a URL já contiver o domínio do Supabase mas sem o protocolo (raro, mas possível)
  if (url.includes('supabase.co')) return `https://${url}`;

  // Caso contrário, usa o padrão antigo de uploads locais
  return `${API_URL}/uploads/${url}${url.includes('?') ? '' : `?t=${new Date().getTime()}`}`;
};

console.log('API_URL configurada para:', API_URL);

export async function apiFetch(endpoint: string, options: RequestInit = {}, token?: string | null) {
  const isFormData = options.body instanceof FormData || 
    (options.body && typeof options.body === 'object' && options.body.constructor.name === 'FormData');
  
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };

  const currentToken = token || (await storage.getItem(TOKEN_KEY));

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
      const refreshToken = await storage.getItem(REFRESH_TOKEN_KEY);
      
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
            await storage.setItem(TOKEN_KEY, newAccessToken);
            
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
            await storage.deleteItem(TOKEN_KEY);
            await storage.deleteItem(REFRESH_TOKEN_KEY);
            DeviceEventEmitter.emit(AUTH_EVENTS.TOKEN_CLEARED);
          }
        } catch (refreshErr) {
          console.error('Erro durante tentativa de refresh:', refreshErr);
        }
      } else {
        DeviceEventEmitter.emit(AUTH_EVENTS.TOKEN_CLEARED);
      }
    }

    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      console.error(`Erro na API (${response.status}):`, data);
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
  list: (params?: any, token?: string | null) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiFetch(`/products${query}`, {}, token);
  },
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
  update: (id: string, data: { name: string }, token?: string | null) => apiFetch(`/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }, token),
  delete: (id: string, token?: string | null) => apiFetch(`/categories/${id}`, {
    method: 'DELETE',
  }, token),
};
