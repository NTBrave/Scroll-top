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
        <div>{String("scrollBehavior" in document.documentElement.style)}</div>
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
