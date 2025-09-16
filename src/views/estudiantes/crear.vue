<script setup>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import Skeleton from "@/components/widgets/skeleton";

import router from "@/router/index";
import { ref, computed, onMounted } from "vue";
import { required, helpers, email } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { isAxiosError } from "axios";

import apiClient from "@/utils/apiClient";
import { toastError, toastSuccess } from "@/utils/alert";
import { LISTA_PROGRAMAS_URL, CREAR_ESTUDIANTE_URL } from "@/constants/urls";

const form = ref({
  first_name: null,
  second_name: null,
  first_surname: null,
  second_surname: null,
  code: null,
  document_number: null,
  email: null,
  program: null,
});
const loading = ref(false);
const programs = ref([]);
const loadingPrograms = ref(false);
const currentPageProgram = ref(1);

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
  code: {
    required: helpers.withMessage("El código es obligatorio", required)
  },
  document_number: {
      required: helpers.withMessage(
        "El número de documento es obligatorio",
        required
      ),
  },
  email: {
      required: helpers.withMessage("El correo es obligatorio", required),
      email
  },
  program: {
      required: helpers.withMessage("El programa es obligatorio", required),
    },
  }
));
const v$ = useVuelidate(reglas, form);

const programOptions = computed(() => [
  { value: null, text: "Selecciona un programa" },
  ...programs.value.map((element) => ({
    value: element.id,
    text: element.name,
  })),
]);

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  const posiblesCampos = ["code", "document_number", "email"];

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

const createStudent = async () => {
  loading.value = true;
  try {
    await apiClient.post(CREAR_ESTUDIANTE_URL, form.value);
    toastSuccess("Estudiante registrado");
    router.push({name: 'lista_estudiantes'})
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

const getPrograms = async () => {
  loadingPrograms.value = true;
  try {
    const response = await apiClient.get(LISTA_PROGRAMAS_URL, {
      page: currentPageProgram.value,
    });
    programs.value = [...programs.value, ...response.results];
    if (response.next) {
      currentPageProgram.value++;
      getPrograms();
    }
  } catch (error) {
    toastError(error.toString());
  } finally {
    loadingPrograms.value = false;
  }
};

onMounted(() => {
  getPrograms();
});
</script>
<template>
  <Layout>
    <PageHeader title="Crear Estudiante" pageTitle="Estudiantes" />
    <BCard>
      <BForm class="p-2" @submit.prevent="createStudent">
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
              id="input-code"
              label="Código *"
              label-for="code"
            >
              <BFormInput
                id="code"
                v-model="form.code"
                type="number"
                placeholder="Código del estudiante"
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
          <BCol sm="6" md="6">
            <BFormGroup
              class="mb-3"
              id="input-program"
              label="Programa"
              label-for="program"
            >
              <skeleton v-if="loadingPrograms"></skeleton>
              <BFormSelect
                v-else
                id="program"
                v-model="form.program"
                :options="programOptions"
                :class="{ 'is-invalid': v$.program.$error }"
                @blur="v$.program.$touch()"
                :disabled="loading"
              />
              <div
                v-for="(item, index) in v$.program.$errors"
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