import { mount } from "@vue/test-utils";
const MessageComponent = {
  template: "<p>{{ msg }}</p>",
  props: ["msg"],
};
test("displays message", () => {
  const wrapper = mount(MessageComponent, {
    props: {
      msg: "Hello world",
    },
  });
  expect(wrapper.text()).toContain("Hello world");
});
