/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable no-undef */

/* 数据监控相关埋点和函数 */

function createUserId() {
  const userId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  return userId.replace(/-/g, "");
}

function getInfoBySource(source = "tiktok") {
  if (source === "tiktok") {
    const hi_source_clid = getValueByURLOrCookie("ttclid");
    const hi_source_aid = getValueByURLOrCookie("ad_id");
    return {
      hi_source_clid,
      hi_source_aid,
      hi_source_site: "unknown",
      hi_source_site_name: "unknown",
      hi_section_id: "unknown",
      hi_section_name: "unknown"
    };
  } else if (source === "taboola") {
    const hi_source_clid = getValueByURLOrCookie("tblci");
    const hi_source_aid = getValueByURLOrCookie("campaign_id");
    const hi_source_site = getValueByURLOrCookie("site_id");
    const hi_source_site_name = getValueByURLOrCookie("site_name");
    return {
      hi_source_clid,
      hi_source_aid,
      hi_source_site,
      hi_source_site_name,
      hi_section_id: "unknown",
      hi_section_name: "unknown"
    };
  } else if (source === "outbrain") {
    const hi_source_clid = getValueByURLOrCookie("dicbo");
    const hi_source_aid = getValueByURLOrCookie("campaign_id");
    const hi_source_site = getValueByURLOrCookie("site_id");
    const hi_source_site_name = getValueByURLOrCookie("site_name");
    const hi_section_id = getValueByURLOrCookie("section_id");
    const hi_section_name = getValueByURLOrCookie("section_name");
    return {
      hi_source_clid,
      hi_source_aid,
      hi_source_site,
      hi_source_site_name,
      hi_section_id,
      hi_section_name
    };
  } else if (source === "facebook") {
    const hi_source_clid = getValueByURLOrCookie("fbclid");
    return {
      hi_source_clid,
      hi_source_aid: "unknown",
      hi_source_site: "unknown",
      hi_source_site_name: "unknown",
      hi_section_id: "unknown",
      hi_section_name: "unknown"
    };
  } else {
    return {
      hi_source_clid: "unknown",
      hi_source_aid: "unknown",
      hi_source_site: "unknown",
      hi_source_site_name: "unknown",
      hi_section_id: "unknown",
      hi_section_name: "unknown"
    };
  }
}

function handleLandPageEvent() {
  const { hi_source_clid } = getSourceClid("tiktok");
  const currentHostName = getHostname();
  const currentPathName = window.location.pathname;
  const cookieName = currentHostName + "Land_User_Page";
  const rawData = getCookie(cookieName);
  const landUserPageValue = rawData ? JSON.parse(rawData) : null;

  const pageType = currentPathName === "/" ? "home" : "notHome";
  const pageCountEvent = pageType === "home" ? "Land_User_Home_Count" : "Land_User_Not_Home_Count";
  const pageUserEvent = pageType === "home" ? "Land_User_Home" : "Land_User_Not_Home";

  // 当前页是落地页则上报 count（当无历史或历史记录 pageType 与当前相同时）
  if (!landUserPageValue || landUserPageValue?.pageType === pageType) {
    pushEventParamsToGtm(pageCountEvent);
    trackEventToPixel(pageCountEvent);
  }

  // 首次访问或 clid 变化则上报并更新 cookie
  if (!landUserPageValue || landUserPageValue?.sourceClid !== hi_source_clid) {
    pushEventParamsToGtm(pageUserEvent);
    trackEventToPixel(pageUserEvent);
    const landPageData = {
      pageType,
      isClick: false,
      sourceClid: hi_source_clid
    };
    setCookieToDay(cookieName, JSON.stringify(landPageData));
  }

  // 记录用户进站
  handleUserLoadPageNotClickContent(hi_source_clid);
}
handleLandPageEvent();

// 落地页点击内容链接处理
function handleClickPageContentLink() {
  // 内容点击
  pushEventParamsToGtm("Page_Content_Click");
  // 处理落地页首次点击
  const currentPathName = window.location.pathname;
  const currentHostName = getHostname();
  const pageType = currentPathName === "/" ? "home" : "notHome";
  const cookieName = currentHostName + "Land_User_Page";
  const rawData = getCookie(cookieName);
  const landUserPageValue = rawData ? JSON.parse(rawData) : null;
  if (landUserPageValue && pageType === landUserPageValue.pageType && !landUserPageValue.isClick) {
    pushEventParamsToGtm("Landing_Page_Click");
    trackEventToPixel("Landing_Page_Click");
    landUserPageValue.isClick = true;
    setCookieToDay(cookieName, JSON.stringify(landUserPageValue));
  }

  // 处理用户source_clid内容点击行为
  const userLoadPageNotClickData = getCookie("User_Load_Page_Not_Click_Data");
  if (userLoadPageNotClickData) {
    const userLoadPageNotClickDataObj = JSON.parse(userLoadPageNotClickData);
    userLoadPageNotClickDataObj.sourceClidArr = [];
    setCookieToDay("User_Load_Page_Not_Click_Data", JSON.stringify(userLoadPageNotClickDataObj));
  }
}

// 处理用户首次点击行为（三广告以及内容点击）
function handleUserFirstClickAdOrContent(eventName) {
  if (eventName === "D_FI" || eventName === "Content") {
    handleUserFirstActionInClickId(eventName);
  }
  const userFirstClickEvent = getCookie("User_First_Click_Event");
  if (!userFirstClickEvent) {
    setCookieToDay("User_First_Click_Event", eventName);
    if (eventName === "D_FI") {
      pushEventParamsToGtm("Only_FI_Click");
    }
  } else if (userFirstClickEvent === "D_FI" && eventName !== "D_FI") {
    setCookieToDay("User_First_Click_Event", "Cancel_D_FI");
    pushEventParamsToGtm("Only_FI_Click_Cancel");
  }
}

// 处理用户首次站内行为（ClickId维度）
function handleUserFirstActionInClickId(eventName) {
  const userFirstActionInClickId = getCookie("User_First_Action_In_ClickId");
  const { hi_source_clid } = getSourceClid("tiktok");
  const eventMap = {
    D_FI: "click_anchor",
    Content: "click_content",
    Scroll: "scroll"
  };
  if (!userFirstActionInClickId) {
    const data = {
      sourceClid: hi_source_clid,
      firstType: eventName
    };
    setCookieToDay("User_First_Action_In_ClickId", JSON.stringify(data));
    pushEventParamsToGtm("User_First_Action", { first_type: eventMap[eventName] });
    console.log("handleUserFirstActionInClickId", eventName);
  } else {
    const userFirstActionInClickIdObj = JSON.parse(userFirstActionInClickId);
    if (userFirstActionInClickIdObj.sourceClid !== hi_source_clid) {
      userFirstActionInClickIdObj.sourceClid = hi_source_clid;
      userFirstActionInClickIdObj.firstType = eventName;
      setCookieToDay("User_First_Action_In_ClickId", JSON.stringify(userFirstActionInClickIdObj));
      pushEventParamsToGtm("User_First_Action", { first_type: eventMap[eventName] });
      console.log("handleUserFirstActionInClickId", eventName);
    }
  }
}

function handleUserLoadPageNotClickContent(sourceClid) {
  const userLoadPageNotClickData = getCookie("User_Load_Page_Not_Click_Data");
  if (!userLoadPageNotClickData) {
    const data = {
      sourceClidArr: [sourceClid],
      isPushSecondNotClick: false,
      isPushThirdNotClick: false
    };
    setCookieToDay("User_Load_Page_Not_Click_Data", JSON.stringify(data));
  } else {
    const userLoadPageNotClickDataObj = JSON.parse(userLoadPageNotClickData);
    if (
      userLoadPageNotClickDataObj.sourceClidArr.length === 2 &&
      !userLoadPageNotClickDataObj.isPushSecondNotClick
    ) {
      userLoadPageNotClickDataObj.isPushSecondNotClick = true;
      setCookieToDay("User_Load_Page_Not_Click_Data", JSON.stringify(userLoadPageNotClickDataObj));
      pushEventParamsToGtm("User_Second_Not_Click");
    } else if (
      userLoadPageNotClickDataObj.sourceClidArr.length === 3 &&
      !userLoadPageNotClickDataObj.isPushThirdNotClick
    ) {
      userLoadPageNotClickDataObj.isPushThirdNotClick = true;
      setCookieToDay("User_Load_Page_Not_Click_Data", JSON.stringify(userLoadPageNotClickDataObj));
      pushEventParamsToGtm("User_Third_Not_Click");
    }

    // 超过3个clid后不再记录
    if (
      !userLoadPageNotClickDataObj.isPushThirdNotClick &&
      !userLoadPageNotClickDataObj.sourceClidArr.includes(sourceClid)
    ) {
      userLoadPageNotClickDataObj.sourceClidArr.push(sourceClid);
      setCookieToDay("User_Load_Page_Not_Click_Data", JSON.stringify(userLoadPageNotClickDataObj));
    }
  }
}

window.addEventListener("beforeunload", () => {
  const { hi_source_clid } = getSourceClid("tiktok");
  handleUserLoadPageNotClickContent(hi_source_clid);
});
