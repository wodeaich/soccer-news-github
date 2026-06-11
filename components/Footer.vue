<template>
  <footer class="footer">
    <div class="subscription">
      <div class="subscription-content">
        <p class="text">SUBSCRIPTION</p>
        <div class="box-submit">
          <input
            v-model="input"
            class="email"
            placeholder="Email address"
            name="email"
            @keyup.enter="submitEmail"
          />
          <div class="submit" @click="submitEmail">SUBMIT</div>
        </div>
      </div>
      <div class="introduction">
        CompSoccer.com is a game aggregation platform. Through this platform, you can play games on
        different devices that support Android and iOS. Our team goal is to enable all players to
        find a game they love.We offer many types of games. Including but not limited to puzzle
        games, action games, sports games, racing games, shooting games, arcade games, makeup games,
        matching games, cooking games, etc.<br />
        CompSoccer.com has collected the hottest, most classic and most fun mobile games, each of
        which is handpicked by us. CompSoccer.com is a website that supports genuine games. The
        website does not provide game downloads, and our game download links will jump to formal
        platforms such as Google Play and Apple Store. Players can find the most suitable games in
        CompSoccer.com for the first time.<br />
        Hope you can find the best game for you on CompSoccer.com platform. If you have any feedback
        on us, please feel free to contact us by email:
        <a href="mailto:Service@compsoccer.com">Service@compsoccer.com</a>
      </div>
    </div>

    <div class="copyright">
      <div class="copyright-content">
        <div>
          <CustomLink to="/eula.html" target="_blank">Terms of Service</CustomLink>
          <CustomLink to="/privacy.html" target="_blank">Privacy Policy</CustomLink
          ><CustomLink to="/cookies.html" target="_blank">Cookies Policy</CustomLink>
          <a href="mailto:Service@CompSoccer.com">Contact</a>
        </div>
        <span>Copyright ©&nbsp; 2025 CompSoccer &nbsp;All rights reserved.</span>
      </div>
    </div>
    <Notification v-if="showNotification" :message="notificationMessage" />
  </footer>
</template>

<script>
import { validateEmail } from "~/utils/utils";

export default {
  data() {
    return {
      input: ""
    };
  },
  computed: {
    showNotification() {
      return this.$globalData.notification.show;
    },
    notificationMessage() {
      return this.$globalData.notification.message;
    }
  },
  methods: {
    async submitEmail() {
      if (validateEmail(this.input)) {
        await this.$axios.$post("/api/game/subscribe", {
          site_id: process.env.SITE_ID,
          email: this.input
        });
        this.$globalMethod.showNotification({
          message: "Thank you for subscribing!",
          type: "success"
        });
      } else {
        this.$globalMethod.showNotification({
          message: "Please enter a valid email address",
          type: "warning"
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.footer {
  // position: relative;
  border-top: 1px solid rgba(65, 65, 76, 0.1);
  margin-top: 32px;
}
.subscription {
  display: flex;
  justify-content: space-between;
  flex-flow: row-reverse;
  padding-top: 32px;
  padding-bottom: 16px;
}
.introduction {
  color: rgba($item-name, 0.6);
  line-height: 16px;
  a {
    font-family: "sesb";
    color: $item-name;
  }
}
.subscription-content {
  min-width: 390px;
  margin-left: 40px;
  .text {
    color: $item-name;
    font-family: "sesb";
    font-size: 20px;
    line-height: 20px;
    margin-bottom: 16px;
  }
  .box-submit {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f0f2f5;
    height: 48px;
    border-radius: 8px;
  }
  .email {
    width: 100%;
    padding-left: 16px;
    color: $item-name;
    height: 48px;
    border-radius: 38px;
    box-shadow:
      inset 3px 3px 4px 0px rgba(196, 212, 223, 0.8),
      inset -3px -3px 4px 0px rgba(248, 253, 253, 0.6);
    background: #f0f2f5;
    &::placeholder {
      color: rgba($item-name, 0.4);
    }
  }
  .submit {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 122px;
    height: 40px;
    background: $btn-bg;
    border-radius: 48px;
    @include center;
    font-size: 16px;
    color: #ffffff;
    font-family: "seb";
    cursor: pointer;
  }
}
.copyright {
  display: flex;
  align-items: center;
  height: 56px;
  position: relative;
  z-index: 1;
  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 99.2vw;
    height: 100%;
    box-shadow: 0px -5px 4px 0px #f8fdfd;
    z-index: -1;
  }
  .copyright-content {
    width: 100%;
    height: 56px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: $item-name;
    a {
      color: $item-name;
      flex-shrink: 0;
      &::after {
        content: "|";
        margin-left: 9px;
        margin-right: 9px;
        opacity: 0.4;
      }
      &:last-child {
        &::after {
          content: "";
        }
      }
    }
  }
}
@media screen and (max-width: 879px) {
  .footer {
    border-top: none;
    margin-top: vw(48);
  }
  .subscription {
    display: block;
    padding-top: vw(32);
    padding-bottom: vw(32);
  }
  .introduction {
    font-size: 12px;
    line-height: 16px;
    padding: 0 vw(46);
    margin-top: vw(24);
  }
  .subscription-content {
    min-width: 100%;
    margin-left: 0;
    padding: 0 vw(46);
    .text {
      font-size: vw(28);
      line-height: vw(28);
      margin-bottom: vw(32);
    }
    .box-submit {
      display: block;
      height: auto;
      background: unset;
    }
    .email {
      width: 100%;
      padding-left: vw(32);
      font-size: vw(24);
      height: vw(80);
      background: #f0f2f5;
      border-radius: vw(76);
      margin-bottom: vw(24);
    }
    .submit {
      top: vw(4);
      right: vw(4);
      width: vw(208);
      height: vw(72);
      border-radius: vw(76);
      font-size: vw(28);
    }
  }
  .copyright {
    height: auto;
    padding-bottom: vw(0);
    &:before {
      width: 100%;
    }
    .copyright-content {
      height: auto;
      flex-direction: column;
      font-size: vw(24);
      line-height: vw(48);
      a {
        &::after {
          margin-left: vw(8);
          margin-right: vw(8);
        }
      }
    }
  }
}
</style>
