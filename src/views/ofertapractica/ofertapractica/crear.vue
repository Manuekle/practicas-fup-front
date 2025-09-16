<template>
  <Layout>
    <b-card title="Crear Nueva Oferta de Práctica">
      <b-form @submit.prevent="crearOferta" novalidate>
        <b-row>
          <!-- Columna 1 -->
          <b-col md="6">
            <b-form-group class="mb-2" label="Título" label-for="titulo">
              <b-form-input id="titulo" v-model="oferta.title" required />
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
                v-model="oferta.close_date"
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
                v-model.number="oferta.agreement"
                type="number"
                required
              />
            </b-form-group>
          </b-col>

          <b-col md="4">
            <b-form-group class="mb-2" label="Vacantes" label-for="vacantes">
              <b-form-input
                id="vacantes"
                v-model.number="oferta.vacancies"
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
                v-model.number="oferta.location"
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
                v-model="oferta.description"
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
                v-model="oferta.skills"
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
                v-model="oferta.responsibilities"
                rows="2"
                required
                placeholder="Ingresa las responsabilidades separadas por coma (,)"
              />
            </b-form-group>
          </b-col>
        </b-row>

        <b-button type="submit" variant="primary">Guardar</b-button>
      </b-form>
    </b-card>
  </Layout>
</template>

<script setup>
import { ref } from "vue";
import Layout from "@/layouts/main";
import FlatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import apiClient from "@/utils/apiClient";
import { toastError, toastSuccess } from "@/utils/alert";
import { isAxiosError } from "axios";
import router from "@/router/index";
import { CREAR_OFERTAPRACTICA_URL } from "@/constants/urls";

const oferta = ref({
  title: "",
  description: "",
  skills: "",
  responsibilities: "",
  close_date: "",
  vacancies: "",
  agreement: "",
  location: null,
});

const getErrorMessage = (error) => {
  const data = error?.response?.data;
  const posiblesCampos = ["message", "nui"];

  if (data && typeof data === "object") {
    for (const campo of posiblesCampos) {
      const valor = data[campo];
      if (typeof valor === "string") return valor;
      if (Array.isArray(valor) && valor.length > 0) return valor.join(", ");
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

const crearOferta = async () => {
  try {
    const payload = {
      ...oferta.value,
      close_date: new Date(oferta.value.close_date).toISOString().split("T")[0], // YYYY-MM-DD
    };
    console.log("Payload a enviar:", payload);
    await apiClient.post(CREAR_OFERTAPRACTICA_URL, payload);
    toastSuccess("Oferta Práctica Registrada");
    router.push({ name: "ofertapractica_list" });
  } catch (error) {
    console.log(error);
    if (isAxiosError(error)) {
      toastError(getErrorMessage(error));
    } else {
      toastError("Error desconocido, intenta más tarde");
    }
  }
};
</script>
