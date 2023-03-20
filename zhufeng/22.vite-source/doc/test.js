function createPluginContainer({ plugins, root }) {
  const container = {
    resolveId() {
      console.log(plugins);
    },
  };
  return container;
}
const config = {
  plugins: ["plugin1", "plugin2"],
  root: "root1",
};
let pluginContainer1 = createPluginContainer(config);
pluginContainer1.resolveId();
config.plugins = ["pluginA", "pluginB"];
let pluginContainer2 = createPluginContainer(config);
pluginContainer2.resolveId();
