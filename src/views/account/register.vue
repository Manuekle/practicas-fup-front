<script setup>
import Layout from "../../layouts/auth";

import { required, minLength, helpers } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { ref, computed } from "vue";
import { isAxiosError } from "axios";

import router from "@/router";
import apiClient from "@/utils/apiClient"
import { VALIDAR_NUMERO_DOCUMENTO, REGISTRARSE} from "@/constants/urls"
import { toastError, toastSuccess } from "@/utils/alert";

const user = ref({
  documentNumber: "",
});

const form = ref({
  new_password: null,
  re_new_password: null,
});

const loading = ref(false);
const submitted = ref(false);
const pasoActual = ref("validar");
const registerSuccess = ref(false);
const isRegisterError = ref(false);
const regError = ref("");
const showModal = ref(false);

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

const reglasRegister = computed(() => ({
    new_password: passwordRules,
    re_new_password: {
      required: helpers.withMessage("Confirma la nueva contraseña", required),
      sameAs: helpers.withMessage(
        "Las contraseñas no coinciden",
        (val) => val === form.value.new_password
      ),
    },
}));

const reglas = computed( ( ) => ({
  documentNumber: {
    required: helpers.withMessage("Número de documento requerido", required),
  },
}))

const v$ = useVuelidate(reglas, user);
const vr$ = useVuelidate(reglasRegister, form)

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  const posiblesCampos = ["new_password", "detail", "document_number"];

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

const validateInfo = async () => {
  loading.value = true
  submitted.value = true;
  v$.value.$touch();
  if (v$.value.$invalid) return;

  try {
    await apiClient.post(VALIDAR_NUMERO_DOCUMENTO, {
      document_number: user.value.documentNumber,
    });

    pasoActual.value = "register";
    v$.value.$reset();
  } catch (error) {
    if (isAxiosError(error)) {
      toastError(getErrorMessage(error));
    } else {
      toastError("Error desconocido intenta más tarde");
    }
  }
  finally{
    loading.value = false
  }
};

const register = async () => {
  vr$.value.$touch();
  if (vr$.value.$invalid || !cumpleConTodo.value) return;

  loading.value = true;
  try {
    await apiClient.post(REGISTRARSE, {
      document_number: user.value.documentNumber,
      password: form.value.new_password,
    });
    toastSuccess('Usuario registrado correctamente')
    router.push('/login')
  } catch (error) {
    if (isAxiosError(error)) {
      toastError(getErrorMessage(error));
    } else {
      toastError("Error desconocido intenta más tarde");
    }
  } finally {
    loading.value = false;
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
              <BCol cols=7>
                <div class="text-primary p-4">
                  <h5 class="text-primary">Crear cuenta SIRES</h5>
                  <p>Esta cuenta servirá para el acceso al portal.</p>
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
              v-model="registerSuccess"
              class="mt-3"
              variant="success"
              dismissible
            >
              Contraseña cambiada con éxito.
            </BAlert>

            <BAlert
              v-model="isRegisterError"
              class="mt-3"
              variant="danger"
              dismissible
            >
              {{ regError }}
            </BAlert>

            <BForm
              class="p-2"
              v-if="pasoActual === 'validar'"
              @submit.prevent="validateInfo"
            >
              <BFormGroup
                label="Número de identificación *"
                label-for="documentNumber"
              >
                <BFormInput
                  id="documentNumber"
                  v-model="user.documentNumber"
                  placeholder="Ingrese su número de identificación"
                  :class="{
                    'is-invalid': submitted && v$.documentNumber.$error,
                  }"
                />
                <div
                  class="invalid-feedback"
                  v-if="submitted && v$.documentNumber.$error"
                >
                  {{ v$.documentNumber.$errors[0].$message }}
                </div>
              </BFormGroup>

              <div class="mt-4 d-grid">
                <BButton 
                  type="submit" 
                  variant="primary" 
                  class="btn-block"
                  :disabled="loading || v$.$invalid"
                >
                <BSpinner v-if="loading" small />
                <span v-else>Validar</span>
                </BButton>
              </div>
            </BForm>

            <BForm class="p-2" v-else @submit.prevent="register">
              <BFormGroup
                class="mb-2"
                label="Número de documento"
              >
                <BFormInput v-model="user.documentNumber" :disabled="true"/>
              </BFormGroup>
              <BFormGroup class="mb-2" label="Nueva contraseña *" label-for="new-password">
                <BFormInput
                  id="new-password"
                  type="password"
                  v-model="form.new_password"
                  :class="{ 'is-invalid': vr$.new_password.$error }"
                  :disabled="loading"
                />
                <div
                  v-for="(item, index) in vr$.new_password.$errors"
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
                  :class="{ 'is-invalid': vr$.re_new_password.$error }"
                  :disabled="loading"
                  @blur="vr$.re_new_password.$touch()"
                />
                <div
                  v-for="(item, index) in vr$.re_new_password.$errors"
                  :key="index"
                  class="invalid-feedback"
                >
                  {{ item.$message }}
                </div>
              </BFormGroup>
              <div class="mt-4 d-grid">
                <BButton
                  type="submit"
                  :disabled="loading || vr$.$invalid || !cumpleConTodo"
                  class="btn-block"
                  variant="primary"
                >
                  <BSpinner v-if="loading" small />
                  <span v-else>Registrarse</span>
                </BButton>
              </div>
            </BForm>

            <div class="mt-4 text-center">
              <p class="mb-0">
                Al regístrarse acepta el
                <BLink @click="showModal = true" class="text-primary">
                  tratamiento de datos
                </BLink>
              </p>
            </div>
          </BCardBody>
        </BCard>

        <div class="mt-5 text-center">
          <p>
            ¿Ya tienes una cuenta?
            <router-link to="/login" class="fw-medium text-primary"
              >ingresa</router-link
            >
          </p>
          <p>© Fundación Universitaria de Popayán</p>
        </div>
      </BCol>
    </BRow>

    <BModal
      v-model="showModal"
      title="Tratamiento de datos"
      centered
      hide-footer
    >
      <p class="modal-text text-justify">
        Autorizo de manera expresa y conciente a la Fundaciòn Universitaria de
        Popayán para solicitar la presente información con fines tales como
        divilgar, comunicar, distribuir, organizar y convocar eventos, enviar
        correos electrónicos, físicos online con información, productos y
        servicios educativos ofrecidos, así como tambien, autorizo la edición,
        publicación y divulgación de imágenes, tanto de forma individual o de
        grupo en las que pueda aparecer, incorporadas en las actividades
        institucionales. Dicha autorización ajustada a las Normas de Derecho de
        Habeas Data, en virtud de la ley 1581 de 2012 y el decreto reglamentario
        1377 de 2013. Tal administración de datos serán utilizados para
        facilitar mi proceso de ingreso a la institución. Así mismo doy fé de
        que la información aquí consignada ha sido suministrada directamente por
        mí.
      </p>
    </BModal>
  </Layout>
</template>

<style scoped>
.modal-text {
  text-align: justify;
}
</style>
