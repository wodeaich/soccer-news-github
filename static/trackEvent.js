/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable no-sequences */
/* eslint-disable prefer-const */
/* eslint-disable one-var */
/* eslint-disable no-var */
/* eslint-disable no-unused-expressions */
function getParam(queryKey) {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.has(queryKey) ? searchParams.get(queryKey).trim() : "";
  } catch (c) {
    return "";
  }
}
const initPixels = {
  tiktok: function (b) {
    !(function (w, d, t) {
      w.TiktokAnalyticsObject = t;
      var ttq = (w[t] = w[t] || []);
      (ttq.methods = [
        "page",
        "track",
        "identify",
        "instances",
        "debug",
        "on",
        "off",
        "once",
        "ready",
        "alias",
        "group",
        "enableCookie",
        "disableCookie",
        "holdConsent",
        "revokeConsent",
        "grantConsent"
      ]),
        (ttq.setAndDefer = function (t, e) {
          t[e] = function () {
            t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
          };
        });
      for (let i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      (ttq.instance = function (t) {
        for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++)
          ttq.setAndDefer(e, ttq.methods[n]);
        return e;
      }),
        (ttq.load = function (e, n) {
          let r = "https://analytics.tiktok.com/i18n/pixel/events.js",
            o = n && n.partner;
          (ttq._i = ttq._i || {}),
            (ttq._i[e] = []),
            (ttq._i[e]._u = r),
            (ttq._t = ttq._t || {}),
            (ttq._t[e] = +new Date()),
            (ttq._o = ttq._o || {}),
            (ttq._o[e] = n || {});
          n = document.createElement("script");
          (n.type = "text/javascript"), (n.async = !0), (n.src = r + "?sdkid=" + e + "&lib=" + t);
          e = document.getElementsByTagName("script")[0];
          e.parentNode.insertBefore(n, e);
        });

      ttq.load(b);
      ttq.page();
    })(window, document, "ttq");
  }
};

(function () {
  // const source = getParam("hi_source"),
  //   pixelId = getParam("hi_pc");
  // if (source && initPixels[source]) initPixels[source](pixelId);
  initPixels.tiktok("CUU4GO3C77UF169S7LKG");
})();

function trackEventToPixel(eventKey) {
  const eventNameObj = {
    Land_User_Home: {
      tiktok: "Search"
    },
    Land_User_Not_Home: {
      tiktok: "Download"
    },
    Land_User_Home_Count: {
      tiktok: "StartTrial"
    },
    Land_User_Not_Home_Count: {
      tiktok: "ViewContent"
    },
    Landing_Page_Click: {
      tiktok: "CompleteRegistration"
    },
    D_AL: {
      tiktok: "AddToCart"
    },
    D_AL_LINK: {
      tiktok: "AddPaymentInfo"
    }
  };
  const eventName = eventNameObj[eventKey]?.tiktok;
  if (eventName) {
    window.ttq?.track?.(eventName);
  }
  // const source = window.getParam("hi_source");
  // const pixelId = window.getParam("hi_pc");
  // const eventName = eventNameObj[eventKey][source];

  // if (source && pixelId && eventName) {
  //   if (source === "tiktok") {
  //     window.ttq?.track?.(eventName);
  //   }
  // }
}
