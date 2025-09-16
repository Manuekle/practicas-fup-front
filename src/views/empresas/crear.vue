<script setup>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";

import { ref, computed } from "vue";

import { required, helpers, email } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { isAxiosError } from "axios";

import router from "@/router/index";
import apiClient from "@/utils/apiClient";
import {
  REGISTRAR_EMPRESAS_URL,
} from "@/constants/urls";
import { toastError, toastSuccess } from "@/utils/alert";


const loading = ref(false);
const form = ref({
  name: null,
  phone: null,
  email: null,
  address: null,
  nui: null,
});

const reglas = computed(() => ({
  name: {
    required: helpers.withMessage("El nombre es obligatorio", required),
  },
  phone: {
    required: helpers.withMessage(
      "El número de teléfono es obligatorio",
      required
    ),
  },
  email: {
    required: helpers.withMessage(
      "El correo electrónico es obligatorio",
      required
    ),
    email,
  },
  address: {
    required: helpers.withMessage("La dirección es obligatoria", required),
  },
  nui: {
    required: helpers.withMessage("El NUI es obligatorio", required),
  },
}));

// Inicializar Vuelidate
const v$ = useVuelidate(reglas, form);

const getErrorMessage = (error) =>{
  const data = error?.response?.data;

  const posiblesCampos = ['message', 'nui', 'email'];

  if (data && typeof data === 'object') {
    for (const campo of posiblesCampos) {
      const valor = data[campo];

      if (typeof valor === 'string') {
        return valor;
      }

      if (Array.isArray(valor) && valor.length > 0) {
        return valor.join(', ');
      }

      if (typeof valor === 'object' && valor !== null) {
        const nestedString = Object.values(valor).find(v => typeof v === 'string');
        if (nestedString) return nestedString;
      }
    }
  }

  return 'Ocurrió un error inesperado.';
}

const registrarEmpresa = async () => {
  v$.value.$touch();

  if (v$.value.$invalid) return;
  loading.value = true;
  try {
    await apiClient.post(REGISTRAR_EMPRESAS_URL, {
      ...form.value,
    });
    toastSuccess("Empresa registrada correctamente");
    router.push({ name: "lista_empresas"});
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
    <PageHeader title="Registrar empresa" pageTitle="Empresas"></PageHeader>
    <BCard>
      <BForm class="p-2" @submit.prevent="registrarEmpresa">
        <BRow>
          <BCol sm="6" md="6">
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
                placeholder="ingrese el nombre de la empresa"
                :disabled="loading"
                :class="{ 'is-invalid': v$.name.$error }"
                @blur="v$.name.$touch()"
              ></BFormInput>
              <div
                v-for="(item, index) in v$.name.$errors"
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
              label="Número de teléfono *"
              label-for="phone"
            >
              <BFormInput
                id="phone"
                v-model="form.phone"
                type="text"
                placeholder="ingrese el número de teléfono"
                :disabled="loading"
                :class="{ 'is-invalid': v$.phone.$error }"
                @blur="v$.phone.$touch()"
              ></BFormInput>
              <div
                v-for="(item, index) in v$.phone.$errors"
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
              id="input-address"
              label="Dirección *"
              label-for="address"
            >
              <BFormInput
                id="address"
                v-model="form.address"
                type="text"
                placeholder="ingrese la dirección"
                :disabled="loading"
                :class="{ 'is-invalid': v$.address.$error }"
                @blur="v$.address.$touch()"
              ></BFormInput>
              <div
                v-for="(item, index) in v$.address.$errors"
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
              id="input-nui"
              label="Número único de identificación *"
              label-for="nui"
            >
              <BFormInput
                id="nui"
                v-model="form.nui"
                type="text"
                placeholder="Número único de identificación"
                :disabled="loading"
                :class="{ 'is-invalid': v$.nui.$error }"
                @blur="v$.nui.$touch()"
              ></BFormInput>
              <div
                v-for="(item, index) in v$.nui.$errors"
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

<style>
</style>