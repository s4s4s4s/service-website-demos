# Clearroom in Astro

An Astro port of the [Clearroom cleaning demo](https://s4s4s4s.github.io/service-website-demos/clearroom.html). The build keeps the `/clearroom.html` route, page layout and local estimate calculator. Service copy and base prices live in `src/services.json`, which feeds both the service list and the form.

With Node.js 24, run `npm ci`, `npm run build` and `npm run preview`. Open `/clearroom.html` on the preview server.

Clearroom is fictional. The calculator shows sample prices and doesn't submit a request.
