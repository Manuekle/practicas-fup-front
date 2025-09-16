<template>
    <div :class="skeletonClass"></div>
  </template>
  
  <script setup>
  import { computed, defineProps } from "vue";
  
  const props = defineProps({
    type: {
      type: String,
      default: "input",
      validator: (value) => ["input", "button", "textarea"].includes(value),
    },
  });
  
  const skeletonClass = computed(() => {
    return {
      "skeleton-input": props.type === "input",
      "skeleton-button": props.type === "button",
      "skeleton-textarea": props.type === "textarea",
    };
  });
  </script>
  
  <style scoped>
  /* Skeleton Base */
  .skeleton-input,
  .skeleton-button,
  .skeleton-textarea {
    background: #e0e0e0;
    border-radius: 4px;
    position: relative;
    overflow: hidden;
  }
  
  /* Input Skeleton */
  .skeleton-input {
    width: 100%;
    height: 38px;
  }
  
  /* Button Skeleton */
  .skeleton-button {
    width: 120px;
    height: 38px;
  }
  
  /* Textarea Skeleton */
  .skeleton-textarea {
    width: 100%;
    height: 80px;
  }
  
  /* Skeleton Animation */
  .skeleton-input::after,
  .skeleton-button::after,
  .skeleton-textarea::after {
    content: "";
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0.8) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    animation: skeleton-animation 1.5s infinite;
  }
  
  @keyframes skeleton-animation {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
  </style>
  