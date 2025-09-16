<script setup>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import Skeleton from "@/components/widgets/skeleton";

import { ref, computed, onMounted } from "vue";

import { required, helpers, email, minLength } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { isAxiosError } from "axios";

import router from "@/router/index";
import apiClient from "@/utils/apiClient";
import { CREAR_USUARIO, LISTA_ROLES } from "@/constants/urls";
import { toastError, toastSuccess } from "@/utils/alert";

const loadingRoles = ref(false);
const roles = ref([]);
const loading = ref(false);
const form = ref({
  first_name: null,
  last_name: null,
  email: null,
  role: null,
  new_password: null,
  reTypePassword: null,
});
const currentPage = ref(1);

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

const roleOptions = computed(() => [
  { value: null, text: "Selecciona una opción" },
  ...roles.value.map((element) => ({
    value: element.id,
    text: element.name,
  })),
]);

const reglas = computed(() => ({
  first_name: {
    required: helpers.withMessage("Este campo es obligatorio", required),
  },
  last_name: {
    required: helpers.withMessage("Este campo es obligatorio", required),
  },
  email: {
    required: helpers.withMessage(
      "El correo electrónico es obligatorio",
      required
    ),
    email,
  },
  role: {
    required: helpers.withMessage("Este campo es obligatoria", required),
  },
  new_password: passwordRules,
  reTypePassword: {
    required: helpers.withMessage("Confirma la nueva contraseña", required),
    sameAs: helpers.withMessage(
      "Las contraseñas no coinciden",
      (val) => val === form.value.new_password
    ),
  },
}));

// Inicializar Vuelidate
const v$ = useVuelidate(reglas, form);

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  const posiblesCampos = [
    "message",
    "first_name",
    "last_name",
    "email",
    "role",
    "new_password"
  ];

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

const createUser = async () => {
  v$.value.$touch();

  if (v$.value.$invalid) return;
  loading.value = true;
  try {
    await apiClient.post(CREAR_USUARIO, {
      ...form.value,
    });
    toastSuccess("Usuario registrado correctamente");
    router.push({ name: "lista_usuarios" });
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

const getRoles = async () => {
  loadingRoles.value = true;
  try {
    const response = await apiClient.get(LISTA_ROLES, {
      page: currentPage.value,
      is_active: true,
    });
    roles.value = [...roles.value, ...response.results];
    if (response.next) {
      currentPage.value++;
      await getRoles();
    }
  } catch (error) {
    toastError(error.toString());
  } finally {
    loadingRoles.value = false;
  }
};

onMounted(() => {
  getRoles();
});
</script>

<template>
  <Layout>
    <PageHeader title="Crear Usuario" pageTitle="Usuarios" />
    <BCard>
      <BForm class="p-2" @submit.prevent="createUser">
        <BRow>
          <BCol sm="6" md="6">
            <BFormGroup
              class="mb-3"
              id="input-name"
              label="Nombres *"
              label-for="name"
            >
              <BFormInput
                id="name"
                v-model="form.first_name"
                type="text"
                placeholder="Ingresa los nombres del usuario"
                :disabled="loading"
                :class="{ 'is-invalid': v$.first_name.$error }"
                @blur="v$.first_name.$touch()"
              ></BFormInput>
              <div
                v-for="(item, index) in v$.first_name.$errors"
                :key="index"
                class="invalid-feedback"
              >
                <span v-if="item.$message">{{ item.$message }}</span>
              </div>
            </BFormGroup>
          </BCol>
          <BCol sm="6" md="6">
            <BFormGroup
              class="mb-3"
              id="input-phone"
              label="Apellidos *"
              label-for="last_name"
            >
              <BFormInput
                id="last_name"
                v-model="form.last_name"
                type="text"
                placeholder="ingrese el número de teléfono"
                :disabled="loading"
                :class="{ 'is-invalid': v$.last_name.$error }"
                @blur="v$.last_name.$touch()"
              ></BFormInput>
              <div
                v-for="(item, index) in v$.last_name.$errors"
                :key="index"
                class="invalid-feedback"
              >
                <span v-if="item.$message">{{ item.$message }}</span>
              </div>
            </BFormGroup>
          </BCol>
          <BCol sm="6" md="6">
            <BFormGroup
              class="mb-3"
              id="input-email"
              label="Correo electrónico *"
              label-for="email"
            >
              <BFormInput
                id="email"
                v-model="form.email"
                type="email"
                placeholder="ingrese el correo electrónico"
                :disabled="loading"
                :class="{ 'is-invalid': v$.email.$error }"
                @blur="v$.email.$touch()"
              ></BFormInput>
              <div
                v-for="(item, index) in v$.email.$errors"
                :key="index"
                class="invalid-feedback"
              >
                <span v-if="item.$message">{{ item.$message }}</span>
              </div>
            </BFormGroup>
          </BCol>
          <BCol sm="6" md="6">
            <BFormGroup
              class="mb-3"
              id="input-role"
              label="Rol *"
              label-for="role"
            >
              <skeleton v-if="loadingRoles"></skeleton>
              <BFormSelect
                v-else
                id="role"
                v-model="form.role"
                :options="roleOptions"
                :class="{ 'is-invalid': v$.role.$error }"
                @blur="v$.role.$touch()"
                :disabled="loading"
              />
              <div
                v-for="(item, index) in v$.role.$errors"
                :key="index"
                class="invalid-feedback"
              >
                <span v-if="item.$message">{{ item.$message }}</span>
              </div>
            </BFormGroup>
          </BCol>
          <BCol md="6" sm="12">
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
          </BCol>
          <BCol>
            <BFormGroup
              class="mb-2"
              label="Confirmar nueva contraseña *"
              label-for="re-new-password"
            >
              <BFormInput
                id="re-new-password"
                type="password"
                v-model="form.reTypePassword"
                :class="{ 'is-invalid': v$.reTypePassword.$error }"
                @blur="v$.reTypePassword.$touch()"
                :disabled="loading"
              />
              <div
                v-for="(item, index) in v$.reTypePassword.$errors"
                :key="index"
                class="invalid-feedback"
              >
                {{ item.$message }}
              </div>
            </BFormGroup>
          </BCol>
        </BRow>

        <BButton
          type="submit"
          :disabled="loading || v$.$invalid || !cumpleConTodo"
          variant="primary"
        >
          <BSpinner v-if="loading" small />
          <span v-else>Guardar</span>
        </BButton>
      </BForm>
    </BCard>
  </Layout>
</template>

<style>
</style>