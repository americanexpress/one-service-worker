# One Service Worker Demo

[👈 Go to `README`](../../README.md)

The package here is a demo built around the `@americanexpress/one-service-worker` library.

## 🤹‍ Usage

### Installation

To install, we can run:

```bash
npm install
```

## 📜 Available Scripts

**`npm run build`**

Runs `rollup` to bundle and uses`babel` to compile `src` files to transpiled JavaScript using
[`babel-preset-amex`][babel-amex].

**`npm start`**

Runs the demo locally.

**`npm dev`**

Runs the demo locally in watch mode.

**`npm test`**

Runs unit tests **and** verifies the format of all commit messages on the current branch.

#### Notes

- The demo will run on `http://localhost:3030` to avoid any disruptions or interference on port `3000`.
- Web Push will require configuration if you are behind a proxy, or it will most likely fail.
