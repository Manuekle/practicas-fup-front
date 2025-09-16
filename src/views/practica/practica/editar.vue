<script setup>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import { ref, computed, onMounted } from "vue";
import useVuelidate from "@vuelidate/core";
import { required, helpers } from "@vuelidate/validators";
import { toastSuccess, toastError } from "@/utils/alert";
import apiClient from "@/utils/apiClient";
import router from "@/router";
import { useRoute } from "vue-router";
import { LISTA_TEACHER_URL } from "@/constants/urls";

const route = useRoute();
const practicesId = route.params.id;

const API_BASE_URL = "/practices";

const loading = ref(false);
const loadingPractices = ref(false);
const loadingData = ref({ docentes: false, ofertas: false });

const form = ref({
  student: null,
  agreement: null,
  initial_date: null,
  end_date: null,
  teacher: null,
  practical_offer: null,
});

const docentes = ref([{ value: null, text: "Seleccione un docente" }]);
const estudiantes = ref([{ value: null, text: "Seleccione un estudiante" }]);
const convenio = ref([{ value: null, text: "Seleccione un convenio" }]);
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
  practical_offer: {},
}));

const v$ = useVuelidate(reglas, form);

const cargarPractica = async () => {
  loadingPractices.value = true;
  try {
    const response = await apiClient.get(`${API_BASE_URL}/${practicesId}`);
    const formatDate = (dateString) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    };

    form.value = {
      student: response.student?.id || null,
      agreement: response.agreement?.id || null,
      initial_date: formatDate(response.initial_date),
      end_date: formatDate(response.end_date),
      teacher: response.teacher?.id || null,
      practical_offer: response.practical_offer || null,
    };
  } catch (error) {
    toastError("Error al cargar la práctica");
    // router.push({ name: "practica_list" });
  } finally {
    loadingPractices.value = false;
  }
};

const obtenerDocentes = async () => {
  loadingData.value.docentes = true;
  try {
    const response = await apiClient.get(LISTA_TEACHER_URL);
    docentes.value = [
      { value: null, text: "Seleccione un docente" },
      ...response.results.map((doc) => ({
        value: doc.id,
        text: `${doc.first_name} ${doc.first_surname}`,
      })),
    ];
  } catch (error) {
    console.log(error)
    toastError("Error al cargar docentes");
  } finally {
    loadingData.value.docentes = false;
  }
};

const cargarEstudiante = async () => {
  try {
    const response = await apiClient.get("/students");
    estudiantes.value = [
      { value: null, text: "Seleccione un estudiante" },
      ...response.results.map((est) => ({
        value: est.id,
        text: `${est.first_name} ${est.first_surname}`,
      })),
    ];
  } catch (error) {
    toastError("Error al cargar estudiantes");
  }
};

const cargarConvenios = async () => {
  try {
    const response = await apiClient.get("/agreements");
    convenio.value = [
      { value: null, text: "Seleccione un convenio" },
      ...response.results.map((doc) => ({
        value: doc.id,
        text: doc.name,
      })),
    ];
  } catch (error) {
    toastError("Error al cargar convenios");
  }
};

const cargarDatos = async () => {
  await Promise.all([obtenerDocentes(), cargarEstudiante(), cargarConvenios()]);
  await cargarPractica();
};

onMounted(() => {
  cargarDatos();
});

const validarFechas = () => {
  if (form.value.initial_date && form.value.end_date) {
    const inicio = new Date(form.value.initial_date);
    const fin = new Date(form.value.end_date);
    if (fin <= inicio) {
      toastError("La fecha de finalización debe ser posterior a la fecha de inicio");
      return false;
    }
  }
  return true;
};

const actualizarPractica = async () => {
  v$.value.$touch();
  if (v$.value.$invalid || !validarFechas()) return;

  loading.value = true;
  try {
    await apiClient.put(`${API_BASE_URL}/${practicesId}`, form.value);
    toastSuccess("Práctica actualizada con éxito");
    router.push({ name: "practica_detalle", params: { id: practicesId } });
  } catch (error) {
    toastError(error.response?.data?.message || "Error al actualizar práctica");
  } finally {
    loading.value = false;
  }
};

const cancelarEdicion = () => {
  router.push({ name: "practica_detalle", params: { id: practicesId } });
};
</script>

<template>
  <Layout>
    <PageHeader title="Editar práctica" pageTitle="Práctica" />
    <b-card>
      <div v-if="loadingPractices || Object.values(loadingData).some((l) => l)" class="text-center mb-4">
        <b-spinner label="Cargando datos..."></b-spinner>
        <p class="mt-2">Cargando información, por favor espere...</p>
      </div>

      <b-form @submit.prevent="actualizarPractica" v-if="!loadingPractices">
        <b-row>
          <b-col md="6">
            <b-form-group label="Estudiante *" label-for="estudiante">
              <b-form-select
                id="estudiante"
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
            <b-form-group label="Convenio *" label-for="convenio">
              <b-form-select
                id="convenio"
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
            <b-form-group label="Docente *" label-for="docente">
              <b-form-select
                id="docente"
                v-model="form.teacher"
                :options="docentes"
                :class="{ 'is-invalid': v$.teacher.$error }"
              />
              <div class="invalid-feedback" v-if="v$.teacher.$error">
                {{ v$.teacher.$errors[0]?.$message }}
              </div>
            </b-form-group>
          </b-col>

          <b-col md="6">
            <b-form-group label="Oferta de práctica *" label-for="oferta_practica">
              <b-form-select
                id="oferta_practica"
                v-model="form.practical_offer"
                :options="ofertas"
              />
            </b-form-group>
          </b-col>

          <b-col md="6">
            <b-form-group label="Fecha de inicio *" label-for="fecha_inicio">
              <b-form-input
                id="fecha_inicio"
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
            <b-form-group label="Fecha de fin *" label-for="fecha_fin">
              <b-form-input
                id="fecha_fin"
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
          <b-button type="submit" variant="primary" :disabled="loading">
            <b-spinner small v-if="loading" class="mr-1"></b-spinner>
            Actualizar
          </b-button>
          <b-button type="button" variant="outline-danger" @click="cancelarEdicion">
            Cancelar
          </b-button>
        </div>
      </b-form>
    </b-card>
  </Layout>
</template>
