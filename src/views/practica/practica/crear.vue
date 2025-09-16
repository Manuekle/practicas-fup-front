<script setup>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import { ref, computed, onMounted, nextTick } from "vue";
import useVuelidate from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import { toastSuccess, toastError } from "@/utils/alert";
import apiClient from "@/utils/apiClient";
import router from "@/router";

import {
  LISTA_DOCENTE_URL,
  LISTA_ESTUDIANTE_URL,
  LISTA_CONVENIO_URL,
  CREAR_PRACTICA_URL
} from "@/constants/urls";

const loading = ref(false);
const loadingData = ref({
  docentes: false,
  ofertas: false,
});

const form = ref({
  student: null,
  agreement: null,
  initial_date: null,
  end_date: null,
  teacher: null,
  practical_offer: null,
});

const docentes = ref([]);
const estudiantes = ref([]);
const convenio = ref([]);
const ofertas = ref([
  { value: null, text: "Seleccione una oferta de práctica" },
  { value: "Oferta 001 - Desarrollo Web", text: "Oferta 001 - Desarrollo Web" },
  { value: "Oferta 002 - Marketing Digital", text: "Oferta 002 - Marketing Digital" },
]);

const reglas = computed(() => ({
  student: { required: helpers.withMessage("Campo obligatorio", required) },
  agreement: { required: helpers.withMessage("Campo obligatorio", required) },
  initial_date: { required: helpers.withMessage("Campo obligatorio", required) },
  end_date: { required: helpers.withMessage("Campo obligatorio", required) },
  teacher: { required: helpers.withMessage("Campo obligatorio", required) },
  practical_offer: {}, // Opcional
}));

const v$ = useVuelidate(reglas, form);

const cargarDocentes = async () => {
  loadingData.value.docentes = true;
  try {
    const response = await apiClient.get(LISTA_DOCENTE_URL);
    docentes.value = [
      { value: null, text: "Seleccione un docente" },
      ...response.results.map(doc => ({
        value: doc.id,
        text: `${doc.first_name} ${doc.first_surname}`
      }))
    ];
  } catch (error) {
    toastError("Error al cargar docentes");
    console.error(error);
  } finally {
    loadingData.value.docentes = false;
  }
};

const cargarEstudiantes = async () => {
  try {
    const response = await apiClient.get(LISTA_ESTUDIANTE_URL);
    estudiantes.value = [
      { value: null, text: "Seleccione un estudiante" },
      ...response.results.map(est => ({
        value: est.id,
        text: `${est.first_name} ${est.first_surname}`
      }))
    ];
  } catch (error) {
    toastError("Error al cargar estudiantes");
    console.error(error);
  }
};

const cargarConvenios = async () => {
  try {
    const response = await apiClient.get(LISTA_CONVENIO_URL);
    convenio.value = [
      { value: null, text: "Seleccione un convenio" },
      ...response.results.map(conv => ({
        value: conv.id,
        text: conv.name
      }))
    ];
  } catch (error) {
    toastError("Error al cargar convenios");
    console.error(error);
  }
};

const cargarDatos = async () => {
  await Promise.all([cargarDocentes(), cargarEstudiantes(), cargarConvenios()]);
};

onMounted(() => {
  cargarDatos();
});

const crearPractica = async () => {
  v$.value.$touch();
  if (v$.value.$invalid) return;

  loading.value = true;
  try {
    const response = await apiClient.post(CREAR_PRACTICA_URL, {
      ...form.value,
    });
    toastSuccess("Práctica registrada correctamente");
    router.push({ name: "practica_list", params: { id: response.id } });
  } catch (error) {
    toastError("Error al registrar la práctica");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const limpiarFormulario = () => {
  form.value = {
    student: null,
    agreement: null,
    initial_date: null,
    end_date: null,
    teacher: null,
    practical_offer: null,
  };

  nextTick(() => {
    v$.value?.$reset();
  });
};
</script>

<template>
  <Layout>
    <PageHeader title="Crear práctica" pageTitle="Práctica" />
    <b-card>
      <div v-if="Object.values(loadingData).some(l => l)" class="text-center mb-4">
        <b-spinner label="Cargando datos..."></b-spinner>
        <p class="mt-2">Cargando datos necesarios, por favor espere...</p>
      </div>

      <b-form @submit.prevent="crearPractica">
        <b-row>
          <b-col md="6">
            <b-form-group label="Estudiante *" label-for="student">
              <b-form-select
                id="student"
                v-model="form.student"
                :options="estudiantes"
                :class="{ 'is-invalid': v$.student.$error }"
              />
              <div class="invalid-feedback" v-if="v$.student.$error">
                {{ v$.student.$errors[0]?.$message }}
              </div>
            </b-form-group>
          </b-col>

          <b-col md="6">
            <b-form-group label="Convenio *" label-for="agreement">
              <b-form-select
                id="agreement"
                v-model="form.agreement"
                :options="convenio"
                :class="{ 'is-invalid': v$.agreement.$error }"
              />
              <div class="invalid-feedback" v-if="v$.agreement.$error">
                {{ v$.agreement.$errors[0]?.$message }}
              </div>
            </b-form-group>
          </b-col>

          <b-col md="6">
            <b-form-group label="Docente *" label-for="teacher">
              <b-form-select
                id="teacher"
                v-model="form.teacher"
                :options="docentes"
                :disabled="loadingData.docentes"
                :class="{ 'is-invalid': v$.teacher.$error }"
              />
              <div class="invalid-feedback" v-if="v$.teacher.$error">
                {{ v$.teacher.$errors[0]?.$message }}
              </div>
            </b-form-group>
          </b-col>

          <b-col md="6">
            <b-form-group label="Oferta de práctica" label-for="practical_offer">
              <b-form-select
                id="practical_offer"
                v-model="form.practical_offer"
                :options="ofertas"
                :disabled="loadingData.ofertas"
                :class="{ 'is-invalid': v$.practical_offer?.$error }"
              />
              <div class="invalid-feedback" v-if="v$.practical_offer?.$error">
                {{ v$.practical_offer.$errors[0]?.$message }}
              </div>
            </b-form-group>
          </b-col>

          <b-col md="6">
            <b-form-group label="Fecha de inicio *" label-for="initial_date">
              <b-form-input
                id="initial_date"
                v-model="form.initial_date"
                type="date"
                :class="{ 'is-invalid': v$.initial_date.$error }"
              />
              <div class="invalid-feedback" v-if="v$.initial_date.$error">
                {{ v$.initial_date.$errors[0]?.$message }}
              </div>
            </b-form-group>
          </b-col>

          <b-col md="6">
            <b-form-group label="Fecha de fin *" label-for="end_date">
              <b-form-input
                id="end_date"
                v-model="form.end_date"
                type="date"
                :class="{ 'is-invalid': v$.end_date.$error }"
              />
              <div class="invalid-feedback" v-if="v$.end_date.$error">
                {{ v$.end_date.$errors[0]?.$message }}
              </div>
            </b-form-group>
          </b-col>
        </b-row>

        <div class="mt-3 d-flex justify-content-between">
          <div>
            <b-button type="submit" variant="primary" class="mr-2" :disabled="loading">
              <b-spinner small v-if="loading" class="mr-1"></b-spinner>
              Guardar
            </b-button>
            <b-button type="button" variant="secondary" @click="limpiarFormulario">
              Limpiar
            </b-button>
          </div>
          <div>
          
            <b-button variant="secondary" class="me-2" @click="$router.push({ name: 'practica_list' })">
              Cancelar
            </b-button>
          </div>
        </div>
      </b-form>
    </b-card>
  </Layout>
</template>
