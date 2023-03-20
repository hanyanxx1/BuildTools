import "./style.css";

export const render = () => {
  const app = document.querySelector<HTMLDivElement>("#app")!;
  app.innerHTML = `
    <h1>Hello Vite!</h1>
    <p target="_blank">This is hmr test.123 bbbb</p>
  `;
};

// if (import.meta.hot) {
//   import.meta.hot.accept((mod) => {
//     console.log(mod);
//     mod.render();
//   });
// }
