<template>
    <div ref="lottieContainer" class="lottie-container"></div>
  </template>
  
  <script setup>
  import { ref, onMounted, defineProps } from "vue";
  import lottie from "lottie-web";
  
  const props = defineProps({
    animationData: {
      type: Object,
      required: true,
    },
  });
  
  const lottieContainer = ref(null);
  
  onMounted(() => {
    lottie.loadAnimation({
      container: lottieContainer.value, 
      animationData: props.animationData, 
      renderer: 'svg', 
      loop: true,
      autoplay: true, 
    });
  });
  </script>
  
  <style scoped>
  .lottie-container {
    width: 100%;
    height: 100%;
    max-width: 400px;
    margin: 0 auto;
  }
  </style>
  