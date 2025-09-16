<template>
  <Layout>
    <PageHeader title="Detalle de la práctica" pageTitle="Prácticas" />

    <Loader :loading="loading" :transparent="false">
      <BCard>
        <b-row class="px-4 mb-3">
          <b-col md="3">
            <h4>{{ practica.name }}</h4>
            <p class="text-muted"><b-icon-building /> {{ practica.company?.name }}</p>
          </b-col>
          <b-col md="3" lg="3" sm="6">
            <div style="display: flex; justify-content: space-around">
            <router-link 
            :to="{
           name: 'practica_editar', 
            params: { id: practicaId }
             }" class="btn btn-outline-primary me-2">
              Editar
            </router-link>
            <!--<b-button
             variant="primary"
             @click="showUploadModal = true"
             class="btn btn-md btn-soft-primary"
             >Subir documentos
            </b-button> -->
            </div>
          </b-col>
        </b-row>

        <b-tabs v-model="activeTab" card pills>
          <b-tab title="Detalle" active>
            <b-row class="mt-3">
              <!-- Empresa -->
              <b-col md="6">
                <b-card>
                  <h5 class="text-center">🏢 Información de la empresa</h5>
                  <hr />
                  <BTableSimple responsive>
                <BTr>
                  <BTh>Nombre:</BTh>
                  <BTd class="text-muted">{{ convenio.company?.name }}</BTd>
                </BTr>
                <BTr>
                  <BTh>Teléfono:</BTh>
                  <BTd class="text-muted">{{ convenio.company?.phone }}</BTd>
                </BTr>
                <BTr>
                  <BTh>Correo:</BTh>
                  <BTd class="text-muted">{{ convenio.company?.email }}</BTd>
                </BTr>
                <BTr>
                  <BTh>Dirección:</BTh>
                  <BTd class="text-muted">{{ convenio.company?.address }}</BTd>
                </BTr>
                <BTr>
                  <BTh>NIT:</BTh>
                  <BTd class="text-muted">{{ convenio.company?.nui }}</BTd>
                </BTr>
              </BTableSimple>
                </b-card>
              </b-col>

              <!-- Convenio -->
              <b-col md="6">
                <b-card>
                  <h5 class="text-center">📑 Información del convenio</h5>
                  <hr />
                  <BTableSimple responsive bordeles>
                  <BTr>
                    <BTh>Nombre:</BTh>
                    <BTd>{{ convenio.name }}</BTd>
                  </BTr>
                  <BTr>
                    <BTh>Tipo de convenio:</BTh>
                    <BTd>{{ convenio.agreement_type }}</BTd>
                  </BTr>
                  <BTr>
                    <BTh>Alcance del convenio:</BTh>
                    <BTd>{{ convenio.scope }}</BTd>
                  </BTr>
                  <BTr>
                    <BTh>Estado de la documentación:</BTh>
                    <BTd>{{ convenio.documentation_status }}</BTd>
                  </BTr>
                  <BTr>
                    <BTh>Observación:</BTh>
                    <BTd>{{
                      practica.observations
                        ? practica.observations
                        : "Sin observacion"
                    }}</BTd>
                  </BTr>
                  <BTr>
                    <BTh>Creado el:</BTh>
                    <BTd>{{ formatDate(convenio.created_at) }}</BTd>
                  </BTr>
                </BTableSimple>
                </b-card>
              </b-col>

              <!-- Práctica -->
              <b-col md="6" class="mt-4">
                <b-card>
                  <h5 class="text-center">📘 Información de la práctica</h5>
                  <hr />
                  <b-table-simple>
                    <b-tr><b-th>Estado</b-th><b-td>{{ practica.status }}</b-td></b-tr>
                    <b-tr><b-th>Fechas</b-th><b-td>{{ practica.initial_date }} - {{ practica.end_date }}</b-td></b-tr>
                    <b-tr><b-th>Creado el</b-th><b-td>{{ formatDate(practica.created_at) }}</b-td></b-tr>
                  </b-table-simple>
                </b-card>
              </b-col>

              <!-- Participantes -->
              <b-col md="6" class="mt-4">
                <b-card>
                  <h5 class="text-center">👨‍🎓 Participantes</h5>
                  <hr />
                  <b-table-simple>
                    <b-tr><b-th>Estudiante</b-th><b-td>{{ practica.student?.full_name || 'Sin asignar' }}</b-td></b-tr>
                    <b-tr><b-th>Docente</b-th><b-td>{{ practica.teacher?.full_name || 'Sin asignar' }}</b-td></b-tr>
                    <b-tr><b-th>Programa</b-th><b-td>{{ practica.program }}</b-td></b-tr>
                  </b-table-simple>
                </b-card>
              </b-col>
            </b-row>
          </b-tab>
        </b-tabs>
      </BCard>
    </Loader>
  </Layout>
</template>

<script setup>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import Loader from "@/components/widgets/loader";
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import apiClient from "@/utils/apiClient";
import { formatDate } from "@/utils/utils";
import { toastError } from "@/utils/alert";
import { OBTENER_PRACTICA_URL } from "@/constants/urls";

const practica = ref({});
const convenio = ref({});
const loading = ref(true);
const activeTab = ref(0);
const route = useRoute();
const practicaId = route.params.id;

const obtenerPractica = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get(OBTENER_PRACTICA_URL(practicaId));
    practica.value = response;
    convenio.value = response.agreement;
  } catch (error) {
    toastError("Error al cargar la práctica");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  obtenerPractica();
});
</script>

<style scoped>
h5 {
  font-weight: 600;
}
</style>
