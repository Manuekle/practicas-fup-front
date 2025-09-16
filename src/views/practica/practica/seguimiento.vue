<script setup>
import { ref, computed, onMounted} from "vue";
import { useRoute } from "vue-router";
import router from "@/router";

import Layout from "@/layouts/main";
import apiClient from "@/utils/apiClient";
import { toastSuccess, toastError } from "@/utils/alert";

import { CREAR_SEGUIMIENTO_URL } from "@/constants/urls";

const route = useRoute();
const loading = ref(false);

const fields = [
  { key: "created_by", label: "Realizado por" },
  { key: "created_at", label: "Fecha realizado" },
  { key: "observations", label: "Observación" },
];
// Seguimientos existentes (opcional cargar desde la API si se requiere)
const seguimientos = ref([]);

// Modelo para nuevo seguimiento
const nuevoSeguimiento = ref({
  fecha: "",
  tipo: null,
  observations: "",
  calificacion: 0,
});
const practica_seguimiento = route.params.id;

// Tipos de seguimiento
const tiposSeguimiento = [
  { value: null, text: "Seleccione un tipo" },
  { value: "Inicio", text: "Inicio" },
  { value: "Tutoría", text: "Tutoría" },
  { value: "Reunión de Supervisión", text: "Reunión de Supervisión" },
];

// Función para guardar el seguimiento
const crearSeguimiento = async () => {
 
  if (
    !nuevoSeguimiento.value.fecha ||
    !nuevoSeguimiento.value.tipo ||
    !nuevoSeguimiento.value.observations
  ) {
    toastError("Por favor, completa todos los campos requeridos.");
    return;
  }

  try {
    await apiClient.post(CREAR_SEGUIMIENTO_URL (practica_seguimiento), {
      ...nuevoSeguimiento.value,
    });

    toastSuccess("Seguimiento registrado correctamente");
    // Resetear el formulario
    nuevoSeguimiento.value = {
      fecha: "",
      tipo: null,
      observations: "",
      calificacion: 0,
    };
    listarSeguimiento()
  } catch (error) {
    toastError(error.toString());
  } finally {
    loading.value = false;
  }
};
 
    
 

// Cancelar (volver a la lista de prácticas)
const cancelar = () => {
  router.push({ name: "practica_list" });
};

const seguimientosOrdenados = computed(() => {
  return [...seguimientos.value].reverse();
});

const listarSeguimiento = async () => {
 


 try {
   const response = await apiClient.get(CREAR_SEGUIMIENTO_URL (practica_seguimiento), );
    seguimientos.value = response.results
 } catch (error) {
   toastError(error.toString());
 } finally {
   loading.value = false;
 }
};

onMounted(( ) =>{listarSeguimiento()})



</script>


<template>
  <Layout>
    <h2 class="mb-4">Seguimiento Práctica</h2>
    <div class="card p-3">

      <!-- NUEVO SEGUIMIENTO -->
      <h5 class="mb-3 text-center">Nuevo Seguimiento</h5>
      <b-form @submit.prevent="crearSeguimiento">
        <b-form-group label="Observación:">
          <b-form-textarea v-model="nuevoSeguimiento.observations" rows="3" required />
        </b-form-group>

        <b-row>
          <b-col md="4">
            <b-form-group label="Fecha:">
              <b-form-input type="date" v-model="nuevoSeguimiento.fecha" required />
            </b-form-group>
          </b-col>

          <b-col md="4">
            <b-form-group label="Tipo:">
              <b-form-select v-model="nuevoSeguimiento.tipo" :options="tiposSeguimiento" required />
            </b-form-group>
          </b-col>

          <b-col md="4">
            <b-form-group label="Calificar Seguimiento:">
              <div class="d-flex align-items-center">
                <span v-for="star in 3" :key="star" @click="nuevoSeguimiento.calificacion = star" class="mx-1" style="cursor: pointer">
                  <i :class="['fas', star <= nuevoSeguimiento.calificacion ? 'fa-star' : 'fa-star text-muted']"></i>
                </span>
              </div>
            </b-form-group>
          </b-col>
        </b-row>

        <div class="d-flex justify-content-end">
          <b-button variant="secondary" class="me-2" @click="cancelar">Cancelar</b-button>
          <b-button type="submit" variant="primary">Guardar</b-button>
        </div>
      </b-form>

      <hr class="my-4" />

      <!-- HISTORIAL DE SEGUIMIENTOS -->
      <h5 class="mb-3 text-center">Historial de Seguimientos</h5>
      <b-table
        :items="seguimientosOrdenados"
        :fields="fields"
        striped
        hover
        responsive
      >
        <!-- Mostrar estrellas para calificación -->
        <template #cell(calificacion)="data">
          <span v-for="star in 3" :key="star">
            <i :class="['fas', star <= data.item.calificacion ? 'fa-star' : 'fa-star text-muted']"></i>
          </span>
        </template>
      </b-table>
    </div>
  </Layout>
</template>

<style scoped>
.fas.fa-star {
  color: gold;
}
.fa-star.text-muted {
  color: #ccc;
}
</style>

