<script setup>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiClient from "@/utils/apiClient";
import { toastSuccess, toastError } from "@/utils/alert";
import useVuelidate from "@vuelidate/core";
import { required, minValue, helpers } from "@vuelidate/validators";
import FlatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";

const route = useRoute();
const router = useRouter();
const id = route.params.id;

// URLs corregidas directamente en el componente

const OBTENER_OFERTAPRACTICA_URL = (id) => `/practical-offers/${id}`;
const ACTUALIZAR_OFERTAPRACTICA_URL = (id) => `/practical-offers/${id}`;

const loading = ref(false);
const loadingOferta = ref(true);

const form = ref({
  title: "",
  description: "",
  skills: "",
  responsibilities: "",
  close_date: "",
  vacancies: null,
  agreement: null,
  location: null
});

const reglas = computed(() => ({
  title: { required: helpers.withMessage("Campo obligatorio", required) },
  description: { required: helpers.withMessage("Campo obligatorio", required) },
  skills: { required: helpers.withMessage("Campo obligatorio", required) },
  responsibilities: { required: helpers.withMessage("Campo obligatorio", required) },
  close_date: { required: helpers.withMessage("Campo obligatorio", required) },
  vacancies: {
    required: helpers.withMessage("Campo obligatorio", required),
    minValue: helpers.withMessage("Debe ser mayor a 0", minValue(1))
  },
  agreement: { required: helpers.withMessage("Campo obligatorio", required) }
}));

const v$ = useVuelidate(reglas, form);

const cargarOferta = async () => {
  try {
    console.log("Cargando oferta con ID:", id);
    console.log("URL de carga:", OBTENER_OFERTAPRACTICA_URL(id));
    
    const response = await apiClient.get(OBTENER_OFERTAPRACTICA_URL(id));
    const oferta = response;
    
    console.log("Oferta cargada:", oferta);
    
    form.value = {
      title: oferta.title,
      description: oferta.description,
      skills: oferta.skills,
      responsibilities: oferta.responsibilities,
      close_date: oferta.close_date,
      vacancies: oferta.vacancies,
      agreement: oferta.agreement.id,
      location: oferta.location
      
    };
  } catch (error) {
    console.error("Error al cargar oferta:", error);
    console.error("Detalles del error:", error.response || error.message);
    toastError("Error al cargar la oferta de práctica");
    router.replace({ name: "ofertapractica_list" });
  } finally {
    loadingOferta.value = false;
  }
};

const actualizarOferta = async () => {
  v$.value.$touch();
  if (v$.value.$invalid) return;

  loading.value = true;
  try {
    const payload = {
      ...form.value,
      close_date: new Date(form.value.close_date).toISOString().split("T")[0]
    };
    
    console.log("Actualizando oferta con ID:", id);
    console.log("URL de actualización:", ACTUALIZAR_OFERTAPRACTICA_URL(id));
    console.log("Datos a enviar:", payload);
    
    await apiClient.put(ACTUALIZAR_OFERTAPRACTICA_URL(id), payload);
    toastSuccess("Oferta de práctica actualizada con éxito");
    router.push({ name: "ofertapractica_list" });
  } catch (error) {
    console.error("Error al actualizar:", error);
    console.error("Detalles del error:", error.response || error.message);
    toastError("Error al actualizar la oferta");
  } finally {
    loading.value = false;
  }
};

const cancelar = () => {
  router.push({ name: "ofertapractica_list" });
};

onMounted(() => {
  cargarOferta();
});
</script>

<template>
  <Layout>
    <PageHeader title="Editar Oferta de Práctica" pageTitle="Oferta de Práctica" />

    <b-card>
      <div v-if="loadingOferta" class="text-center mb-4">
        <b-spinner label="Cargando..."></b-spinner>
        <p class="mt-2">Cargando información...</p>
      </div>

      <b-form @submit.prevent="actualizarOferta" v-if="!loadingOferta">
        <b-row>
          <!-- Columna 1 -->
          <b-col md="6">
            <b-form-group class="mb-2" label="Título" label-for="titulo">
              <b-form-input id="titulo" v-model="form.title" required />
            </b-form-group>
          </b-col>

          <b-col md="6">
            <b-form-group
              class="mb-2"
              label="Fecha de Cierre"
              label-for="fecha-cierre"
            >
              <flat-pickr
                id="fecha-cierre"
                v-model="form.close_date"
                :config="{ enableTime: false, dateFormat: 'Y-m-d' }"
                class="form-control"
                required
              />
            </b-form-group>
          </b-col>

          <b-col md="4">
            <b-form-group class="mb-2" label="Convenio" label-for="Convenio">
              <b-form-input
                id="Convenio"
                v-model.number="form.agreement"
                type="number"
                required
              />
            </b-form-group>
          </b-col>

          <b-col md="4">
            <b-form-group class="mb-2" label="Vacantes" label-for="vacantes">
              <b-form-input
                id="vacantes"
                v-model.number="form.vacancies"
                type="number"
                min="1"
                required
              />
            </b-form-group>
          </b-col>

          <b-col md="4">
            <b-form-group class="mb-2" label="Ubicación" label-for="location">
              <b-form-input
                id="location"
                v-model.number="form.location"
                type="text"
                required
              />
            </b-form-group>
          </b-col>

          <b-col md="6">
            <b-form-group
              class="mb-2"
              label="Descripción"
              label-for="descripcion"
            >
              <b-form-textarea
                id="descripcion"
                v-model="form.description"
                rows="3"
                required
              />
            </b-form-group>
          </b-col>

          <b-col md="6">
            <b-form-group
              class="mb-2"
              label="Habilidades"
              label-for="habilidades"
            >
              <b-form-textarea
                id="habilidades"
                v-model="form.skills"
                rows="3"
                required
              />
            </b-form-group>
          </b-col>

          <b-col md="12 ">
            <b-form-group
              class="mb-2"
              label="Responsabilidades"
              label-for="responsabilidades"
            >
              <b-form-textarea
                id="responsabilidades"
                v-model="form.responsibilities"
                rows="2"
                required
                placeholder="Ingresa las responsabilidades separadas por coma (,)"
              />
            </b-form-group>
          </b-col>
        </b-row>

        <div class="mt-3 d-flex justify-content-between">
          <b-button type="submit" variant="primary" :disabled="loading">
            <b-spinner small v-if="loading" class="me-2" />
            Actualizar
          </b-button>
          <b-button type="button" variant="outline-danger" @click="cancelar">
            Cancelar
          </b-button>
        </div>
      </b-form>
    </b-card>
  </Layout>
</template>