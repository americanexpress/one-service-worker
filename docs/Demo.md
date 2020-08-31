# One Service Worker Demo
<!--ONE-DOCS-HIDE start-->
[👈 Go to `README`](../README.md)
<!--ONE-DOCS-HIDE end-->

For convenience, we have a demo project to run for exploring the service worker
and the library. We've bound a few `npm` scripts that can be run to manage the demo.

While on installation, the demo will also be installed.
However if you need to reinstall for any reason, you can run:

```bash
npm run demo:install
```

Then build the demo project by running:

```bash
npm run demo:build
```

## Running the demo

To start the server to run locally:

```bash
npm run demo:start
```

## Dev mode

There is a dev mode available for auto-updating on code change of the library or demo.
To run in this mode:

```bash
npm run dev
```

If you plan on experimenting with the demo app, this mode is a convenience to allow
you to see changes quickly. One thing to note: due to the service worker caching,
we would need to manage the browser and use dev tools to make sure updates are received,
this can be a common point of confusion.

# Notes

- The demo will run on `http://localhost:3030` to avoid any disruptions or interference on port `3000`.
- Web Push will require configuration if you are behind a proxy, or it will most likely fail. Solutions welcome.
