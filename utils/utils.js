// 模拟点击链接
export function simulateSearch(value) {
  const targetPath = "/search/";
  const currentParams = new URLSearchParams(window.location.search);
  const currentPathname = window.location.pathname;

  // 定义路径与类型的映射关系
  const pathTypeMappings = [
    { pattern: /^\/game\/.*/, type: "game" },
    { pattern: /^\/download\/.*/, type: "download" },
    { pattern: /^\/$/, type: "home" }
  ];

  // 查找匹配的路径类型
  const matchedPathType = pathTypeMappings.find((mapping) => mapping.pattern.test(currentPathname));
  const from = matchedPathType ? matchedPathType.type : currentPathname.replaceAll("/", "");

  // 删除不需要的查询参数
  currentParams.delete("from");
  currentParams.delete("text");
  currentParams.set("text", value);

  const queryString = currentParams.toString();

  const link = document.createElement("a");
  link.href = `${targetPath}?${queryString}${queryString ? "&" : ""}from=${encodeURIComponent(
    from
  )}`;
  link.style.display = "none";
  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
}

// 模拟点击链接
export function simulateAFSSearch(value) {
  const targetPath = "/afsearch/";

  const url = generateCustomPath(targetPath);

  const link = document.createElement("a");
  link.href = `${url}&query=${value}`;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateCustomLink(url) {
  const targetPath = url;
  const currentParams = new URLSearchParams(window.location.search);
  const currentPathname = window.location.pathname;

  // 定义路径与类型的映射关系
  const pathTypeMappings = [
    { pattern: /^\/game\/.*/, type: "game" },
    { pattern: /^\/app\/.*/, type: "app" },
    { pattern: /^\/download\/.*/, type: "download" },
    { pattern: /^\/$/, type: "home" }
  ];

  // 查找匹配的路径类型
  const matchedPathType = pathTypeMappings.find((mapping) => mapping.pattern.test(currentPathname));
  const from = matchedPathType ? matchedPathType.type : currentPathname.replaceAll("/", "");

  // 删除不需要的查询参数
  currentParams.delete("from");
  if (currentPathname === "/search/") {
    currentParams.delete("text");
  }

  const currentDomain = window.location.host;

  let targetDomain = "";

  // 提取主域名和顶级域名部分的正则表达式
  // eslint-disable-next-line no-useless-escape
  const domainPattern = /^(www[0-9]*|[0-9]*)\.?([^\.]+)\.([a-z]{2,})$/;
  const match = currentDomain.match(domainPattern);
  if (match) {
    const prefix = match[1]; // 提取前缀部分，如 "www", "www2", "2", ""

    if (!prefix) {
      // case: siteId.tld
      targetDomain = `www.${currentDomain}`;
    } else if (prefix.startsWith("www")) {
      if (prefix === "www") {
        // case: www.siteId.tld
        targetDomain = currentDomain.substring(4);
      } else {
        // case: wwwx.siteId.tld
        targetDomain = currentDomain.substring(3);
      }
    } else {
      // case: x.siteId.tld
      targetDomain = `www${currentDomain}`;
    }
  } else {
    // 如果不匹配期望的模式，保留当前域名
    targetDomain = currentDomain;
  }

  const protocol = window.location.protocol;

  // 生成新的查询参数字符串
  const queryString = currentParams.toString();
  return `${protocol}//${targetDomain}${targetPath}?${queryString}${
    queryString ? "&" : ""
  }from=${encodeURIComponent(from)}`;
}

export function generateCustomPath(url) {
  const targetPath = url;
  const currentParams = new URLSearchParams(window.location.search);
  const currentPathname = window.location.pathname;

  // 定义路径与类型的映射关系
  const pathTypeMappings = [
    { pattern: /^\/category\/[\w-]+\/$/, type: "category-detail" },
    { pattern: /^\/category\/$/, type: "category" },
    { pattern: /^\/detail\/.*/, type: "detail" },
    { pattern: /^\/$/, type: "home" }
  ];

  // 查找匹配的路径类型
  const matchedPathType = pathTypeMappings.find((mapping) => mapping.pattern.test(currentPathname));
  const from = matchedPathType ? matchedPathType.type : currentPathname.replaceAll("/", "");

  // 删除不需要的查询参数
  currentParams.delete("from");
  if (currentPathname === "/afsearch/" || currentPathname === "/content/") {
    currentParams.delete("text");
    currentParams.delete("query");
  }

  const currentDomain = window.location.host;

  let targetDomain = "";

  // 提取主域名和顶级域名部分的正则表达式
  // eslint-disable-next-line no-useless-escape
  const domainPattern = /^(www[0-9]*|[0-9]*)\.?([^\.]+)\.([a-z]{2,})$/;
  const match = currentDomain.match(domainPattern);
  if (match) {
    const prefix = match[1]; // 提取前缀部分，如 "www", "www2", "2", ""

    if (!prefix) {
      // case: siteId.tld
      targetDomain = `www.${currentDomain}`;
    } else if (prefix.startsWith("www")) {
      if (prefix === "www") {
        // case: www.siteId.tld
        targetDomain = currentDomain.substring(4);
      } else {
        // case: wwwx.siteId.tld
        targetDomain = currentDomain.substring(3);
      }
    } else {
      // case: x.siteId.tld
      targetDomain = `www${currentDomain}`;
    }
  } else {
    // 如果不匹配期望的模式，保留当前域名
    targetDomain = currentDomain;
  }

  const protocol = window.location.protocol;

  // 生成新的查询参数字符串
  const queryString = currentParams.toString();
  // return `${targetPath}?${queryString}${queryString ? "&" : ""}from=${encodeURIComponent(from)}`;
  return `${protocol}//${targetDomain}${targetPath}?${queryString}${
    queryString ? "&" : ""
  }from=${encodeURIComponent(from)}`;
}

export function simulateClickLink(url) {
  const link = document.createElement("a");
  link.href = url;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 校验邮箱格式
export function validateEmail(email) {
  // 使用正则表达式验证邮箱格式
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// 在数组中随机取值
export function getRandomValueFromArray(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

// 重新排序
export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // 生成一个随机索引，范围是 [0, i]
    [array[i], array[j]] = [array[j], array[i]]; // 交换当前位置和随机位置的元素
  }
  return array;
}

export function getStarListStyle(scoreNum) {
  const result = [];
  const score = Math.floor(scoreNum * 2) / 2; // 四舍五入到0.5分
  const integer = Math.floor(score);
  const hasDecimal = score % 1 !== 0;
  // 先将on添加到list中
  for (let i = 0; i < integer; i++) {
    result.push("icon-star");
  }
  // 将半选添加到list
  if (hasDecimal) result.push("icon-star-half");
  // 若不满5个，剩下的添加off直到满5个为止
  for (let i = result.length; i < 5; i++) {
    result.push("icon-star-off");
  }
  return result;
}

// 首字母大写
export function capitalizeFirstLetter(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
