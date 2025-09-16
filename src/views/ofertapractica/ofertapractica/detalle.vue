<script setup>
import Layout from "@/layouts/main";
import PageHeader from "@/components/page-header";
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import apiClient from "@/utils/apiClient";
import { toastError } from "@/utils/alert";
import {
  OBTENER_CONVENIO_URL,
  LISTA_PRACTICA_URL,
  OBTENER_OFERTAPRACTICA_URL
} from "@/constants/urls";

// 💡 Declarar primero el route
const route = useRoute(); 
const convenioId = route.params.convenioId;
const ofertaId = route.params.id;

const convenio = ref({});
const practica = ref([]);
const total = ref(0);
const currentPage = ref(1);
const loading = ref(true);

const oferta = ref({
  responsibilities: "",
  skills: "",
});

const obtenerConvenio = async () => {
  loading.value = true;
  try {
    const url = OBTENER_CONVENIO_URL(convenioId);
    const response = await apiClient.get(url);
    convenio.value = response;
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

const obtenerOferta = async () => {
  try {
    const url = OBTENER_OFERTAPRACTICA_URL(ofertaId);
    const data = await apiClient.get(url);
    oferta.value = data;
  } catch (error) {
    toastError("Error al obtener la oferta práctica");
    console.error(error);
  }
};

const fetchPractica = async () => {
  loading.value = true;
  try {
    const data = await apiClient.get(LISTA_PRACTICA_URL, {
      page: currentPage.value,
    });
    practica.value = data.results;
    total.value = data.count;
  } catch (err) {
    console.log(err);
    toastError("Error al cargar las prácticas");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  obtenerConvenio();
  obtenerOferta();
  watch(currentPage, fetchPractica);
});
</script>

<template>
    <Layout>
        <PageHeader title="Detalle de la Oferta Práctica" pageTitle="Jobs" />

        <BRow>
            <BCol xl="3">
                <h4>{{ practica.name }}</h4>
            <p class="text-muted"><b-icon-building /> {{ practica.company?.name }}</p>
                <BCard no-body>
                    <BCardBody>
                        <h5 class="fw-semibold">Información de la Oferta Práctica</h5>

                        <div class="table-responsive">
                            <BTableSimple>
                                <BTbody>
                                    <BTr>
                                        <BTh>Título:</BTh>
                                        <p class="text-muted"> {{oferta.title}}</p>
                                        
                                    </BTr>
                                    <BTr>
                                        <BTh scope="row">Fecha Cierre:</BTh>
                                        <p class="text-muted"> {{oferta.close_date}}</p> 
                                    </BTr>
                                    <BTr>
                                        <BTh scope="row">Vacantes</BTh>
                                        <p class="text-muted"> {{oferta.vacancies}}</p>
                                    </BTr>
                                    
                                </BTbody>
                            </BTableSimple>
                        </div>
                        <!-- <div class="hstack gap-2">
                            <BButton variant="soft-primary" class="w-100">Apply Now</BButton>
                            <BButton variant="soft-danger" class="w-100">Contact Us</BButton>
                        </div> -->
                    </BCardBody>
                </BCard>

                <BCard no-body>
                    <BCardBody>
                        <BCard>
              <h6 class="mb-0 text-center">🏢 Información de la empresa</h6>
              <hr />
              <BTableSimple responsive>
                <BTr>
                  <BTh>Nombre:</BTh>
                  <BTd class="text-muted">{{ oferta.agreement?.company?.name }}</BTd>
                </BTr>
                <BTr>
                  <BTh>Teléfono:</BTh>
                  <BTd class="text-muted">{{ oferta.agreement?.company?.phone }}</BTd>
                </BTr>
                <BTr>
                  <BTh>Correo:</BTh>
                  <BTd class="text-muted">{{ oferta.agreement?.company?.email }}</BTd>
                </BTr>
                <BTr>
                  <BTh>Dirección:</BTh>
                  <BTd class="text-muted">{{ oferta.agreement?.company?.address }}</BTd>
                </BTr>
                <BTr>
                  <BTh>NIT:</BTh>
                  <BTd class="text-muted">{{ oferta.agreement?.company?.nui }}</BTd>
                </BTr>
              </BTableSimple>
            </BCard>
                    </BCardBody>
                </BCard>
            </BCol>
            <BCol xl="9">
                <BCard no-body>
                    <BCardBody class="border-bottom">
                        <div class="d-flex">
                            <img src="@/assets/images/companies/wechat.svg" alt="" height="50">
                            <div class="flex-grow-1 ms-3">
                                <h5>{{ oferta.location }}</h5>
                                <ul class="list-unstyled hstack gap-2 mb-0">
                                    <li>
                                        <i class="bx bx-map"></i> <span class="text-muted">{{ oferta.agreement?.company?.name }}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </BCardBody>
                    <BCardBody>
                        <h5 class="fw-semibold mb-3">Descripción</h5>
                        <p class="text-muted"> {{oferta.description}}</p>

                        <h5 class="fw-semibold mb-3">Responsabilidades:</h5>
                        <ul class="vstack gap-3 job-details text-muted" v-if="oferta.responsibilities">
                        <li v-for="(item, index) in oferta.responsibilities.split(',')" :key="index">
                            {{ item.trim() }}
                        </li>
                        </ul>
                        <p class="text-muted" v-else>
                        No se han especificado responsabilidades.
                        </p>


                        <h5 class="fw-semibold mb-3">Habilidades:</h5>
                        <ul class="vstack gap-2 text-muted" v-if="oferta.skills && oferta.skills.includes(',')">
                            <li v-for="(skill, index) in oferta.skills.split(',')" :key="index">
                            {{ skill.trim() }}
                            </li>
                        </ul>
                        <p class="text-muted" v-if="oferta.skills && !oferta.skills.includes(',')">
                            {{ oferta.skills }}
                        </p>
                        <p class="text-muted" v-else>
                            No se han especificado habilidades.
                        </p>
                            

                        <!-- <h5 class="fw-semibold mb-3">Qualification:</h5>
                        <ul class="vstack gap-3">
                            <li>
                                B.C.A / M.C.A under National University course complete.
                            </li>
                            <li>
                                3 or more years of professional design experience
                            </li>
                            <li>
                                Advanced degree or equivalent experience in graphic and web design
                            </li>
                        </ul>

                        <h5 class="fw-semibold mb-3">Skill & Experience:</h5>
                        <ul class="vstack gap-3 mb-0">
                            <li>
                                Understanding of key Design Principal
                            </li>
                            <li>
                                Proficiency With HTML, CSS, Bootstrap
                            </li>
                            <li>
                                WordPress: 1 year (Required)
                            </li>
                            <li>
                                Experience designing and developing responsive design websites
                            </li>
                            <li>
                                web designing: 1 year (Preferred)
                            </li>
                        </ul>

                        <div class="mt-4">
                            <BBadge variant="" class="badge-soft-warning">PHP</BBadge>
                            <BBadge variant="" class="badge-soft-warning">Magento</BBadge>
                            <BBadge variant="" class="badge-soft-warning">Marketing</BBadge>
                            <BBadge variant="" class="badge-soft-warning">WordPress</BBadge>
                            <BBadge variant="" class="badge-soft-warning">Bootstrap</BBadge>
                        </div>

                        <div class="mt-4">
                            <ul class="list-inline mb-0">
                                <li class="list-inline-item mt-1">
                                    Share this job:
                                </li>
                                <li class="list-inline-item mt-1">
                                    <BLink href="javascript:void(0)" class="btn btn-outline-primary btn-hover"><i class="uil uil-facebook-f"></i> Facebook</BLink>
                                </li>
                                <li class="list-inline-item mt-1">
                                    <BLink href="javascript:void(0)" class="btn btn-outline-danger btn-hover"><i class="uil uil-google"></i> Google+</BLink>
                                </li>
                                <li class="list-inline-item mt-1">
                                    <BLink href="javascript:void(0)" class="btn btn-outline-success btn-hover"><i class="uil uil-linkedin-alt"></i> linkedin</BLink>
                                </li>
                            </ul>
                        </div> -->
                    </BCardBody>
                </BCard>
            </BCol>
        </BRow>
    </Layout>
</template>