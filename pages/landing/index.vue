<template>
  <div class="landing-page">
    <div class="back" @click="handleBack"></div>
    <CustomLink class="play-now" :to="`/game/${afsGames[0].path}/`">
      <div class="button">Play Now</div>
      <i class="right"></i>
    </CustomLink>
    <div class="type">
      <CustomLink to="/" class="type-item type-news">
        <span> Soccer News </span>
        <img src="~/assets/images/landing/btn-1.png" alt="news" />
      </CustomLink>
      <CustomLink to="/games/" class="type-item type-games">
        <span> Soccer Games </span>
        <img src="~/assets/images/landing/btn-2.png" alt="games" />
      </CustomLink>
    </div>
    <div class="game-list">
      <CustomLink
        v-for="(afsGame, i) in afsGames.slice(1)"
        :key="afsGame.id"
        :to="`/game/${afsGame.path}/`"
        class="game-item"
      >
        <img :src="`/images/star-${i + 1}.png`" :alt="afsGame.name" class="icon" />
      </CustomLink>
    </div>
  </div>
</template>

<script>
export default {
  async asyncData({ $axios, env }) {
    try {
      // 并行处理多个异步请求
      const [afsGameResponse] = await Promise.all([
        $axios.$get("/api/game/menu", {
          params: {
            site_id: env.SITE_ID,
            mod_id: "doings",
            size: 7
          }
        })
      ]);
      // 返回多个接口的数据
      return {
        afsGames: afsGameResponse.list
      };
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  },
  methods: {
    handleBack() {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        this.$router.push("/");
      }
    }
  }
};
</script>

<style scoped lang="scss">
.landing-page {
  min-height: 100vh;
  height: vw(1488);
  @include bg("/landing/bg.jpeg");
  background-size: vw(750) vw(1488);
  background-color: #083508;
  background-repeat: no-repeat;
  padding-top: vw(172);
  .back {
    position: absolute;
    top: vw(20);
    left: vw(46);
    border-radius: 50%;
    @include icon(vw(64), vw(64), "/landing/back.png");
    background-color: #8ba9cd;
    background-size: vw(48) vw(48);
    background-position: center;
    background-repeat: no-repeat;
  }
  .play-now {
    display: flex;
    justify-content: center;
    align-items: end;
    width: vw(680);
    height: vw(392);
    @include bg("/landing/play.png");
    background-size: vw(480) vw(100);
    background-position: center;
    background-repeat: no-repeat;
    align-items: center;
    margin: 0 auto;
    font-size: vw(42);
    font-family: "seb";
    color: #fff;
  }
  .button {
    padding-bottom: vw(6);
    margin-right: vw(28);
  }
  @keyframes moveRight {
    0% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(vw(20));
    }
    100% {
      transform: translateX(0);
    }
  }

  .right {
    @include icon(vw(48), vw(48), "/landing/right.png");
    animation: moveRight 1s linear infinite;
  }
  .type {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: vw(10) vw(46) 0;
    .type-item {
      display: flex;
      align-items: center;
      width: vw(312);
      height: vw(126);
      background: rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(vw(4));
      -webkit-backdrop-filter: blur(vw(10));
      box-shadow: 0px vw(8) vw(18) 0px rgba(0, 0, 0, 0.45);
      border-radius: vw(20);
      border: vw(2) solid rgba(255, 255, 255, 0.2);
      padding-left: vw(22);
      span {
        font-size: vw(32);
        color: #fff;
        font-family: "seb";
        line-height: vw(38);
      }
      img {
        width: vw(188);
        height: vw(160);
        align-self: end;
      }
    }
  }
  .game-list {
    position: relative;
    width: vw(690);
    height: vw(664);
    margin: vw(44) auto 0;
    .game-item {
      position: absolute;
      img {
        border: vw(6) solid #ffffff;
        border-radius: 50%;
      }
      &:nth-child(1) {
        top: vw(28);
        left: vw(128);
        img {
          width: vw(144);
          height: vw(144);
        }
      }
      &:nth-child(2) {
        top: vw(42);
        left: vw(460);
        img {
          width: vw(124);
          height: vw(124);
        }
      }
      &:nth-child(3) {
        top: vw(132);
        left: vw(294);
        img {
          width: vw(100);
          height: vw(100);
        }
      }
      &:nth-child(4) {
        top: vw(262);
        left: vw(74);
        img {
          width: vw(144);
          height: vw(144);
        }
      }
      &:nth-child(5) {
        top: vw(324);
        left: vw(460);
        img {
          width: vw(144);
          height: vw(144);
        }
      }
      &:nth-child(6) {
        top: vw(424);
        left: vw(270);
        img {
          width: vw(144);
          height: vw(144);
        }
      }
    }
  }
  @keyframes breathe {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .game-item {
    animation: breathe 3s ease-in-out infinite;

    &:nth-child(1) {
      animation-delay: 0s;
    }
    &:nth-child(2) {
      animation-delay: 0.5s;
    }
    &:nth-child(3) {
      animation-delay: 1s;
    }
    &:nth-child(4) {
      animation-delay: 1.5s;
    }
    &:nth-child(5) {
      animation-delay: 2s;
    }
    &:nth-child(6) {
      animation-delay: 2.5s;
    }
  }
}
</style>
