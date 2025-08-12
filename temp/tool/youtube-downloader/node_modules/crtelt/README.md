# crtElt

Utility to create DOM Element

## Install

```txt
npm install crtelt
# or
yarn add crtelt
```

Import with script tag

```html
<script src="node_modules/crtelt/dist/index.min.js"></script>
<!-- or -->
<script src="https://cdn.jsdelivr.net/npm/crtelt@latest/dist/index.min.js"></script>
```

Import as module

```javascript
import crtElt from "crtelt";
```

## Usage

```js
crtElt(nodeName, attributes, children);
```

### nodeName:

Name of the tag. Use `fragment` to create document fragment.

### attributes:

Attributes to set.

**events:**

Object of events.

Pass event listener or array of event listener and options.\
Check examples for details.

**dataset:**

Object of dataset.

**style:**

Object of styles.\
You can use CSS variables too.

**class:**

String of element's class names.\
You can use both `className` and `class` to set class names.

**And all the other attributes of the element**

### children:

You can pass string, document fragment, element, undefined, null.\
It'll be appended if it's truthy.

## Examples

### Creating an element

```ts
const Element = crtElt(
    "div",
    { className: "element" },
    crtElt("span", { className: "element__child" }, "foo"),
    crtElt("span", { className: "element__child" }, "bar")
);
```

### Adding event listeners

```ts
function Textarea() {
    return crtElt("textarea", {
        className: "textarea",
        placeholder: "Type some text",
        ariaLabel: "Type some text",
        rows: 2,
        events: {
            change({ target }) {
                if (!(target instanceof HTMLTextAreaElement)) {
                    return;
                }

                console.log(target.value);
            },
            click: [
                () => {
                    console.log("You clicked it");
                },
                { once: true },
            ],
        },
    });
}
```

### Adding styles

```ts
const Element = crtElt(
    "div",
    {
        className: "element",
        style: {
            width: `${Math.log(window.innerWidth)}px`,
            "--color": `${getRandomHexColor()}`,
        },
    },
    crtElt("span", { className: "element__child" }, "foo"),
    crtElt("span", { className: "element__child" }, "bar")
);
```
