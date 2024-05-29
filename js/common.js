/* globals TableToExcel */
export const showLoader = (div) => {
  div.insertAdjacentHTML(
    "beforeend",
    `
      <div class="typingDots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `,
  );
  document.querySelector("button[type='submit']").classList.add("disabled");
};

export const hideLoader = () => {
  const loaderContainer = document.querySelector(".typingDots");
  if (loaderContainer) {
    loaderContainer.remove();
  }
  document.querySelector("button[type='submit']").classList.remove("disabled");
};

export const scrollToBottom = () => {
  document.querySelector(".Messages_list").lastElementChild.scrollIntoView({
    behavior: "smooth",
    block: "end",
  });
};

export const addExcelButtonListener = (button) => {
  button.addEventListener("click", () => {
    let table = button.closest("div").querySelector("table");
    TableToExcel.convert(table);
  });
};
