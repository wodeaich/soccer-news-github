export default ({ $axios, env }) => {
  if (process.client) {
    function getCookie(name) {
      const cookieArr = document.cookie.split(";").map((cookie) => cookie.trim());
      const cookie = cookieArr.find((cookie) => cookie.startsWith(`${name}=`));
      return cookie ? cookie.split("=")[1] : null;
    }

    function setCookie(name, value, days) {
      const expires = days
        ? `; expires=${new Date(Date.now() + days * 86400000).toUTCString()}`
        : "";
      document.cookie = `${name}=${value || ""}${expires}; path=/`;
    }

    const isReported = getCookie("isReported") === "true";
    const shouldReport = !isReported && (navigator.webdriver || Math.random() < 0.1);

    if (shouldReport) {
      $axios
        .post("/api/common/sj", {
          site_id: env.SITE_ID,
          language: navigator.language,
          user_agent: navigator.userAgent,
          cookie: document.cookie,
          inner_width: window.innerWidth,
          inner_height: window.innerHeight,
          outer_width: window.outerWidth,
          outer_height: window.outerHeight,
          wbd: navigator.webdriver
        })
        .then(() => {
          setCookie("isReported", "true", 1);
        })
        .catch(() => {});
    } else {
      setCookie("isReported", "true", 1);
    }
  }
};
