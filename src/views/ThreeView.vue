<script setup>
import WhatsFam from '@/components/WhatsFam.vue'
</script>
<template>
  <div class="about">
    <WhatsFam/>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
