<script setup>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import Loader from "@/components/widgets/loader";

import { ref, computed, onMounted } from "vue";

import { required, helpers } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { isAxiosError } from "axios";
import { useRoute } from "vue-router";

import router from "@/router/index";
import apiClient from "@/utils/apiClient";
import {
  ACTUALIZAR_DOCUMENTOS_URL,
  OBTENER_DOCUMENTOS_URL,
} from "@/constants/urls";
import { toastError, toastSuccess } from "@/utils/alert";

const route = useRoute();
const formData = ref({
  name: null,
  description: null,
});
const loading = ref(false);
const getting = ref(false);

const documentId = route.params.id;

const rules = computed(() => ({
  name: { required: helpers.withMessage("El nombre es obligatorio", required) },
  description: {
    required: helpers.withMessage("La descripción es obligatoria", required),
  },
}));

// Inicializar Vuelidate
const v$ = useVuelidate(rules, formData);

const updateDocument = async () => {
  v$.value.$touch();

  if (v$.value.$invalid) return;

  loading.value = true;
  try {
    const url = ACTUALIZAR_DOCUMENTOS_URL(documentId)
    await apiClient.put(url, { ...formData.value });
    toastSuccess("Documento Actualizado");
    router.push({ name: "listar_documento" });
  } catch (error) {
    if (isAxiosError(error)) {
      toastError(error.response?.data.message);
    } else {
      toastError("Error desconocido intenta más tarde");
    }
  } finally {
    loading.value = false;
  }
};

const getDocument = async () => {
  getting.value = true;
  try {
    const url = OBTENER_DOCUMENTOS_URL(documentId);
    const response = await apiClient.get(url);
    formData.value.name = response.name;
    formData.value.description = response.description;
  } catch (error) {
    if (isAxiosError(error)) {
      toastError(error.response?.data.message || error.message);
    } else {
      toastError("Error desconocido intenta más tarde");
    }
  } finally {
    getting.value = false;
  }
};

onMounted(() => {
  getDocument();
});
</script>
<template>
  <Layout>
    <PageHeader title="Editar documento" pageTitle="Documentos"></PageHeader>
    <BCard>
      <Loader :loading="getting" :transparent="false">
        <BForm class="p-2" @submit.prevent="updateDocument">
          <BRow>
            <BCol sm="12">
              <BFormGroup
                class="mb-3"
                id="input-name"
                label="Nombre *"
                label-for="name"
              >
                <BFormInput
                  id="name"
                  v-model="formData.name"
                  type="text"
                  placeholder="Ingresa el nombre del documento"
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
            <BCol sm="12">
              <BFormGroup
                class="mb-3"
                id="input-description"
                label="Descripción *"
                label-for="description"
              >
                <BFormTextarea
                  v-model="formData.description"
                  placeholder="Ingresa una descripción para el documento"
                  rows="3"
                  :disabled="loading"
                  :class="{ 'is-invalid': v$.description.$error }"
                  @blur="v$.description.$touch()"
                />
                <div
                  v-for="(item, index) in v$.description.$errors"
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