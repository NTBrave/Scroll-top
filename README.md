## 效果展示：
[点击查看【codepen】](https://codepen.io/NTBrave/embed/YzaLaMz?editors=0110)
（不使用没有引入第三方依赖）

---

### 重点
[**scroll-behavior**](https://developer.mozilla.org/zh-CN/docs/Web/CSS/scroll-behavior)：滚动区域非用户手动触发滑动的时候，滚动过程中的样式；浏览器兼容性不太好；
[**scrollIntoView(**)](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/scrollIntoView)：元素自带的api，可以到达滚动区域可见位置；

- 不加参数的兼容性较好，这样要设置样式scroll-behavior: smooth;
- 加了参数兼容性不好，但是可以不用谢上述样式。要兼容性更好的话，需要引入插件smoothscroll-polyfill

**scrollTop**：属性可以获取或设置一个元素的内容垂直滚动的像素数；

- 兼容性好，但是要加缓冲函数才能优雅；

---

## 实现思路
> 1. 滚动区域加上scroll-behavior: smooth;属性；
> 1. 判断当前浏览器是否支持scrollBehavior样式属性；
> 1. 如果支持直接用原生滚动api Element.scrollIntoView()或scrollTop
> - 如果不支持则用js小缓冲算法兼容处理。


---

### 只考虑怎么实现平滑滚动：（不加scroll样式）
> ### 不能直接去到目的地，分成一段一段的路程，分步走。

- 定时器循环设置目的地位置
- 距离顶部还有100的时候，直接设置为目的地为0；
- 目的为0时停止定时器
```javascript
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
```
```javascript
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
```
### 
加上scroll-behavior样式并确定样式肯定生效
**法1**：拿到第一个子元素，并使用scrollIntoView无参数写法（兼容性好）；
```javascript
firstChild.scrollIntoView();
```
法2：不用子元素参与，滚动区域自己回到顶部；
```javascript
el.scrollTop = 0;
```
### 加上scroll-behavior样式，并考虑兼容性
使用smoothscroll-polyfill插件
> npm install smoothscroll-polyfill --save
> import smoothscroll from 'smoothscroll-polyfill'
> smoothscroll.polyfill(); 

```javascript
smoothscroll.polyfill();
firstChild.scrollIntoView({
	behavior: "smooth",
	block: "end",
	inline: "nearest",
    });
```
### 最简单方法，可以不加样式设置
在研究ant中置顶的实现方式发现，他们是自己写的缓动方案。同时也发现了一个相关的依赖包，研究发现简单高效。
> 使用[scroll-into-view-if-needed依赖](https://github.com/stipsan/scroll-into-view-if-needed)
> npm i scroll-into-view-if-needed --save
> npm i smooth-scroll-into-view-if-needed --save

```javascript

import scrollIntoView from "scroll-into-view-if-needed";
import smoothScrollIntoView from "smooth-scroll-into-view-if-needed";
/**
 * @description: 使用ant中有用到的scroll-into-view-if-needed依赖包
 * @method scrollIntoViewIfNeeded
 * @param { HTMLElement } firstChild 滚动区域的第一个子元素
 */
export const scrollIntoViewIfNeeded = (firstChild) => {
  const scrollIntoViewSmoothly =
    "scrollBehavior" in document.documentElement.style
      ? scrollIntoView
      : smoothScrollIntoView;

  scrollIntoViewSmoothly(firstChild, { behavior: "smooth" });
};
```
```javascript
import smoothScrollIntoView from 'smooth-scroll-into-view-if-needed'

smoothScrollIntoView(node, { behavior: 'smooth' })
```
## 封装工具函数：
```javascript
import smoothscroll from "smoothscroll-polyfill";
import scrollIntoView from "scroll-into-view-if-needed";
import smoothScrollIntoView from "smooth-scroll-into-view-if-needed";
/**
 * @description: 平滑的滚动到滚动区域的顶部
 * @method moveToTop
 * @param { HTMLElement } el 滚动区域元素
 * @param { HTMLElement } firstChild 滚动区域的第一个子元素
 */
export function moveToTop(el, firstChild) {
  if (el.scrollTop === 0) return;
  if ("scrollBehavior" in document.documentElement.style) {
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
  } else {
    easeout(el.scrollTop, 0, 5, function (val) {
      el.scrollTop = val;
    });
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

/**
 * @description: 使用ant中有用到的scroll-into-view-if-needed依赖包
 * @method scrollIntoViewIfNeeded
 * @param { HTMLElement } firstChild 滚动区域的第一个子元素
 */
export const scrollIntoViewIfNeeded = (firstChild) => {
  const scrollIntoViewSmoothly =
    "scrollBehavior" in document.documentElement.style
      ? scrollIntoView
      : smoothScrollIntoView;

  scrollIntoViewSmoothly(firstChild, { behavior: "smooth" });
};

```
## 测试代码：
内容比较杂，方案很多，选择合适的拿来就用。
```javascript
import "./App.css";
import smoothscroll from "smoothscroll-polyfill";
import { moveToTop, stepScroll, scrollIntoViewIfNeeded } from "./util";
import { useEffect, useState, useRef, useCallback } from "react";
function App() {
  const [list, setList] = useState([]);
  const appRef = useRef(null);
  const firstItem = useRef(null);
  const lastItem = useRef(null);

  /** 循环生成30条 */
  useEffect(() => {
    list.length < 30 &&
      setTimeout(() => {
        setList([...list, { name: `新闻信息--${list.length + 1}` }]);
      }, 10);
  }, [list]);

  const btnClick = useCallback(() => {
    /** 法1：判断是否支持滚动平滑样式+ 手撸的缓动函数。
     *  兼容好，质量高，但要加依赖
     * */
    // moveToTop(appRef.current, firstItem.current);

    /** 法2：啥也不管，手撸第一。
     *  简单，兼容好，但是质量不高 
     * */
    // stepScroll(appRef.current);

    /** 法3： 判断是否支持滚动平滑样式+依赖包 
     *  兼容好，质量高，加依赖
    */
    scrollIntoViewIfNeeded(firstItem.current);
  }, []);

  const goFirst = useCallback(() => {
    smoothscroll.polyfill();
    firstItem.current.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  }, []);

  const goLast = useCallback(() => {
    smoothscroll.polyfill();
    lastItem.current.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  }, []);

  return (
    <>
      <div className="btn">
        <button onClick={btnClick}>回到顶部</button>
        <button onClick={goFirst}>第一条</button>
        <button onClick={goLast}>末尾一条</button>
      </div>
      <div className="App" ref={appRef}>
        {list.map((item, index) => {
          return (
            <div
              key={item.name}
              ref={
                (index === 0 && firstItem) ||
                (index === list.length - 1 && lastItem) ||
                null
              }
              className="news"
            >
              {item.name}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default App;

```
```less
.App {
  text-align: center;
  height: 400px;
  width: 300px;
  justify-content: center;
  overflow: auto;
  scroll-behavior: smooth;
}
.btn {
  height: 50px;
  display: flex;
  justify-content: space-around;
}

.news {
  height: 44px;
  margin: 2px 0 ;
  border: 1px solid rebeccapurple;
  background-color: skyblue;
}

```


## 打包体积分析：
smoothscroll-polyfill 打包之后是1.19kB
scroll-into-view-if-needed+smooth-scroll-into-view-if-needed是1.65kB
只用smooth-scroll-into-view-if-needed是1.64kB

---

> 参考：
https://juejin.cn/post/7026274240349339685
https://segmentfault.com/a/1190000016839122

