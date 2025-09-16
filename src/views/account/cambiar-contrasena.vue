<script setup>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";

import { ref, computed, watch } from "vue";
import { required, minLength, helpers } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { isAxiosError } from "axios";

import router from "@/router";
import apiClient from "@/utils/apiClient";
import { toastError, toastSuccess } from "@/utils/alert";
import {
  CAMBIAR_PASSWORD_URL,
  VALIDAR_CONTRASENA_URL,
} from "@/constants/urls";

const form = ref({
  current_password: "",
  new_password: "",
  re_new_password: "",
});
const loading = ref(false);
const passwordValidations = ref({
  common: false,
  similarity: false,
});

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
  common: passwordValidations.value.common === true,
  similarity: passwordValidations.value.similarity === true,
}));
const cumpleConTodo = computed(() =>
  Object.values(passwordRequirements.value).every(Boolean)
);

const reglas = computed(() => ({
  current_password: {
    required: helpers.withMessage(
      "La contraseña actual es obligatoria",
      required
    ),
  },
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

  const posiblesCampos = ["new_password", "current_password"];

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

const cambiarPassword = async () => {
  loading.value = true;
  try {
    await apiClient.post(CAMBIAR_PASSWORD_URL, form.value);
    toastSuccess("Contraseña actualizada correctamente");
    form.value = {
      current_password: "",
      new_password: "",
      re_new_password: "",
    };
    v$.value.$reset()
    router.push("/")
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

const validatePassword = async () => {
  try {
    const response = await apiClient.post(
      VALIDAR_CONTRASENA_URL,
      {password: form.value.new_password}
    );
    passwordValidations.value = response;
  } catch (error) {
    toastError("Error validando contraseña");
  }
};

watch(
  () => form.value.new_password,
  (val) => {
    if (val?.length >= 8) {
      validatePassword();
    } else {
      passwordValidations.value = {
        common: false,
        similitary: false,
      };
    }
  }
);
</script>

<template>
  <Layout>
    <PageHeader title="Cambiar Contraseña" pageTitle="Perfil" />
    <BCard>
      <BForm class="p-2" @submit.prevent="cambiarPassword">
        <BFormGroup
          class="mb-2"
          label="Contraseña actual *"
          label-for="current-password"
        >
          <BFormInput
            id="current-password"
            type="password"
            v-model="form.current_password"
            :class="{ 'is-invalid': v$.current_password.$error }"
            @blur="v$.current_password.$touch()"
            :disabled="loading"
          />
          <div
            v-for="(item, index) in v$.current_password.$errors"
            :key="index"
            class="invalid-feedback"
          >
            {{ item.$message }}
          </div>
        </BFormGroup>

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
            <li>
              <i
                :class="
                  passwordRequirements.common
                    ? 'text-success mdi mdi-check-circle'
                    : 'text-danger mdi mdi-close-circle'
                "
              ></i>
              No debe ser una contraseña común
            </li>
            <li>
              <i
                :class="
                  passwordRequirements.similarity
                    ? 'text-success mdi mdi-check-circle'
                    : 'text-danger mdi mdi-close-circle'
                "
              ></i>
              No debe parecerse a tu información personal (como tu correo o nombre).
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
          variant="primary"
          type="submit"
          :disabled="loading || v$.$invalid || !cumpleConTodo"
        >
          <BSpinner v-if="loading" small />
          <span v-else>Cambiar contraseña</span>
        </BButton>
      </BForm>
    </BCard>
  </Layout>
</template>
