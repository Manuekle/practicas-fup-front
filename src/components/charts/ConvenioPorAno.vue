<template>
  <BCard no-body>
    <BCardBody>
      <BCardTitle class="text-center">Convenios iniciados por año</BCardTitle>
      <Loader :loading="loading">
        <div class="chart-wrapper" v-if="success">
          <apexchart
            ref="chart"
            type="bar"
            height="350"
            :options="chartOptions"
            :series="chartData"
          />
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
import { CONVENIOS_POR_ANIO } from "@/constants/urls";

const success = ref(true);
const chart = ref(null);
const loading = ref(false);
const chartData = ref([
  {
    name: "Convenios Firmados",
    data: [],
  },
]);

const chartOptions = ref({
  chart: {
    height: 350,
    type: "bar",
  },
  xaxis: {
    categories: [],
    title: {
      text: "Año",
    },
  },
  yaxis: {
    title: {
      text: "Cantidad de Convenios",
    },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: "55%",
      endingShape: "rounded",
    },
  },
  dataLabels: {
    enabled: false,
  },
  tooltip: {
    y: {
      formatter: (val) => `${val} convenios firmados`,
    },
  },
});

const getData = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get(CONVENIOS_POR_ANIO);
    chartData.value = [
      {
        name: "",
        data: response.series,
      },
    ];

    chart.value.updateOptions({
      xaxis: {
        categories: response.labels,
      },
    });
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