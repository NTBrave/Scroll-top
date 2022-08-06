import smoothscroll from "smoothscroll-polyfill";
/**
 * @description: 平滑的滚动到滚动区域的顶部
 * @method moveToTop
 * @param { HTMLElement } el 滚动区域元素
 * @param { HTMLElement } firstChild 滚动区域的第一个子元素
 */
 export function moveToTop(el, firstChild) {
  if (el.scrollTop === 0) return;
  if (
    typeof window.getComputedStyle(document.body).scrollBehavior === "undefined"
  ) {
    easeout(el.scrollTop, 0, 5, function (val) {
      el.scrollTop = val;
    });
  } else {
    /** 法1：子元素 + 插件 + scrollIntoView参数 */
    smoothscroll.polyfill();
    firstChild.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });

    /** 法2：子元素 + scrollIntoView无参数 + 样式scroll-behavior: smooth; */
    // firstChild.scrollIntoView();

    /** 法3：scrollTop + 样式scroll-behavior: smooth;*/
    // el.scrollTop = 0;
  }
}
/**
 * 缓冲函数
 * @param {Number} position 当前滚动位置
 * @param {Number} destination 目标位置
 * @param {Number} rate 缓动率
 * @param {Function} callback 缓动结束回调函数 两个参数分别是当前位置和是否结束
 */
 export var easeout = function (position, destination, rate, callback) {
  if (position === destination || typeof destination !== "number") {
    return false;
  }
  destination = destination || 0;
  rate = rate || 2;

  // 不存在原生`requestAnimationFrame`，用`setTimeout`模拟替代
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (fn) {
      return setTimeout(fn, 17);
    };
  }

  var step = function () {
    position = Math.floor(position + (destination - position) / rate);
    if (Math.abs(destination - position) < 1) {
      callback(destination, true);
      return;
    }
    callback(position, false);
    requestAnimationFrame(step);
  };
  step();
};

/**
 * @description: 回到顶部的缓冲函数 
 * @method stepScroll 
 * @param { HTMLElement } el 滚动区域元素
 */
 export const stepScroll = (el) => {
  const timer = setInterval(() => {
    const moveHeight = Math.floor(
      el.scrollTop < 100 ? 0 : (el.scrollTop / 5) * 4
    );
    el.scrollTop = moveHeight;
    moveHeight === 0 && clearInterval(timer);
  }, 17);
};

