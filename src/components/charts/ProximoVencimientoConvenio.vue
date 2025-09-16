<template>
  <BCard no-body>
    <BCardBody>
      <BCardTitle class="text-center"> Convenios próximos a vencer </BCardTitle>
      <Loader :loading="loading">
        <div class="chart-wrapper" v-if="success">
          <apexchart
            ref="chart"
            class="apex-charts"
            type="line"
            :options="chartOptions"
            :series="chartData"
            height="350"
            dir="ltr"
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
import { ref, onMounted } from "vue";
import Loader from "../widgets/loader.vue";
import LottieAnimation from "@/components/widgets/lottieAnimation";

import error from "@/assets/lottie/error.json";
import apiClient from "@/utils/apiClient";
import { PROXIMOS_A_VENCER_CONVENIO } from "@/constants/urls";

const success = ref(true);
const chart = ref(null);
const loading = ref(false);
const chartData = ref([
  {
    name: "Convenios próximos a vencer",
    data: [],
  },
]);

const chartOptions = ref({
  chart: {
    height: 380,
    type: "line",
    zoom: {
      enabled: true,
      type: "xy",
      resetIcon: {
        offsetX: 0,
        offsetY: 0,
        size: 30,
      },
    },
    toolbar: {
      show: false,
    },
    animations: {
      enabled: true,
      easing: "easeinout",
      speed: 800,
      animateGradually: {
        enabled: true,
        delay: 150,
      },
    },
  },
  xaxis: {
    categories: [],
    title: {
      text: "Fecha de Vencimiento",
    },
  },
  yaxis: {
    title: {
      text: "Cantidad de Convenios",
    },
  },
  stroke: {
    width: [3, 3],
    curve: "smooth",
  },
  markers: {
    size: 5,
  },
  tooltip: {
    shared: true,
    intersect: false,
    y: {
      formatter: (val) => `${val} convenios`,
    },
  },
  legend: {
    position: "top",
    horizontalAlign: "right",
    floating: true,
    offsetY: -25,
    offsetX: -5,
  },
  responsive: [
    {
      breakpoint: 600,
      options: {
        chart: {
          toolbar: {
            show: false,
          },
        },
        legend: {
          show: false,
        },
      },
    },
  ],
});

const getData = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get(PROXIMOS_A_VENCER_CONVENIO);
    chart.value.updateOptions({
      xaxis: {
        categories: response.labels,
      },
    });
    chartData.value = [
      {
        name: "Convenios próximos a vencer",
        data: response.series,
      },
    ];
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
