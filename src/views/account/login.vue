<script>
import Layout from "../../layouts/auth";

import { required, email, helpers } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { showError } from "@/utils/alert";
// import router from '../../router/index'

import { useAuthStore, useNotificationStore } from "@/state/pinia";
const auth = useAuthStore();
const notificationStore = useNotificationStore();

/**
 * Login component
 */
export default {
  setup() {
    return { v$: useVuelidate() };
  },

  components: {
    Layout,
  },
  data() {
    return {
      email: null,
      password: null,
      submitted: false,
      authError: null,
      tryingToLogIn: false,
      isAuthError: false,
      isPasswordVisible: false,
      loading: false,
    };
  },
  validations: {
    email: {
      required: helpers.withMessage("Email is required", required),
      email: helpers.withMessage("Please enter valid email", email),
    },
    password: {
      required: helpers.withMessage("Password is required", required),
    },
  },
  computed: {
    notification() {
      return notificationStore || {};
    },
  },
  methods: {
    // Try to log the user in with the username
    // and password they provided.
    async tryToLogIn() {
      this.loading = true;
      this.submitted = true;
      // stop here if form is invalid
      this.v$.$touch();

      if (this.v$.$invalid) {
        this.loading = false
        return;
      }
      try {
        await auth.login({
          email: this.email,
          password: this.password,
        });
      } catch (error) {
        this.loading = false;
        showError("Inicio de sesión.", "Usuario o contraseña incorrectos");
      }
    },
    togglePasswordVisibility() {
      this.isPasswordVisible = !this.isPasswordVisible;
    },
  },
};
</script>

<template>
  <Layout>
    <BRow class="justify-content-center">
      <BCol md="8" lg="6" xl="5">
        <BCard no-body class="overflow-hidden">
          <div class="bg-primary-subtle">
            <BRow>
              <BCol cols="7">
                <div class="text-primary p-4">
                  <h5 class="text-primary">Portal Estudiantes</h5>
                  <p>Inicia sesión para ingresar a SIRES</p>
                </div>
              </BCol>
              <BCol cols="5" class="align-self-end">
                <img
                  src="@/assets/images/profile-img.png"
                  alt
                  class="img-fluid"
                />
              </BCol>
            </BRow>
          </div>
          <BCardBody class="pt-0">
            <div>
              <router-link to="/">
                <div class="avatar-md profile-user-wid mb-4">
                  <span class="avatar-title rounded-circle bg-light">
                    <img src="@/assets/images/logoFup.svg" alt height="70" />
                  </span>
                </div>
              </router-link>
            </div>
            <BAlert
              v-model="isAuthError"
              variant="danger"
              class="mt-3"
              dismissible
              >{{ authError }}</BAlert
            >
            <div
              v-if="notification.message"
              :class="'alert ' + notification.type"
            >
              {{ notification.message }}
            </div>

            <BForm class="p-2" @submit.prevent="tryToLogIn">
              <BFormGroup
                class="mb-3"
                id="input-group-1"
                label="Correo electrónico"
                label-for="input-1"
              >
                <BFormInput
                  id="input-1"
                  v-model="email"
                  type="text"
                  placeholder="ingrese su correo electrónico"
                  :class="{
                    'is-invalid': submitted && v$.email.$error,
                  }"
                  :disabled="loading"
                  autofocus
                ></BFormInput>
                <div
                  v-for="(item, index) in v$.email.$errors"
                  :key="index"
                  class="invalid-feedback"
                >
                  <span v-if="item.$message">{{ item.$message }}</span>
                </div>
              </BFormGroup>

              <BFormGroup
                class="mb-3"
                id="input-group-2"
                label="Contraseña"
                label-for="input-2"
              >
                <BInputGroup class="mt-3">
                  <BFormInput
                    id="input-2"
                    v-model="password"
                    :type="isPasswordVisible ? 'text' : 'password'"
                    placeholder="Ingrese su contraseña"
                    :class="{
                      'is-invalid': submitted && v$.password.$error,
                    }"
                    :disabled="loading"
                  >
                  </BFormInput>
                  <BButton variant="primary" @click="togglePasswordVisibility">
                    <span
                      :class="
                        isPasswordVisible
                          ? 'icon fa fa-eye'
                          : 'icon fa fa-eye-slash'
                      "
                    ></span>
                  </BButton>
                </BInputGroup>
                <div
                  v-if="submitted && v$.password.$error"
                  class="invalid-feedback"
                >
                  <span v-if="v$.password.required.$message">{{
                    v$.password.required.$message
                  }}</span>
                </div>
              </BFormGroup>
              <div class="mt-3 d-grid">
                <BButton
                  type="submit"
                  variant="primary"
                  class="btn-block"
                  :disabled="loading || v$.$invalid"
                >
                  <template v-if="loading">
                    <BSpinner small />
                  </template>
                  <template v-else> Ingresar </template>
                </BButton>
              </div>
              <div class="mt-4 text-center">
                <router-link to="/recuperar-contrasena" class="text-muted">
                  <i class="mdi mdi-lock me-1"></i> ¿Olvidó su contraseña?
                </router-link>
              </div>
            </BForm>
          </BCardBody>
        </BCard>
        <div class="mt-5 text-center">
          <p>
            ¿No tiene una cuenta?
            <router-link to="/registrarse" class="fw-medium text-primary">Regístrate ahora</router-link>
          </p>
          <p>© Fundación Universitaria de Popayán</p>
        </div>
      </BCol>
    </BRow>
  </Layout>
</template>