import "./App.css";
import smoothscroll from 'smoothscroll-polyfill';
import {moveToTop, stepScroll} from "./util";
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
    moveToTop(appRef.current,firstItem.current);
    // stepScroll(appRef.current);
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
