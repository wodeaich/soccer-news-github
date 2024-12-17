<template>
  <Afs-CustomLink to="/games/" class="football">
    <div class="football-box">
      <div class="football-icon"></div>
      <div class="football-shadow"></div>
    </div>
    <div class="football-text">Game</div>
    <div class="football-arrow"></div>
  </Afs-CustomLink>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
@media (min-width: 751px) {
  .football {
    display: none !important;
  }
}
.football {
  width: vw(216);
  height: vw(64);
  background: #68dfc3;
  border-radius: vw(16);
  margin-left: auto;
  display: flex;
  align-items: center;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(vw(-8));
  }
}

@keyframes shadow {
  0%,
  100% {
    transform: translateX(-50%) scale(1);
    opacity: 0.4;
  }
  50% {
    transform: translateX(-50%) scale(0.8);
    opacity: 0.2;
  }
}

.football-box {
  width: vw(66);
  height: vw(64);

  position: relative;
  margin-left: vw(6);
}
.football-shadow {
  position: absolute;
  width: vw(34);
  height: vw(4);
  background: rgba(0, 0, 0, 0.4);
  border-radius: 0;
  filter: blur(vw(3));
  bottom: vw(6);
  left: 50%;
  transform: translateX(-50%);
  animation: shadow 0.8s infinite ease-in-out;
}
.football-icon {
  @include icon(vw(66), vw(66), "icon-football.png");
  position: relative;
  bottom: vw(12);
  animation: bounce 0.8s infinite ease-in-out;
}
.football-text {
  font-family: seb;
  font-size: vw(28);
  color: #fff;
  margin-left: vw(16);
}
.football-arrow {
  @include icon(vw(48), vw(48), "icon-football-arrow.png");
}
</style>
