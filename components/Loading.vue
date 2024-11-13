<template>
  <div class="loading-bars">
    <div></div>
    <div></div>
    <div></div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.loading-bars {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 40px;
  gap: 6px;
  margin-top: 40px;
  margin-bottom: 40px;
}

.loading-bars div {
  width: 5px;
  height: 14px;
  background: $btn-bg;
  transform-origin: center center;
  animation: grow-shrink 1s infinite ease-in-out;
}

.loading-bars div:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-bars div:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes grow-shrink {
  0%,
  100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(2);
  }
}
</style>
