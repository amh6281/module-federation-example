export const customPlugin = {
  name: "custom-plugin",
  apply: "build",
  configResolved() {
    console.log("configResolved");
  },
};
