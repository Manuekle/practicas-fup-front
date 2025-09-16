<template>
  <BCard no-body>
    <BCardBody>
      <BCardTitle class="text-center"> Sustentaciones </BCardTitle>
      <Loader :loading="loading">
        <div class="chart-wrapper" v-if="success">
          <apexchart
            ref="chart"
            type="bar"
            height="350"
            :options="chartOptions"
            :series="chartSeries"
          ></apexchart>
        </div>
        <div v-else class="chart-wrapper">
          <LottieAnimation :animationData="error" />
          <div class="text-center">
            <p class="text-muted">Error obteniendo la información</p>
          </div>
        </div>
      </Loader>
    </BCardBody>
  </BCard>
</template>

<script setup>
import Loader from "../widgets/loader.vue";
import LottieAnimation from "@/components/widgets/lottieAnimation";

import { ref, onMounted } from "vue";

import error from "@/assets/lottie/error.json";
import apiClient from "@/utils/apiClient";
import { SUSTENTACIONES } from "@/constants/urls";

const success = ref(true);
const chart = ref(null);
const loading = ref(false);
const chartSeries = ref([]);

const chartOptions = ref({
  chart: {
    id: "sustentaciones-chart",
  },
  xaxis: {
    categories: [],
  },
  yaxis: {
    title: {
      text: "Número de Sustentaciones",
    },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      stacked: true,
    },
  },
  legend: {
    position: "top",
    horizontalAlign: "left",
  },
  fill: {
    opacity: 1,
  },
});

const getData = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get(SUSTENTACIONES);
    chart.value.updateOptions({
      xaxis: {
        categories: response.labels,
      },
    });
    chartSeries.value = response.series;
  } catch (error) {
    success.value = false;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getData();
});
</script>

<style scoped>
.chart-wrapper {
  height: 350px;
}
</style>
