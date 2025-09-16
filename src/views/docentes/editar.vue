<script setup>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import Loader from "@/components/widgets/loader";

import { ref, computed, onMounted } from "vue";
import { required, helpers, email } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { isAxiosError } from "axios";
import { useRoute } from "vue-router";

import router from "@/router/index";
import apiClient from "@/utils/apiClient";
import { toastError, toastSuccess } from "@/utils/alert";
import { OBTENER_DOCENTE_URL, ACTUALIZAR_DOCENTE_URL } from "@/constants/urls";

const route = useRoute();

const form = ref({
  first_name: null,
  second_name: null,
  first_surname: null,
  second_surname: null,
  document_number: null,
  email: null,
});
const loading = ref(false);
const loadingTeacher = ref(false);
const teacherId = route.params.id;

const reglas = computed(() => ({
  first_name: {
    required: helpers.withMessage("El primer nombre es obligatorio", required),
  },
  first_surname: {
    required: helpers.withMessage(
      "El primer apellido es obligatorio",
      required
    ),
  },
  document_number: {
    required: helpers.withMessage(
      "El número de documento es obligatorio",
      required
    ),
  },
  email: {
    required: helpers.withMessage("El correo es obligatorio", required),
    email,
  },
}));
const v$ = useVuelidate(reglas, form);

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  const posiblesCampos = ["document_number", "email"];

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

const updateTeacher = async () => {
  loading.value = true;
  try {
    const url = ACTUALIZAR_DOCENTE_URL(teacherId);
    await apiClient.put(url, form.value);
    toastSuccess("Docente registrado");
    router.push({ name: "lista_docentes" });
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

const getTeacher = async () => {
  loadingTeacher.value = true;
  try {
    const url = OBTENER_DOCENTE_URL(teacherId);
    const response = await apiClient.get(url);
    form.value = response;
  } catch (error) {
    console.log(error);
  } finally {
    loadingTeacher.value = false;
  }
};

onMounted(() => {
  getTeacher();
});
</script>
<template>
  <Layout>
    <PageHeader title="Actualizar Docente" pageTitle="Docentes" />
    <BCard>
      <Loader :loading="loadingTeacher" :transparent="false">
        <BForm class="p-2" @submit.prevent="updateTeacher">
          <BRow>
            <BCol sm="12" md="6">
              <BFormGroup
                class="mb-3"
                id="input-first-name"
                label="Primer nombre *"
                label-for="first-name"
              >
                <BFormInput
                  id="first-name"
                  v-model="form.first_name"
                  type="text"
                  placeholder="Primer nombre"
                  :disabled="loading"
                  :class="{ 'is-invalid': v$.first_name.$error }"
                  @blur="v$.first_name.$touch()"
                />
                <div
                  v-for="(item, index) in v$.first_name.$errors"
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
                id="input-second-name"
                label="Segundo nombre"
                label-for="second-name"
              >
                <BFormInput
                  id="second-name"
                  v-model="form.second_name"
                  type="text"
                  placeholder="Segundo nombre"
                  :disabled="loading"
                />
              </BFormGroup>
            </BCol>
            <BCol sm="12" md="6">
              <BFormGroup
                class="mb-3"
                id="input-first-surname"
                label="Primer apellido *"
                label-for="first-surname"
              >
                <BFormInput
                  id="first-surname"
                  v-model="form.first_surname"
                  type="text"
                  placeholder="Primer apellido"
                  :disabled="loading"
                  :class="{ 'is-invalid': v$.first_surname.$error }"
                  @blur="v$.first_surname.$touch()"
                />
                <div
                  v-for="(item, index) in v$.first_surname.$errors"
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
                id="input-second-surname"
                label="Segundo apellido"
                label-for="second-surname"
              >
                <BFormInput
                  id="second-surname"
                  v-model="form.second_surname"
                  type="text"
                  placeholder="Segundo apellido"
                  :disabled="loading"
                />
              </BFormGroup>
            </BCol>
            <BCol sm="12" md="6">
              <BFormGroup
                class="mb-3"
                id="input-document-number"
                label="Número de documento *"
                label-for="document_number"
              >
                <BFormInput
                  id="document_number"
                  v-model="form.document_number"
                  type="number"
                  placeholder="Número de documento del estudiante"
                  :disabled="loading"
                  :class="{ 'is-invalid': v$.document_number.$error }"
                  @blur="v$.document_number.$touch()"
                />
                <div
                  v-for="(item, index) in v$.document_number.$errors"
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
                id="input-email"
                label="Correo eletrónico *"
                label-for="email"
              >
                <BFormInput
                  id="email"
                  v-model="form.email"
                  type="email"
                  placeholder="Correo electrónico del estudiante"
                  :disabled="loading"
                  :class="{ 'is-invalid': v$.email.$error }"
                  @blur="v$.email.$touch()"
                />
                <div
                  v-for="(item, index) in v$.email.$errors"
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