import { showLoader, scrollToBottom } from "./common.js";
import { getResultAndRender } from "./api.js";

const $output = document.querySelector(".Messages_list");
const appendUserMessage = (question) => {
  document.querySelector(".defaultText").style.display = "none";
  $output.insertAdjacentHTML(
    "beforeend",
    `
  <div class="user-messages">
      <div class="user-selected-question">${question}</div>
  </div>
  `,
  );
  document.querySelector("[name='question']").value = "";
  showLoader($output);
  scrollToBottom();
};

document
  .querySelector("#search-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    appendUserMessage(formData.get("question"));
    await getResultAndRender(formData, $output);
  });
