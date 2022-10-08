const ORIENTATION_VERTICAL = "vertical";
const ORIENTATION_HORIZONTAL = "horizontal";

const PROP_ORIENTATION = "--list-orientation";

function CustomListInner({ orientation }) {
  if (![ORIENTATION_VERTICAL, ORIENTATION_HORIZONTAL].includes(orientation)) {
    orientation = ORIENTATION_VERTICAL;
  }

  let message = null;
  switch (orientation) {
    case ORIENTATION_VERTICAL: {
      message = "Vertical";
      break;
    }
    case ORIENTATION_HORIZONTAL: {
      message = "Horizontal";
      break;
    }
  }

  return React.createElement("p", null, `${message} (debug: ${orientation})`);
}

class CustomList extends HTMLElement {
  constructor() {
    super();

    this.orientation = undefined;
  }

  connectedCallback() {
    const shadowRoot = this.attachShadow({ mode: "closed" });

    // TODO: Can a MutationObserver detect when computed styles changes?
    // Ref: https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
    // Option A) Using MutationObserver to watch the full document: https://dev.to/oleggromov/observing-style-changes---d4f
    // Option B) Tie into whatever is altering the DOM (eg, react) and get notified of updates to recalculate style.
    //      Infinite loop risk: DOM change => style change => (within this element) DOM change => style change ...
    //      So it seems altering the dom based on style rules is precarious.
    //      However, is this the goal of the shadow dom? Style on current element cannot change due to adjustments within shadow boundary.

    this.styles = window.getComputedStyle(this);
    this.reactRoot = ReactDOM.createRoot(shadowRoot);

    this.update();
  }

  adoptedCallback() {
    this.update();
  }

  attributeChangedCallback() {
    this.update();
  }

  update() {
    let orientation = this.styles.getPropertyValue(PROP_ORIENTATION)?.trim();
    console.info(`[updateStyles] orientation:`, orientation);

    this.reactRoot.render(
      React.createElement(CustomListInner, { orientation }, null)
    );
  }
}

function Hello({ name }) {
  return React.createElement("h1", null, `Hello, ${name}!`);
}

function VerticalList() {
  const list = React.createElement("custom-list", null, null);

  return React.createElement("div", { className: "vertical-list" }, list);
}

function HorizontalList() {
  const list = React.createElement("custom-list", null, null);

  return React.createElement("div", { className: "horizontal-list" }, list);
}

function Lists() {
  const children = [
    React.createElement(VerticalList, { key: "vertical-example" }, null),
    React.createElement(HorizontalList, { key: "horizontal-example" }, null),
  ];

  return React.createElement("div", { className: "lists-container" }, children);
}

function main() {
  window.customElements.define("custom-list", CustomList);

  const $root = document.getElementById("root");
  const root = ReactDOM.createRoot($root);
  root.render(React.createElement(Lists, null, null));
}

main();
