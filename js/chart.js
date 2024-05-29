/* globals d3 */
import { scrollToBottom } from "./common.js";

export const createChart = (data, container) => {
  data = data.filter((_, index) => index < data.length - 1);
  if (data.length > 1) columnValidation(data, container);
};

export const columnValidation = (data, container) => {
  const segregateColumns = (data) => {
    if (data.length === 0) return { categorical: [], numerical: [] };

    const firstRow = data[0];
    const categorical = [];
    const numerical = [];

    Object.keys(firstRow).forEach((key) => {
      if (typeof firstRow[key] === "number") {
        numerical.push(key);
      } else {
        categorical.push(key);
      }
    });

    return { categorical, numerical };
  };

  const { categorical, numerical } = segregateColumns(data);

  if (categorical.length > 0 && numerical.length > 0) {
    container.insertAdjacentHTML(
      "beforeend",
      "<p class='py-2 m-0'>Please select one categorical and one numerical column to view a chart</p>",
    );
    const createRadiobuttons = (columns, category, id) => {
      const categoryHTML = `
    <div class="${category}-columns">
      <h5>${category.charAt(0).toUpperCase() + category.slice(1)} Columns</h5>
      ${columns
        .map(
          (col) => `
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="flexRadioDefault${category}${id}" value="${col}" id="${category}+${col}">
          <label class="form-check-label" for="${category}+${col}${id}">${col}</label>
        </div>`,
        )
        .join("")}
    </div>
  `;

      container.insertAdjacentHTML("beforeend", categoryHTML);
    };

    createRadiobuttons(categorical, "categorical", container.id);
    createRadiobuttons(numerical, "numerical", container.id);

    container.insertAdjacentHTML(
      "beforeend",
      `<button class='btn btn-sm btn-primary w-25' id='drawChartBtn-${container.id}' style='display:none'>Draw chart </button>`,
    );

    const button = container.querySelector(`#drawChartBtn-${container.id}`);
    const updateButtonVisibility = () => {
      const checkedRadiobuttons = container.querySelectorAll(
        "input.form-check-input:checked",
      );
      if (checkedRadiobuttons.length === 2) {
        button.style.display = "block";
        scrollToBottom();
      } else {
        button.style.display = "none";
      }
    };

    container.querySelectorAll("input.form-check-input").forEach((checkbox) => {
      checkbox.addEventListener("change", updateButtonVisibility);
    });

    button.addEventListener("click", () => {
      drawChart(
        data,
        Array.from(
          container.querySelectorAll('input[type="radio"]:checked'),
        ).map((el) => el.id),
        container,
      );
      scrollToBottom();
    });
  } else {
    container.insertAdjacentHTML(
      "beforeend",
      "<p>NOTE: Not enough data to create a chart. Please ensure there is at least one categorical and one numerical column.</p>",
    );
  }
};

const drawChart = (data, cols, container) => {
  container.querySelectorAll("svg").forEach((svg) => svg.remove());
  const margin = { top: 20, right: 30, bottom: 70, left: 70 },
    width = 400 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

  const xCol = cols.find((col) => col.includes("categorical")).split("+")[1];
  const yCol = cols.find((col) => col.includes("numerical")).split("+")[1];

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3
    .scaleBand()
    .domain(data.map((d) => d[xCol]))
    .range([0, width])
    .padding(0.2);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d[yCol])])
    .nice()
    .range([height, 0]);

  svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(
      d3.axisBottom(x).tickFormat(function (d) {
        const item = data.find((item) => item[xCol] === d);
        if (!item || !item[xCol]) return "";
        const text = item[xCol];
        return text.length > 10 ? text.substring(0, 5) + "..." : text;
      }),
    )
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg.append("g").call(
    d3.axisLeft(y).ticks(5),
    // .tickFormat(function (d, i) {
    //   if (data[i] && "formatted_Total_Revenue" in data[i]) {
    //     return data[i].formatted_Total_Revenue;
    //   }
    // }),
  );
  svg
    .selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d[xCol]))
    .attr("y", (d) => y(d[yCol]))
    .attr("width", x.bandwidth())
    .attr("height", (d) => height - y(d[yCol]));
};
