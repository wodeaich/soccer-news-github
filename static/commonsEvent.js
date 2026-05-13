/* eslint-disable camelcase */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

function getMainDomain() {
  const url = window.location.hostname; // 获取当前主机名
  const parts = url.split("."); // 按点分割
  if (parts.length > 2) {
    // 当主机名有子域时，取最后两个部分
    return parts.slice(-2).join("."); // 返回主域名
  }
  return url; // 没有子域时直接返回当前主机名
}

function setCookie(name, value, daysToExpire = 1) {
  // console.log("setCookie", name, value, daysToExpire);
  const date = new Date();
  date.setTime(date.getTime() + daysToExpire * 24 * 60 * 60 * 1000); // 设置过期时间为指定的天数之后
  const expires = "; expires=" + date.toUTCString(); // 转换为GMT格式的字符串
  document.cookie = name + "=" + (value || "") + expires + "; path=/; domain=" + getMainDomain(); // 设置cookie
}

// 设置cookie存储时间为当天
function setCookieToDay(name, value) {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(0, 0, 0, 0);
  const expires = "; expires=" + date.toUTCString();
  document.cookie = name + "=" + (value || "") + expires + "; path=/; domain=" + getMainDomain();
}

// 获取cookie
function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function getHostname() {
  const currentHostName = window.location.hostname;
  if (currentHostName.startsWith("www")) {
    const list = currentHostName.split(".");
    if (list[0] === "www") {
      return currentHostName.replace("www.", "");
    }
    return currentHostName.replace("www", "");
  }
  return currentHostName;
}

function getParam(queryKey) {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.has(queryKey) ? searchParams.get(queryKey).trim() : "";
  } catch (c) {
    return "";
  }
}

function getValueByURLOrCookie(val) {
  let key = "hi_" + val;
  if (val.includes("hi_")) {
    key = val;
  }
  const buffer = getParam(val) || getCookie(key) || "unknown";
  setCookieToDay(key, buffer);
  return buffer;
}

// 获取来源对应的clid
function getSourceClid(source = "tiktok") {
  const map = {
    tiktok: "ttclid",
    taboola: "tblci",
    outbrain: "dicbo",
    facebook: "fbclid"
  };

  const key = typeof source === "string" ? source.toLowerCase() : "";
  const param = map[key];
  if (!param) {
    return { hi_source_clid: "unknown" };
  }

  return { hi_source_clid: getValueByURLOrCookie(param) };
}

// // 记录用户首次访问的落地页
// (function () {
//   const searchParams = new URLSearchParams(window.location.search);
//   // 未携带 hi_first_time 参数时，记录首次访问时间
//   if (!searchParams.has("hi_first_time")) {
//     const hiFirstTime = new Date().getTime();
//     setLandingPageUrl(hiFirstTime);
//   } else {
//     // 携带 hi_first_time 参数时，判断是否与缓存时间一致，不一致则更新缓存时间
//     let hiFirstTime = searchParams.get("hi_first_time");
//     const hiFirstTimeCache = getCookie("hi_first_time");
//     if (hiFirstTime !== hiFirstTimeCache) {
//       hiFirstTime = new Date().getTime();
//       setLandingPageUrl(hiFirstTime);
//     }
//   }
// })();
// // 更新落地页Url
// function setLandingPageUrl(hiFirstTime) {
//   const searchParams = new URLSearchParams(window.location.search);
//   setCookie("hi_first_time", hiFirstTime);
//   searchParams.set("hi_first_time", hiFirstTime);
//   const updateUrl = `${window.location.origin}${
//     window.location.pathname
//   }?${searchParams.toString()}`;
//   window.history.replaceState({}, "", updateUrl);
//   setCookie("hi_landing_page", updateUrl);
// }

// 上报事件到后端接口
// // eslint-disable-next-line no-unused-vars
// function trackEventToApi(eventName) {
//   const currentHref = window.location.href;
//   const currentDomain = window.location.hostname;
//   const landingPageUrl = getCookie("hi_landing_page");
//   const userAgent = navigator.userAgent;
//   const currentCookie = document.cookie;
//   const searchParams = new URLSearchParams(window.location.search);
//   const { hi_source_clid } = getSourceClid("tiktok");
//   fetch("https://api.tapmygame.com/api/zh/sjzh", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({
//       site_id: "kidotune-komanicure",
//       hi_source: "tiktok", // 媒体渠道
//       scid: hi_source_clid, // 媒体渠道的ClickID
//       sjmc: eventName, // 事件名称
//       cc: window.youknowwho_ip_country || "", // 国家code
//       curl: currentHref, // 发生转化页面的完整url
//       lurl: landingPageUrl, // 落地页的完整url
//       domain: currentDomain, // 完整域名
//       user_agent: userAgent,
//       cookie: currentCookie
//     })
//   });
// }

// eslint-disable-next-line no-unused-vars
function pushEventParamsToGtm(eventName, params = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...params
  });
}
