<script setup>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";

import router from "@/router/index";
import { ref, computed } from "vue";
import { required, helpers, numeric } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { isAxiosError } from "axios";

import apiClient from "@/utils/apiClient";
import { toastError, toastSuccess } from "@/utils/alert";
import { CREAR_PROGRAMA_URL } from "@/constants/urls";

const form = ref({
  name: null,
  code: null
});
const loading = ref(false);

const reglas = computed(() => ({
  name: {
    required: helpers.withMessage("El nombre es obligatorio", required),
  },
  code : {
    required: helpers.withMessage("El código es requerido", required),
    numeric
  }
  }
));
const v$ = useVuelidate(reglas, form);


const getErrorMessage = (error) => {
  const data = error?.response?.data;

  const posiblesCampos = ["code", "name"];

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

const createProgram = async () => {
  loading.value = true;
  try {
    await apiClient.post(CREAR_PROGRAMA_URL, form.value);
    toastSuccess("Programa registrado");
    router.push({name: 'lista_programas'})
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
    <PageHeader title="Crear Programa" pageTitle="Programas" />
    <BCard>
      <BForm class="p-2" @submit.prevent="createProgram">
        <BRow>
          <BCol sm="12" md="6">
            <BFormGroup
              class="mb-3"
              id="input-name"
              label="Nombre *"
              label-for="name"
            >
              <BFormInput
                id="name"
                v-model="form.name"
                type="text"
                placeholder="Ingresa el nombre"
                :disabled="loading"
                :class="{ 'is-invalid': v$.name.$error }"
                @blur="v$.name.$touch()"
              />
              <div
                v-for="(item, index) in v$.name.$errors"
                :key="index"
                class="invalid-feedback"
              >
                <span v-if="item.$message">{{ item.$message }}</span>
              </div>
            </BFormGroup>
          </BCol>
          <BCol sm="12" md="6">
            <BFormGroup
              class="mb-3"
              id="input-code"
              label="Código *"
              label-for="code"
            >
              <BFormInput
                id="code"
                v-model="form.code"
                type="number"
                placeholder="Ingresa el código del programa"
                :disabled="loading"
                :class="{ 'is-invalid': v$.code.$error }"
                @blur="v$.code.$touch()"
              />
              <div
                v-for="(item, index) in v$.code.$errors"
                :key="index"
                class="invalid-feedback"
              >
                <span v-if="item.$message">{{ item.$message }}</span>
              </div>
            </BFormGroup>
          </BCol>
        </BRow>
        <BButton type="submit" :disabled="loading || v$.$invalid" variant="primary">
          <BSpinner v-if="loading" small />
          <span v-else>Guardar</span>
        </BButton>
      </BForm>
    </BCard>
  </Layout>
</template>