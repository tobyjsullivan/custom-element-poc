const ORIENTATION_VERTICAL = "vertical";
const ORIENTATION_HORIZONTAL = "horizontal";

const PROP_ORIENTATION = "--list-orientation";

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

    this.textBlock = document.createElement("p");
    shadowRoot.appendChild(this.textBlock);

    this.styles = window.getComputedStyle(this);

    this.update();
  }

  adoptedCallback() {
    this.update();
  }

  attributeChangedCallback() {
    this.update();
  }

  setOrientation(orientation) {
    if (orientation === this.orientation) {
      // No change
      return;
    }

    this.orientation = orientation;

    console.info(`[setOrientation] orientation:`, orientation);
    switch (this.orientation) {
      case ORIENTATION_VERTICAL: {
        this.textBlock.innerHTML = "Vertical";
        break;
      }
      case ORIENTATION_HORIZONTAL: {
        this.textBlock.innerHTML = "Horizontal";
        break;
      }
    }
  }

  update() {
    let orientation = this.styles.getPropertyValue(PROP_ORIENTATION)?.trim();
    console.info(`[updateStyles] orientation:`, orientation);

    if (![ORIENTATION_VERTICAL, ORIENTATION_HORIZONTAL].includes(orientation)) {
      orientation = ORIENTATION_VERTICAL;
    }

    this.setOrientation(orientation);
  }
}

window.customElements.define("custom-list", CustomList);
