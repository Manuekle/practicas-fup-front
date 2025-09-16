<script setup>
import Layout from "../../layouts/auth";

import { ref, computed } from "vue";
import { required, helpers, minLength } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { isAxiosError } from "axios";
import { useRoute } from "vue-router";

import router from "@/router";
import apiClient from "@/utils/apiClient";
import { toastError, toastSuccess } from "@/utils/alert";
import { RECUPERAR_CONTRASENA_URL } from "@/constants/urls";

const route = useRoute();
const isResetError = ref(false);
const form = ref({
  new_password: "",
  re_new_password: "",
});
const loading = ref(false);
const uid = route.params.uid
const token = route.params.token

const passwordRules = {
  required: helpers.withMessage("La contraseña es obligatoria", required),
  minLength: helpers.withMessage(
    "Debe tener al menos 8 caracteres",
    minLength(8)
  ),
  hasNumber: helpers.withMessage("Debe contener al menos un número", (val) =>
    /\d/.test(val)
  ),
  hasUppercase: helpers.withMessage(
    "Debe contener al menos una mayúscula",
    (val) => /[A-Z]/.test(val)
  ),
  hasLowercase: helpers.withMessage(
    "Debe contener al menos una minúscula",
    (val) => /[a-z]/.test(val)
  ),
  hasSpecialChar: helpers.withMessage(
    "Debe contener un carácter especial",
    (val) => /[\W_]/.test(val)
  ),
};

const password = computed(() => form.value.new_password || "");
const passwordRequirements = computed(() => ({
  length: password.value.length >= 8,
  number: /\d/.test(password.value),
  uppercase: /[A-Z]/.test(password.value),
  lowercase: /[a-z]/.test(password.value),
  special: /[\W_]/.test(password.value),
}));
const cumpleConTodo = computed(() =>
  Object.values(passwordRequirements.value).every(Boolean)
);

const reglas = computed(() => ({
  new_password: passwordRules,
  re_new_password: {
    required: helpers.withMessage("Confirma la nueva contraseña", required),
    sameAs: helpers.withMessage(
      "Las contraseñas no coinciden",
      (val) => val === form.value.new_password
    ),
  },
}));
const v$ = useVuelidate(reglas, form);


const getErrorMessage = (error) => {
  const data = error?.response?.data;

  const posiblesCampos = ["new_password", "re_new_password", "token"];

  if (data && typeof data === "object") {
    for (const campo of posiblesCampos) {
      const valor = data[campo];

      if (typeof valor === "string") {
        return valor;
      }

      if (Array.isArray(valor) && valor.length > 0) {
        return valor.join(", ");
      }

      if (typeof valor === "object" && valor !== null) {
        const nestedString = Object.values(valor).find(
          (v) => typeof v === "string"
        );
        if (nestedString) return nestedString;
      }
    }
  }

  return "Ocurrió un error inesperado.";
};

const tryToReset = async () => {
  loading.value = true
  try {
    await apiClient.post(RECUPERAR_CONTRASENA_URL, {
      ...form.value,
      uid,
      token
    })
    router.push('/login')
    toastSuccess("Contraseña actualizada")
  } catch (error) {
    if (isAxiosError(error)) {
      toastError(getErrorMessage(error));
    } else {
      toastError("Error desconocido intenta más tarde");
    }
  }finally{
    loading.value = false
  }
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
            <div class="p-2">
              <BAlert
                v-model="isResetError"
                class="mb-4"
                variant="danger"
                dismissible
                >{{ error }}</BAlert
              >
              <BForm class="p-2" @submit.prevent="tryToReset">
                <BFormGroup
                  class="mb-2"
                  label="Nueva contraseña *"
                  label-for="new-password"
                >
                  <BFormInput
                    id="new-password"
                    type="password"
                    v-model="form.new_password"
                    :class="{ 'is-invalid': v$.new_password.$error }"
                    :disabled="loading"
                  />
                  <div
                    v-for="(item, index) in v$.new_password.$errors"
                    :key="index"
                    class="invalid-feedback"
                  >
                    {{ item.$message }}
                  </div>
                  <ul class="list-unstyled small mt-2">
                    <li>
                      <i
                        :class="
                          passwordRequirements.length
                            ? 'text-success mdi mdi-check-circle'
                            : 'text-danger mdi mdi-close-circle'
                        "
                      ></i>
                      Mínimo 8 caracteres
                    </li>
                    <li>
                      <i
                        :class="
                          passwordRequirements.uppercase
                            ? 'text-success mdi mdi-check-circle'
                            : 'text-danger mdi mdi-close-circle'
                        "
                      ></i>
                      Al menos una mayúscula
                    </li>
                    <li>
                      <i
                        :class="
                          passwordRequirements.lowercase
                            ? 'text-success mdi mdi-check-circle'
                            : 'text-danger mdi mdi-close-circle'
                        "
                      ></i>
                      Al menos una minúscula
                    </li>
                    <li>
                      <i
                        :class="
                          passwordRequirements.number
                            ? 'text-success mdi mdi-check-circle'
                            : 'text-danger mdi mdi-close-circle'
                        "
                      ></i>
                      Al menos un número
                    </li>
                    <li>
                      <i
                        :class="
                          passwordRequirements.special
                            ? 'text-success mdi mdi-check-circle'
                            : 'text-danger mdi mdi-close-circle'
                        "
                      ></i>
                      Al menos un carácter especial
                    </li>
                  </ul>
                </BFormGroup>

                <BFormGroup
                  class="mb-2"
                  label="Confirmar nueva contraseña *"
                  label-for="re-new-password"
                >
                  <BFormInput
                    id="re-new-password"
                    type="password"
                    v-model="form.re_new_password"
                    :class="{ 'is-invalid': v$.re_new_password.$error }"
                    @blur="v$.re_new_password.$touch()"
                    :disabled="loading"
                  />
                  <div
                    v-for="(item, index) in v$.re_new_password.$errors"
                    :key="index"
                    class="invalid-feedback"
                  >
                    {{ item.$message }}
                  </div>
                </BFormGroup>

                <BButton
                  type="submit"
                  :disabled="loading || v$.$invalid || !cumpleConTodo"
                >
                  <BSpinner v-if="loading" small />
                  <span v-else>Cambiar contraseña</span>
                </BButton>
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
