<script setup>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import Skeleton from "@/components/widgets/skeleton";
import Loader from "@/components/widgets/loader";

import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";

import {
  required,
  helpers,
  email,
  minLength,
  requiredIf,
} from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { isAxiosError } from "axios";

import router from "@/router/index";
import apiClient from "@/utils/apiClient";
import {
  LISTA_ROLES,
  OBTERNER_USUARIO,
  ACTUALIZAR_USUARIO,
} from "@/constants/urls";
import { toastError, toastSuccess } from "@/utils/alert";

const route = useRoute();
const loadingRoles = ref(false);
const loadingUser = ref(false);
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
const userId = route.params.id;
const showDismissibleAlert = ref(true)

const passwordRules = {
  required: helpers.withMessage(
    "La contraseña es obligatoria",
    requiredIf((value) => value && value.length > 0)
  ),
  minLength: helpers.withMessage(
    "Debe tener al menos 8 caracteres",
    (value) => {
      if (!value) return true;
      return minLength(8);
    }
  ),
  hasNumber: helpers.withMessage(
    "Debe contener al menos un número",
    (value) => {
      if (!value) return true;
      return /\d/.test(value);
    }
  ),
  hasUppercase: helpers.withMessage(
    "Debe contener al menos una mayúscula",
    (value) => {
      if (!value) return true;
      return /[A-Z]/.test(value);
    }
  ),
  hasLowercase: helpers.withMessage(
    "Debe contener al menos una minúscula",
    (value) => {
      if (!value) return true;
      return /[a-z]/.test(value);
    }
  ),
  hasSpecialChar: helpers.withMessage(
    "Debe contener un carácter especial",
    (value) => {
      if (!value) return true;
      return /[\W_]/.test(value);
    }
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
    required: helpers.withMessage(
      "Confirma la nueva contraseña",
      helpers.withParams({ type: "requiredIfNewPassword" }, (value) => {
        if (!form.value.new_password) return true;
        return required.$validator(value);
      })
    ),
    sameAs: helpers.withMessage(
      "Las contraseñas no coinciden",
      helpers.withParams(
        { type: "sameAsNewPassword" },
        (value) => !form.value.new_password || value === form.value.new_password
      )
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
    "new_password",
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

const updateUser = async () => {
  v$.value.$touch();

  if (v$.value.$invalid) return;
  loading.value = true;
  try {
    const url = ACTUALIZAR_USUARIO(userId);
    await apiClient.put(url, {
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
    const role = roles.value.find((element) => element.name == form.value.role);
    if (role) {
      form.value.role = role.id;
    }
  } catch (error) {
    toastError(error.toString());
  } finally {
    loadingRoles.value = false;
  }
};

const getUser = async () => {
  loadingUser.value = true;
  try {
    const url = OBTERNER_USUARIO(userId);
    const response = await apiClient.get(url);
    form.value = response;
  } catch (error) {
    toastError("Error al cargar la información del usuario");
    router.push({ name: "lista_usuarios" });
  } finally {
    loadingUser.value = false;
  }
};

onMounted(async () => {
  await getUser();
  getRoles();
});
</script>

<template>
  <Layout>
    <PageHeader title="Editar Usuario" pageTitle="Usuarios" />
    <BCard>
      <Loader :loading="loadingUser">
        <BAlert v-model="showDismissibleAlert" dismissible>
          Los campos "Nueva contraseña" y "Confirmar nueva contraseña" son opcionales. Solo debes completarlos si deseas cambiar la contraseña del usuario.
        </BAlert>
        <BForm class="p-2" @submit.prevent="updateUser">
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
                label="Nueva contraseña"
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
                label="Confirmar nueva contraseña"
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
            :disabled="
              loading || v$.$invalid || (form.new_password && !cumpleConTodo)
            "
            variant="primary"
          >
            <BSpinner v-if="loading" small />
            <span v-else>Guardar</span>
          </BButton>
        </BForm>
      </Loader>
    </BCard>
  </Layout>
</template>

<style>
</style>