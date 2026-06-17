<template>
  <footer class="footer" :class="{ sm: ['de'].indexOf(lang) !== -1 }">
    <div class="copyright">
      <div class="copyright-content">
        <div class="copyright-content-1">
          <Afs-CustomLink
            :to="`/eula${['ja', 'ko', 'zh_TW'].indexOf(lang) === -1 ? '' : '-' + lang}.html`"
            target="_blank"
          >
            {{ eulaText[lang] || eulaText["en"] }}
          </Afs-CustomLink>
          <Afs-CustomLink
            :to="`/privacy${['ja', 'ko', 'zh_TW'].indexOf(lang) === -1 ? '' : '-' + lang}.html`"
            target="_blank"
          >
            {{ privacyText[lang] || privacyText["en"] }} </Afs-CustomLink
          ><Afs-CustomLink
            :to="`/cookies${['ja', 'ko', 'zh_TW'].indexOf(lang) === -1 ? '' : '-' + lang}.html`"
            target="_blank"
          >
            {{ cookiesText[lang] || cookiesText["en"] }}
          </Afs-CustomLink>
          <a href="mailto:service@compsoccer.com">
            {{ contactText[lang] || contactText["en"] }}
          </a>
        </div>
        <span style="text-align: center">
          {{ copyRightText1[lang] || copyRightText1["en"] }}
          ©&nbsp; 2025 CompSoccer &nbsp;
          {{ copyRightText2[lang] || copyRightText2["en"] }}
        </span>
      </div>
    </div>
    <Notification v-if="showNotification" :message="notificationMessage" />
  </footer>
</template>

<script>
import { validateEmail } from "~/utils/utils";

export default {
  props: {
    lang: {
      type: String,
      default: "en"
    }
  },
  data() {
    return {
      input: "",
      eulaText: {
        en: "Terms of Service",
        ja: "利用規約",
        ko: "서비스 약관",
        zh_TW: "服務條款",
        de: "Nutzungsbedingungen",
        pt: "Termos de Serviço", // 葡萄牙语
        es: "Términos de Servicio", // 西班牙语
        fr: "Conditions d'utilisation", // 法语
        th: "ข้อกำหนดการให้บริการ", // 泰语
        id: "Ketentuan Layanan" // 印度尼西亚语
      },
      privacyText: {
        en: "Privacy Policy",
        ja: "プライバシーポリシー",
        ko: "개인 정보 정책",
        zh_TW: "隱私政策",
        de: "Datenschutzrichtlinie",
        pt: "Política de Privacidade", // 葡萄牙语
        es: "Política de Privacidad", // 西班牙语
        fr: "Politique de Confidentialité", // 法语
        th: "นโยบายความเป็นส่วนตัว", // 泰语
        id: "Kebijakan Privasi" // 印度尼西亚语
      },
      cookiesText: {
        en: "Cookies Policy",
        ja: "クッキーポリシー",
        ko: "쿠키 정책",
        zh_TW: "Cookie 政策",
        de: "Cookie-Richtlinie",
        pt: "Política de Cookies", // 葡萄牙语
        es: "Política de Cookies", // 西班牙语
        fr: "Politique de Cookies", // 法语
        th: "นโยบายคุกกี้", // 泰语
        id: "Kebijakan Cookie" // 印度尼西亚语
      },
      contactText: {
        en: "Contact",
        ja: "連絡先",
        ko: "연락하다",
        zh_TW: "聯絡",
        de: "Kontakt",
        pt: "Contato", // 葡萄牙语
        es: "Contacto", // 西班牙语
        fr: "Contact", // 法语
        th: "ติดต่อ", // 泰语
        id: "Kontak" // 印度尼西亚语
      },
      copyRightText1: {
        en: "Copyright",
        ja: "著作権",
        ko: "모든 권리 보유",
        zh_TW: "Copyright",
        de: "Urheberrecht",
        pt: "Direitos Autorais", // 葡萄牙语
        es: "Derechos de Autor", // 西班牙语
        fr: "Droits d'Auteur", // 法语
        th: "ลิขสิทธิ์", // 泰语
        id: "Hak Cipta" // 印度尼西亚语
      },
      copyRightText2: {
        en: "All rights reserved",
        ja: "無断複写・転載を禁じます",
        ko: "저작권",
        zh_TW: "All rights reserved",
        de: "Alle Rechte vorbehalten",
        pt: "Todos os direitos reservados", // 葡萄牙语
        es: "Todos los derechos reservados", // 西班牙语
        fr: "Tous droits réservés", // 法语
        th: "สงวนลิขสิทธิ์", // 泰语
        id: "Semua hak dilindungi" // 印度尼西亚语
      }
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
        try {
          await this.$axios.$post("/api/game/subscribe", {
            site_id: process.env.SITE_ID,
            email: this.input
          });
          this.$globalMethod.showNotification({
            message: "Thank you for subscribing!",
            type: "success"
          });
        } catch (e) {
          this.$globalMethod.showNotification({
            message: "Subscription is temporarily unavailable, please try again later.",
            type: "warning"
          });
        }
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
  position: relative;
  // 与 .container（max-width:1200 + padding:0 24）对齐：水平居中并留出同样内边距，
  // 避免版权链接贴到视口最左侧而与正文错位
  width: 100%;
  max-width: 1200px;
  margin: 32px auto 0;
  padding: 0 24px;
  box-sizing: border-box;
}
.copyright-content-1 {
  display: flex;
  flex-wrap: nowrap;
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
    width: 100vw;
    height: 100%;
    z-index: -1;
  }
  .copyright-content {
    width: 100%;
    height: 56px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: $font1;
    a {
      color: $font1;
      flex-shrink: 0;
      white-space: nowrap;
      &::after {
        content: "|";
        margin-inline-start: 9px;
        margin-inline-end: 9px;
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
@media screen and (max-width: 750px) {
  .footer {
    margin-top: vw(32);
    padding: 0 vw(46);
    &.sm {
      transform: scale(0.85);
    }
  }
  .copyright {
    height: auto;
    padding-bottom: vw(32);
    &:before {
      display: none;
    }
    .copyright-content {
      height: auto;
      flex-direction: column;
      font-size: vw(24);
      line-height: vw(48);
      a {
        &::after {
          margin-inline-start: vw(6);
          margin-inline-end: vw(6);
        }
      }
    }
  }
}
</style>
