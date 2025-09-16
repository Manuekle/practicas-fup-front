<script setup>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import Loader from "@/components/widgets/loader";

import { ref, computed, onMounted } from "vue";
import { required, helpers } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { isAxiosError } from "axios";
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.min.css";
import { useRoute } from "vue-router";

import apiClient from "@/utils/apiClient";
import { toastError, toastSuccess } from "@/utils/alert";
import {
  ACTUALIZAR_SUSTENTACION_URL,
  LISTA_ESTUDIANTE_URL,
  LISTA_DOCENTE_URL,
  OBTENER_SUSTENTACION_URL,
} from "@/constants/urls";
import router from "@/router";

const route = useRoute();
const config = ref({ locale: Spanish });

const defenseId = route.params.id;

const form = ref({
  application_date: null,
  scheduled_date: null,
  students: [],
  teachers: [],
  period: null,
  place: null,
  academic_session: null
});

const loading = ref(false);
const loadingDefense = ref(false);
const students = ref([]);
const teachers = ref([]);
const isLoadingStudents = ref(false);
const isLoadingTeachers = ref(false);
const optionsRole = [
  { value: "JURADO", text: "Jurado" },
  { value: "ASESOR", text: "Asesor" },
];
const optionsAcademicSession = [
  { value: null, text: 'Selecciona una opción'},
  { value: 'DIURNA', text: 'Diurna'},
  { value: 'NOCTURNA', text: 'Nocturna'},
]
const selectedTeachers = ref([]);

const endDateAfterStartDate = helpers.withMessage(
  "La fecha de programada debe ser mayor a la fecha de solicitud",
  (value, siblings) => {
    if (!value || !siblings.scheduled_date) return true;
    return new Date(value) > new Date(siblings.application_date);
  }
);
const reglas = computed(() => ({
  application_date: {
    required: helpers.withMessage(
      "La fecha de solicitud es obligatoria",
      required
    ),
  },
  scheduled_date: {
    required: helpers.withMessage(
      "La fecha programada es obligatoria",
      required
    ),
    endDateAfterStartDate,
  },
  students: {
    required: helpers.withMessage(
      "Debes seleccionar al menos un estudiante",
      required
    ),
  },
  teachers: {
    required: helpers.withMessage(
      "Debes seleccionar al menos un docente",
      required
    ),
  },
  period: {
    required: helpers.withMessage("Este campo es obligatorio", required),
  },
  place: {
    required: helpers.withMessage("Este campo es requerido", required),
  },
  academic_session: {
    required: helpers.withMessage(
      "Este campo es requerido",
      required
    )
  },
}));
const v$ = useVuelidate(reglas, form);

const getTeachers = async (query) => {
  if (query.length < 3) return;
  isLoadingTeachers.value = true;
  try {
    const response = await apiClient.get(LISTA_DOCENTE_URL, {
      search: query,
    });
    teachers.value = response.results;
  } catch (err) {
    console.error(err);
  } finally {
    isLoadingTeachers.value = false;
  }
};

const getStudents = async (query) => {
  if (query.length < 3) return;
  isLoadingStudents.value = true;
  try {
    const response = await apiClient.get(LISTA_ESTUDIANTE_URL, {
      search: query,
    });
    students.value = response.results;
  } catch (err) {
    console.error(err);
  } finally {
    isLoadingStudents.value = false;
  }
};

const getDataForm = () => {
  const data = {
    ...form.value,
    teachers: [],
    students: [],
  };

  for (let item of form.value.teachers) {
    data.teachers.push({ teacher: item.id, role: item.role });
  }
  for (let item of form.value.students) {
    data.students.push(item.id);
  }
  return data;
};

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  const posiblesCampos = [
    "scheduled_date",
    "application_date",
    "teachers",
    "students",
    "period",
    "place",
    "academic_session"
  ];

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

const assignDefense = (data) => {
  const students = [];
  const teachers = [];
  for (let item of data.students) {
    students.push(item.student);
  }
  for (let item of data.teachers) {
    const temp = {
      ...item.teacher,
      role: item.role,
    };
    teachers.push(temp);
  }
  const dataFinal = {
    ...data,
    students: students,
    teachers: teachers,
  };
  selectedTeachers.value = teachers;
  form.value = dataFinal;
};

const getDefense = async () => {
  loadingDefense.value = true;
  try {
    const url = OBTENER_SUSTENTACION_URL(defenseId);
    const response = await apiClient.get(url);
    assignDefense(response);
  } catch (error) {
    console.log(error);
  } finally {
    loadingDefense.value = false;
  }
};

const updateDefense = async () => {
  v$.value.$touch();
  if (v$.value.$invalid) return;
  loading.value = true;
  try {
    const data = getDataForm();
    const url = ACTUALIZAR_SUSTENTACION_URL(defenseId);
    await apiClient.put(url, data);
    toastSuccess("Sustentación registrada correctamente");
    router.push({ name: "detalle_sustentacion", params: { id: defenseId } });
  } catch (error) {
    if (isAxiosError(error)) {
      toastError(getErrorMessage(error));
    } else {
      toastError("Error desconocido");
    }
  } finally {
    loading.value = false;
  }
};

const handleTeacherChange = (newList) => {
  selectedTeachers.value = newList.map((teacher) => {
    const existing = form.value.teachers.find((t) => t.id === teacher.id);
    return {
      ...teacher,
      role: existing?.role || "JURADO",
    };
  });
  form.value.teachers = selectedTeachers.value;
};

onMounted(() => {
  getDefense();
});
</script>

<template>
  <Layout>
    <PageHeader title="Editar Sustentación" pageTitle="Sustentaciones" />
    <BCard>
      <Loader :loading="loadingDefense" :transparent="false">
        <BForm class="p-2" @submit.prevent="updateDefense">
          <BRow>
            <BCol md="6">
              <BFormGroup
                label="Fecha de solicitud *"
                label-for="application_date"
                class="mb-3"
              >
                <flat-pickr
                  v-model="form.application_date"
                  :config="config"
                  placeholder="Selecciona una fecha"
                  class="form-control"
                  :class="{ 'is-invalid': v$.application_date.$error }"
                  @blur="v$.application_date.$touch()"
                  :disabled="true"
                />
                <div class="invalid-feedback" v-if="v$.application_date.$error">
                  {{ v$.application_date.$errors[0].$message }}
                </div>
              </BFormGroup>
            </BCol>

            <BCol md="6">
              <BFormGroup
                label="Fecha programada *"
                label-for="scheduled_date"
                class="mb-3"
              >
                <flat-pickr
                  v-model="form.scheduled_date"
                  :config="config"
                  placeholder="Selecciona una fecha"
                  class="form-control"
                  :class="{ 'is-invalid': v$.scheduled_date.$error }"
                  @blur="v$.scheduled_date.$touch()"
                  :disabled="true"
                />
                <div class="invalid-feedback" v-if="v$.scheduled_date.$error">
                  {{ v$.scheduled_date.$errors[0].$message }}
                </div>
              </BFormGroup>
            </BCol>
            <BCol sm="12" md="6">
              <BFormGroup
                class="mb-3"
                id="input-name"
                label="Periodo *"
                label-for="period"
              >
                <BFormInput
                  id="period"
                  v-model="form.period"
                  type="text"
                  placeholder="ej, 2025-2"
                  :disabled="loading"
                  :class="{ 'is-invalid': v$.period.$error }"
                  @blur="v$.period.$touch()"
                />
                <div
                  v-for="(item, index) in v$.period.$errors"
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
                id="input-name"
                label="Lugar *"
                label-for="place"
              >
                <BFormInput
                  id="place"
                  v-model="form.place"
                  type="text"
                  placeholder="SJ 210"
                  :disabled="loading"
                  :class="{ 'is-invalid': v$.place.$error }"
                  @blur="v$.place.$touch()"
                />
                <div
                  v-for="(item, index) in v$.place.$errors"
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
                id="input-name"
                label="Jornada *"
                label-for="academic_session"
              >
                <BFormSelect
                  v-model="form.academic_session"
                  :options="optionsAcademicSession"
                  class="mb-2"
                  :disabled="loading"
                  :class="{ 'is-invalid': v$.academic_session.$error }"
                  @blur="v$.academic_session.$touch()"
                />
                <div
                  v-for="(item, index) in v$.academic_session.$errors"
                  :key="index"
                  class="invalid-feedback"
                >
                  <span v-if="item.$message">{{ item.$message }}</span>
                </div>
              </BFormGroup>
            </BCol>
            <BCol md="12">
              <BFormGroup
                label="Estudiantes *"
                label-for="student"
                class="mb-3"
              >
                <multiselect
                  id="student"
                  v-model="form.students"
                  label="full_name"
                  track-by="id"
                  placeholder="Buscar estudiantes..."
                  :options="students"
                  :multiple="true"
                  :searchable="true"
                  :internal-search="false"
                  :loading="isLoadingStudents"
                  :clear-on-select="false"
                  :close-on-select="false"
                  :hide-selected="true"
                  @search-change="getStudents"
                  :class="{ 'is-invalid': v$.students.$error }"
                  @blur="v$.students.$touch()"
                />
                <div
                  v-for="(item, index) in v$.students.$errors"
                  :key="index"
                  class="invalid-feedback"
                >
                  <span v-if="item.$message">{{ item.$message }}</span>
                </div>
              </BFormGroup>
            </BCol>

            <BCol md="12">
              <BFormGroup label="Docentes *" label-for="teacher" class="mb-3">
                <multiselect
                  id="teacher"
                  v-model="selectedTeachers"
                  label="full_name"
                  track-by="id"
                  placeholder="Buscar docentes..."
                  :options="teachers"
                  :multiple="true"
                  :searchable="true"
                  :internal-search="false"
                  :loading="isLoadingTeachers"
                  :clear-on-select="false"
                  :close-on-select="true"
                  @search-change="getTeachers"
                  :hide-selected="true"
                  @update:modelValue="handleTeacherChange"
                  :class="{ 'is-invalid': v$.teachers.$error }"
                  @blur="v$.teachers.$touch()"
                />
                <div
                  v-for="(item, index) in v$.teachers.$errors"
                  :key="index"
                  class="invalid-feedback"
                >
                  <span v-if="item.$message">{{ item.$message }}</span>
                </div>
              </BFormGroup>
            </BCol>
            <BCol md="12">
              <BRow>
                <BCol
                  class="mb-3"
                  md="6"
                  v-for="teacher in form.teachers"
                  :key="teacher.id"
                >
                  <div class="mb-2">
                    <label>{{ teacher.full_name }}</label>
                    <BFormSelect
                      v-model="teacher.role"
                      :options="optionsRole"
                      class="mb-2"
                    />
                  </div>
                </BCol>
              </BRow>
            </BCol>
          </BRow>

          <BButton
            type="submit"
            variant="primary"
            :disabled="loading || v$.$invalid"
          >
            <BSpinner v-if="loading" small />
            <span v-else>Guardar</span>
          </BButton>
        </BForm>
      </Loader>
    </BCard>
  </Layout>
</template>
