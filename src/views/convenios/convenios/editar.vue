<script setup>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import Skeleton from "@/components/widgets/skeleton";
import Loader from "@/components/widgets/loader";

import { ref, computed, onMounted } from "vue";

import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import { Spanish } from "flatpickr/dist/l10n/es.js";

import { required, helpers } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";

import router from "@/router/index";
import { useRoute } from "vue-router";
import apiClient from "@/utils/apiClient";
import {
  LISTA_PROGRAMAS_URL,
  LISTA_EMPRESAS_URL,
  LISTA_DOCUMENTOS_URL,
  OBTENER_CONVENIO_URL,
  ACTUALIZAR_CONVENIO_URL,
  OBTENER_DOCUMENTOS_CONVENIO_URL
} from "@/constants/urls";
import { toastError, toastSuccess } from "@/utils/alert";
import { usePermissions } from "@/composables/userPermissions";
import { PERMISSIONS } from "@/constants/permissions"

const { hasPerm } = usePermissions()
const route = useRoute();
const config = ref({
  locale: Spanish,
});

const loading = ref(false);
const cargandoConvenio = ref(false);
const programas = ref([]);
const cargandoProgramas = ref(false);
const paginaActualPrograma = ref(1);
const empresas = ref([]);
const cargandoEmpresas = ref(false);
const paginaActualEmpresa = ref(1);
const documentos = ref([]);
const cargandoDocumentos = ref(false);
const paginaActualDocumentos = ref(1);
const currentPage = ref(1)
const form = ref({
  name: null,
  description: null,
  initial_date: null,
  end_date: null,
  company: null,
  program: null,
  documents: [],
  agreement_type: null,
  scope: null
});
const convenioId = route.params.id;
const agreementTypeOptions = ref([
  {value: null, text: "Selecciona un tipo de convenio"},
  { value: "ESPECÍFICO", text: "Específico"},
  { value: "MACRO", text: "macro"}
])
const scopeOptions = ref([
  {value: null, text: "Selecciona una opción"},
  { value: "NACIONAL", text: "Nacional"},
  { value: "INTERNACIONAL", text: "Internacional"}
])

const programOptions = computed(() => [
  { value: null, text: "Selecciona un programa" },
  ...programas.value.map((element) => ({
    value: element.id,
    text: element.name,
  })),
]);

const companyOptions = computed(() => [
  { value: null, text: "Selecciona una empresa" },
  ...empresas.value.map((element) => ({
    value: element.id,
    text: element.name,
  })),
]);

const documentOptions = computed(() =>
  documentos.value.map((element) => ({ value: element.id, text: element.name }))
);

// Reglas de validación
const endDateAfterStartDate = helpers.withMessage(
  "La fecha de finalización debe ser mayor a la fecha de inicio",
  (value, siblings) => {
    if (!value || !siblings.initial_date) return true;
    return new Date(value) > new Date(siblings.initial_date);
  }
);

const sixMonthsDifference = helpers.withMessage(
  "La duración minima del convenio debe ser de 6 meses",
  (value, siblings) => {
    if (!value || !siblings.initial_date) return true;

    const startDate = new Date(siblings.initial_date);
    const endDate = new Date(value);

    const diffMonths =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth());

    return diffMonths > 6;
  }
);

const reglas = computed(() => ({
  name: {
    required: helpers.withMessage("El nombre es obligatorio", required),
  },
  initial_date: {
    required: helpers.withMessage(
      "Le fecha de inicio es obligatoria",
      required
    ),
  },
  end_date: {
    required: helpers.withMessage(
      "La fecha de finalización es obligatoria",
      required
    ),
    endDateAfterStartDate,
    sixMonthsDifference
  },
  description: {},
  program: {
    required: helpers.withMessage("El programa es obligatorio", required),
  },
  company: {
    required: helpers.withMessage("La empresa es obligatoria", required),
  },
  documents: {
    required: helpers.withMessage("Debes asignar los documentos", required),
  },
  agreement_type: {
    required: helpers.withMessage("El tipo de convenio es obligatorio", required)
  },
  scope: {
    required: helpers.withMessage("El alcance del convenio es obligatorio", required)
  }
}));

// Inicializar Vuelidate
const v$ = useVuelidate(reglas, form);

const editarConvenio = async () => {
  if(!hasPerm(PERMISSIONS.EDITAR_CONVENIO)){
    router.push({name: 'unauthorized'})
    return
  }
  v$.value.$touch();

  if (v$.value.$invalid) return;
  loading.value = true;
  try {
    await apiClient.put(ACTUALIZAR_CONVENIO_URL(convenioId), {
      ...form.value,
    });
    toastSuccess("Convenio actualizado correctamente");
    router.push({ name: "convenios_detalle", params: { id: convenioId } });
  } catch (error) {
    toastError(error.toString());
  } finally {
    loading.value = false;
  }
};

const obtenerProgramas = async () => {
  cargandoProgramas.value = true;
  try {
    const response = await apiClient.get(LISTA_PROGRAMAS_URL, {
      page: paginaActualPrograma.value,
    });
    programas.value = [...programas.value, ...response.results];
    if (response.next) {
      paginaActualPrograma.value++;
      obtenerProgramas();
    }
  } catch (error) {
    toastError(error.toString());
  } finally {
    cargandoProgramas.value = false;
  }
};

const obtenerEmpresas = async () => {
  cargandoEmpresas.value = true;
  try {
    const response = await apiClient.get(LISTA_EMPRESAS_URL, {
      page: paginaActualEmpresa.value,
    });
    empresas.value = [...empresas.value, ...response.results];
    if (response.next) {
      paginaActualEmpresa.value++;
      obtenerEmpresas();
    }
  } catch (error) {
    toastError(error.toString());
  } finally {
    cargandoEmpresas.value = false;
  }
};

const obtenerDocumentos = async () => {
  cargandoDocumentos.value = true;
  try {
    const response = await apiClient.get(LISTA_DOCUMENTOS_URL, {
      page: paginaActualDocumentos.value,
      is_active: true
    });
    documentos.value = [...documentos.value, ...response.results];
    if (response.next) {
      documentos.value++;
      obtenerDocumentos();
    }
  } catch (error) {
    toastError(error.toString());
  } finally {
    cargandoDocumentos.value = false;
  }
};

const obtenerDocumentosConvenio = async () => {
  try {
    const convenioId = route.params.id;
    const url = OBTENER_DOCUMENTOS_CONVENIO_URL(convenioId)
    const response = await apiClient.get(url, {
      page: currentPage.value,
    });
    form.value.documents.push(...response.results.map((element) => element.document_agreement.id))
    if (response.next){
      currentPage.value++
      obtenerDocumentosConvenio()
    }
  } catch (error) {
    console.log(error);
  }
};

const obtenerConvenio = async () => {
  cargandoConvenio.value = true;
  try {
    const url = OBTENER_CONVENIO_URL(convenioId);
    const response = await apiClient.get(url);
    form.value = {...response}
    form.value.company = response.company.id;
    form.value.program = response.program.id;
  } catch (error) {
    toastError(error.toString());
  } finally {
    cargandoConvenio.value = false;
  }
};

onMounted(() => {
  if(!hasPerm(PERMISSIONS.EDITAR_CONVENIO)){
    router.push({name: 'unauthorized'})
    return
  }
  obtenerConvenio();
  obtenerProgramas();
  obtenerEmpresas();
  obtenerDocumentos();
  obtenerDocumentosConvenio()
});

</script>

<template>
  <Layout>
    <PageHeader title="Editar convenio" pageTitle="Convenios"></PageHeader>
    <BCard>
      <Loader :loading="cargandoConvenio" :transparent="false">
        <BForm class="p-2" @submit.prevent="editarConvenio">
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
                  placeholder="ingrese el nombre del convenio"
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
                id="input-initial_date"
                label="Fecha de inicio *"
                label-for="initial_date"
              >
                <flat-pickr
                  v-model="form.initial_date"
                  :first-day-of-week="1"
                  :config="config"
                  placeholder="Fecha de inicio"
                  class="form-control"
                  :disabled="loading"
                  :class="{ 'is-invalid': v$.initial_date.$error }"
                  @blur="v$.initial_date.$touch()"
                ></flat-pickr>
                <div
                  v-for="(item, index) in v$.initial_date.$errors"
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
                id="input-end_date"
                label="Fecha de finalización *"
                label-for="end_date"
              >
                <flat-pickr
                  v-model="form.end_date"
                  :first-day-of-week="1"
                  :config="config"
                  placeholder="Fecha de finalización"
                  class="form-control"
                  :disabled="loading"
                  :class="{ 'is-invalid': v$.end_date.$error }"
                  @blur="v$.end_date.$touch()"
                ></flat-pickr>
                <div
                  v-for="(item, index) in v$.end_date.$errors"
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
                <skeleton v-if="cargandoProgramas"></skeleton>
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
            <BCol sm="6" md="6">
            <BFormGroup
              class="mb-3"
              id="input-agreement-type"
              label="Tipo de convenio"
              label-for="agreement-type"
            >
              <BFormSelect
                id="agreement-type"
                v-model="form.agreement_type"
                :options="agreementTypeOptions"
                :class="{ 'is-invalid': v$.agreement_type.$error }"
                @blur="v$.agreement_type.$touch()"
                :disabled="loading"
              />
              <div
                v-for="(item, index) in v$.agreement_type.$errors"
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
              id="input-scope"
              label="Alcance"
              label-for="scope"
            >
              <BFormSelect
                id="scope"
                v-model="form.scope"
                :options="scopeOptions"
                :class="{ 'is-invalid': v$.scope.$error }"
                @blur="v$.scope.$touch()"
                :disabled="loading"
              />
              <div
                v-for="(item, index) in v$.scope.$errors"
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
                id="input-company"
                label="Empresa o institución"
                label-for="company"
              >
                <skeleton v-if="cargandoEmpresas"></skeleton>
                <BFormSelect
                  v-else
                  id="company"
                  v-model="form.company"
                  :options="companyOptions"
                  :class="{ 'is-invalid': v$.company.$error }"
                  @blur="v$.company.$touch()"
                  :disabled="loading"
                />
                <div
                  v-for="(item, index) in v$.company.$errors"
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
                id="input-description"
                label="Descripción"
                label-for="description"
              >
                <BFormTextarea
                  v-model="form.description"
                  placeholder="Breve descripción del convenio"
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
            <BCol sm="12" md="12">
              <skeleton v-if="cargandoDocumentos"></skeleton>
              <BFormGroup
                v-else
                class="mb-3"
                label="Documentación requerida"
                label-for="documents"
              >
                <b-form-checkbox-group
                  id="checkbox-group-1"
                  v-model="form.documents"
                  :options="documentOptions"
                  name="documents"
                />
                <div
                  v-if="v$.documents.$error"
                  class="invalid-feedback d-block"
                >
                  <span>{{ v$.documents.$errors[0].$message }}</span>
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