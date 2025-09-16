import { defineStore } from 'pinia';

import apiClient from '@/utils/apiClient';
import router from '../../router/index'
import { OBTENER_PERMISOS } from '@/constants/urls';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    permissions: JSON.parse(localStorage.getItem('permissions')) || []
  }),
  actions: {
    async login(credentials) {
      const response = await apiClient.post('/auth/login/', credentials);
      this.setToken(response.access);
      this.setUser(response.full_name);
      const permissions = await apiClient.get(OBTENER_PERMISOS)
      this.setPermissions(permissions.permissions)
      router.push('/')
    },
    setToken(token) {
      this.token = token;
      localStorage.setItem('token', token);
    },
    setUser(user) {
      this.user = user;
      localStorage.setItem('user', JSON.stringify(user));
    },
    setPermissions(permissions){
      this.permissions = permissions
      localStorage.setItem('permissions', JSON.stringify(permissions))
    },
    logout() {
      this.token = null;
      this.user = null;
      this.permissions = []
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('permissions')
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    loggedIn() {
      return !!this.token
    },
    hasPerm: (state) => (perm) => {
      return state.permissions.includes(perm)
    }
  }
});
