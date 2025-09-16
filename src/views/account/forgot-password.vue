<script>
import Layout from "../../layouts/auth";

import { required, email, helpers } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";

import apiClient from "@/utils/apiClient";
import { SOLICITAR_RECUPERAR_CONTRASENA } from "@/constants/urls";
import { toastError } from "@/utils/alert";

export default {
  setup() {
    return { v$: useVuelidate() };
  },
  validations: {
    email: {
      required: helpers.withMessage("Email is required", required),
      email: helpers.withMessage("Please enter valid email", email),
    },
  },
  components: {
    Layout,
  },
  data() {
    return {
      email: null,
      submitted: false,
      tryingToReset: false,
      loading: false,
      response: false,
    };
  },
  methods: {
    async tryToReset() {
      this.submitted = true;
      this.v$.$touch();

      if (this.v$.$invalid) {
        return;
      }

      try {
        this.loading = true;
        await apiClient.post(SOLICITAR_RECUPERAR_CONTRASENA, {
          email: this.email,
        });
        this.response = true
        this.email = null
        this.v$.$reset()
        this.submitted = false
      } catch (error) {
        toastError("Error solicitando el cambio de contraseña");
      } finally {
        this.loading = false;
      }
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
                  <h5 class="text-primary">Restablecer contraseña</h5>
                  <p>Restablecimiento de acceso Portal FUP</p>
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
            <div class="row">
              <div class="col-lg-12">
                <div class="card border border-primary">
                  <div class="card-body" style="text-align: justify">
                    <p class="card-text">
                      La contraseña sólo podrá ser enviada si el correo
                      diligenciado en el formulario conincide con el
                      proporcionado para contactabilidad.
                    </p>
                    <p>
                      En caso de necesitar el cambio de correo, favor
                      comunicarse al correo
                      <a href="mailto:soporte.sires@fup.edu.co"
                        >soporte.sires@fup.edu.co</a
                      >
                      especificando la solicitud.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="p-2">
              <BAlert
                v-model="response"
                class="mb-4"
                variant="info"
                dismissible
              >
                Hemos recibido tu solicitud para cambiar la contraseña. A tu
                correo llegará un mensaje con los pasos a seguir para completar
                el proceso.
              </BAlert>
              <BForm @submit.prevent="tryToReset">
                <div class="mb-3">
                  <label for="useremail">Correo electrónico</label>
                  <input
                    type="email"
                    v-model="email"
                    class="form-control"
                    id="useremail"
                    placeholder="Ingresa tu correo electrónico"
                    :class="{ 'is-invalid': submitted && v$.email.$errors }"
                  />
                  <div
                    v-for="(item, index) in v$.email.$errors"
                    :key="index"
                    class="invalid-feedback"
                  >
                    <span v-if="item.$message">{{ item.$message }}</span>
                  </div>
                </div>
                <BRow class="mb-3 mb-0">
                  <BCol cols="12" class="text-end">
                    <BButton variant="primary" class="w-md" type="submit" :disabled="loading || v$.$invalid">
                      <BSpinner v-if="loading" small />
                      <span v-else>Recuperar</span>
                    </BButton>
                  </BCol>
                </BRow>
              </BForm>
            </div>
          </BCardBody>
        </BCard>

        <div class="mt-5 text-center">
          <p>
            ¿Lo has recordado?
            <router-link to="/login" class="fw-medium text-primary"
              >Ingresa aquí</router-link
            >
          </p>
          <p>© Fundación Universitaria de Popayán</p>
        </div>
      </BCol>
    </BRow>
  </Layout>
</template>

<style lang="scss" module></style>
