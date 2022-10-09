const { useEffect, useState } = React;

const ORIENTATION_VERTICAL = "vertical";
const ORIENTATION_HORIZONTAL = "horizontal";

const PROP_ORIENTATION = "--list-orientation";

/**
 * MutationObservers are used to monitor changes to each DOM (including both Document and shadow DOMs).
 * A global set of observers is used to avoid creating an observer per custom element instance which could
 * lead to a combinatorial explosion of events on each change.
 * This design still holds some risk as we end up with a single listener callback per custom element. The
 * hope is the callback overhead will be kept minimal by:
 * 1. Callbacks are only fired for changes to the element's on subtree.
 * 2. Keeping callbacks very cheap in the normal case (ie, when a mutation does not effect the element)
 */
const observers = {};
const listenerGroups = {};

const initObserver = (root) => {
  if (root in observers) {
    return;
  }

  const observer = new MutationObserver(getGroupNotifier(root));
  observer.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
  });
  observers[root] = observer;
};

const getListenerGroup = (root) => {
  if (root in listenerGroups) {
    return listenerGroups[root];
  }

  const group = [];
  listenerGroups[root] = group;
  return group;
};

const getGroupNotifier = (root) => () => {
  const group = getListenerGroup(root);
  for (const callback of group) {
    callback();
  }
};

const addListener = (root, callback) => {
  const group = getListenerGroup(root);
  group.push(callback);
};

const observe = (root, callback) => {
  initObserver(root);
  addListener(root, callback);
};

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

    // Attach listener
    const treeRoot = this.getRootNode();
    observe(treeRoot, () => this.update());

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

function DemoList({ vertical }) {
  let className = "horizontal-list";
  if (vertical) {
    className = "vertical-list";
  }

  const list = React.createElement("custom-list", null, null);

  return React.createElement("div", { className }, list);
}

function DemoContainer() {
  const [tick, setTick] = useState(true);

  // Tick-tocks every second
  useEffect(() => {
    setTimeout(() => setTick(!tick), 1000);
  }, [tick]);

  const list = React.createElement(DemoList, { vertical: tick }, null);

  return React.createElement("div", null, list);
}

function main() {
  window.customElements.define("custom-list", CustomList);

  const $root = document.getElementById("root");
  const root = ReactDOM.createRoot($root);
  root.render(React.createElement(DemoContainer, null, null));
}

main();
