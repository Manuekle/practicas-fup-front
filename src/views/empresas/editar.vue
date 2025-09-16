<script setup>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import Loader from "@/components/widgets/loader";

import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { required, helpers, email } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { isAxiosError } from "axios";

import router from "@/router/index";
import apiClient from "@/utils/apiClient";
import {
  OBTENER_EMPRESAS_URL,
  ACTUALIZAR_EMPRESAS_URL,
} from "@/constants/urls";
import { toastError, toastSuccess } from "@/utils/alert";

const route = useRoute();
const loading = ref(false);
const loadingCompany = ref(false);
const form = ref({
  name: null,
  phone: null,
  email: null,
  address: null,
  nui: null,
});
const companyId = route.params.id;

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

const editarEmpresa = async () => {
  v$.value.$touch();

  if (v$.value.$invalid) return;
  loading.value = true;
  try {
    const url = ACTUALIZAR_EMPRESAS_URL(companyId)
    await apiClient.put(url, {
      ...form.value,
    });
    toastSuccess("Empresa actualizada correctamente");
    router.push({ name: "lista_empresas" });
  } catch (error) {
    console.log(error)
    if (isAxiosError(error)) {
      toastError(error.response?.data.message || error.response?.data.nui);
    } else {
      toastError("Error desconocido intenta más tarde");
    }
  } finally {
    loading.value = false;
  }
};

const getCompany = async () => {
  loadingCompany.value = true
  try {
    const url = OBTENER_EMPRESAS_URL(companyId);
    const respose = await apiClient.get(url);
    form.value = respose;
  } catch (error) {
    if (isAxiosError(error)) {
      toastError(error.response?.data.message || error.response?.data.nui);
    } else {
      toastError("Error desconocido intenta más tarde");
    }
  } finally {
    loadingCompany.value = false
  }
};

onMounted(() => {
  getCompany()
});
</script>

<template>
  <Layout>
    <PageHeader title="Editar empresa" pageTitle="Empresas"></PageHeader>
    <BCard>
      <Loader :loading="loadingCompany" :transparent="false">
        <BForm class="p-2" @submit.prevent="editarEmpresa">
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
      </Loader>
    </BCard>
  </Layout>
</template>

<style>
</style>