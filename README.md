<div align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://imagedelivery.net/3TbraffuDZ4aEf8KWOmI_w/4a157bda-2a99-4ac3-6bc7-be08b4a46600/public">
  <source media="(prefers-color-scheme: light)" srcset="https://imagedelivery.net/3TbraffuDZ4aEf8KWOmI_w/31447544-b16f-49dd-c206-74b1802c6700/public">
  <img width=200 alt="Trigger.dev logo" src="https://imagedelivery.net/3TbraffuDZ4aEf8KWOmI_w/4a157bda-2a99-4ac3-6bc7-be08b4a46600/public">
</picture>
</div>

</br>
<p align="center">
  <a href="https://console.algora.io/org/triggerdotdev/bounties?status=open"><img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fconsole.algora.io%2Fapi%2Fshields%2Ftriggerdotdev%2Fbounties%3Fstatus%3Dopen" alt="Open Bounties" /></a>
  <a href="https://console.algora.io/org/triggerdotdev/bounties?status=completed"><img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fconsole.algora.io%2Fapi%2Fshields%2Ftriggerdotdev%2Fbounties%3Fstatus%3Dcompleted" alt="Rewarded Bounties" /></a>
</p>

# Brought to you by Trigger.dev

JSON Hero was created and is maintained by the team behind [Trigger.dev](https://trigger.dev). With Trigger.dev you can trigger workflows from APIs, on a schedule, or on demand. We make API calls easy with authentication handled for you, and you can add durable delays that survive server restarts.

# JSON Hero

JSON Hero makes reading and understand JSON files easy by giving you a clean and beautiful UI packed with extra features.

- View JSON any way you'd like: Column View, Tree View, Editor View, and more.
- Automatically infers the contents of strings and provides useful previews
- Creates an inferred JSON Schema that could be used to validate your JSON
- Quickly scan related values to check for edge cases
- Search your JSON files (both keys and values)
- Keyboard accessible
- Easily sharable URLs with path support

![JSON Hero Screenshot](https://imagedelivery.net/3TbraffuDZ4aEf8KWOmI_w/0f5735b3-2421-470b-244c-7047fd77f700/public)

## Architecture

This repository now uses a standard frontend/backend split instead of the previous Remix full-stack setup.

- `frontend/` contains the React 19 single-page application built with Vite and `react-router-dom`.
- `backend/` contains the Express API responsible for document creation, retrieval, preview endpoints, and the public create API.
- In development, the frontend runs on `http://localhost:5173` and proxies `/api` requests to the backend on `http://localhost:13001`.
- In production, the frontend build output is written to `backend/public/spa`, and the backend serves both the API and the compiled SPA.

This separation makes the app easier to reason about, run independently, and deploy in environments where a traditional Node API plus static frontend is preferred.

## Features

### Send to JSON Hero

Send your JSON to JSON Hero in a variety of ways

- Head to [jsonhero.io](https://jsonhero.io) and Drag and Drop a JSON file, or paste JSON or a JSON url in the provided form
- Include a Base64 encoded string of a JSON payload: [jsonhero.io/new?j=eyAiZm9vIjogImJhciIgfQ==](https://jsonhero.io/new?j=eyAiZm9vIjogImJhciIgfQ==)
- Include a JSON URL to the `new` endpoint: [jsonhero.io/new?url=https://jsonplaceholder.typicode.com/todos/1](https://jsonhero.io/new?url=https://jsonplaceholder.typicode.com/todos/1)
- Install the [VS Code extension](https://marketplace.visualstudio.com/items?itemName=JSONHero.jsonhero-vscode) and open JSON from VS Code
- Raycast user? Check out our extension [here](https://www.raycast.com/maverickdotdev/open-in-json-hero)
- Use the unofficial API:

  - Make a `POST` request to `jsonhero.io/api/public/create` with the following JSON body:

  ```json
  {
    "title": "test 123",
    "content": { "foo": "bar" },
    "readOnly": false, // this is optional, will make it so the document title cannot be edited or document cannot be deleted
    "ttl": 3600 // this will expire the document after 3600 seconds, also optional
  }
  ```

  The JSON response will be the following:

  ```json
  {
    "id": "YKKduNySH7Ub",
    "title": "test 123",
    "location": "/j/YKKduNySH7Ub"
  }
  ```

### Column view

Inspired by macOS Finder, Column View is a new way to browse a JSON document.

![JSON Hero Column View](https://raw.githubusercontent.com/triggerdotdev/documentation-hosting/main/images/features-columnview.gif)

It has all the features you'd expect: Keyboard navigation, Path bar, history.

It also has a nifty feature that allows you to "hold" a descendent selected and travel up through the hierarchy, and then move between siblings and view the different values found at that path. It's hard to describe, but here is an animation to help demonstrate:

![Column View - Traverse with Context](https://raw.githubusercontent.com/triggerdotdev/documentation-hosting/main/images/features-traversewithcontext.gif)

As you can see, holding the `Option` (or `Alt` key on Windows) while moving to a parent keeps the part of the document selected and shows it in context of it's surrounding JSON. Then you can traverse between items in an array and compare the values of the selection across deep hierarchy cahnges.

### Editor view

View your entire JSON document in an editor, but keep the nice previews and related values you get from the sidebar as you move around the document:

![Editor view](https://raw.githubusercontent.com/triggerdotdev/documentation-hosting/main/images/features-editorview.gif)

### Tree view

Use a traditional tree view to traverse your JSON document, with collapsible sections and keyboard shortcuts. All while keeping the nice previews:

![Tree view](https://raw.githubusercontent.com/triggerdotdev/documentation-hosting/main/images/features-treeview.gif)

### Search

Quickly open a search panel and fuzzy search your entire JSON file in milliseconds. Searches through key names, key paths, values, and even pretty formatted values (e.g. Searching for `"Dec"` will find datetime strings in the month of December.)

![Search](https://raw.githubusercontent.com/triggerdotdev/documentation-hosting/main/images/features-search.gif)

### Content Previews

JSON Hero automatically infers the content of strings and provides useful previews and properties of the value you've selected. It's "Show Don't Tell" for JSON:

#### Dates and Times

![Preview colors](https://imagedelivery.net/3TbraffuDZ4aEf8KWOmI_w/43f2c081-c09b-47db-cb10-8f15ee6a1a00/public)

#### Image URLs

![Preview colors](https://imagedelivery.net/3TbraffuDZ4aEf8KWOmI_w/8a743bd5-a065-4f7f-1262-585c39c10100/public)

#### Website URLs

![Preview websites](https://imagedelivery.net/3TbraffuDZ4aEf8KWOmI_w/cd7f2d28-2c8d-4b37-696d-e898937c3d00/public)

#### Tweet URLS

![Preview tweets](https://imagedelivery.net/3TbraffuDZ4aEf8KWOmI_w/8455e9d6-1d3e-451e-a032-f3259204ef00/public)

#### JSON URLs

![Preview JSON](https://imagedelivery.net/3TbraffuDZ4aEf8KWOmI_w/13743860-3d9c-4cac-dde9-881fba7eba00/public)

#### Colors

![Preview colors](https://imagedelivery.net/3TbraffuDZ4aEf8KWOmI_w/22e37599-c2bd-4abd-79f2-466241d17b00/public)

### Related Values

Easily see all the related values across your entire JSON document for a specific field, including any `undefined` or `null` values.

![Editor view](https://raw.githubusercontent.com/triggerdotdev/documentation-hosting/main/images/features-relatedvalues.gif)

<!-- TODO -->

## Bugs and Feature Requests

Have a bug or a feature request? Feel free to [open a new issue](https://github.com/changdy/jsonhero-web-node/issues).

You can also join our [Discord channel](https://discord.gg/JtBAxBr2m3) to hang out and discuss anything you'd like.

## Developing

### Requirements

- Node.js `18` or newer
- npm

### Clone and install

Clone the repo and install the frontend and backend dependencies separately:

```bash
git clone https://github.com/changdy/jsonhero-web-node.git
cd jsonhero-web-node
npm install --prefix frontend
npm install --prefix backend
```

The root `package.json` only orchestrates scripts. The runtime dependencies live in `frontend/` and `backend/`.

### Project structure

```text
.
├─ frontend/   # React + Vite SPA
├─ backend/    # Express API and production static hosting
├─ scripts/    # Root development helpers
└─ README.md
```

### Environment variables

No environment variables are required for local development by default. If needed, you can create a root `.env` file and set optional values such as:

```
PORT=13001
```

Notes:

- `PORT` controls the backend port.
- `SERVE_FRONTEND` is enabled automatically by `npm start` and usually does not need to be set manually.
- `NODE_ENV=production` makes the backend serve the compiled SPA.

### Available scripts

- `npm run dev` starts both the backend watcher and the Vite dev server.
- `npm run dev:backend` starts only the Express backend in watch mode.
- `npm run dev:frontend` starts only the Vite frontend.
- `npm run build` builds both frontend and backend production artifacts.
- `npm start` starts the compiled backend and serves the built SPA.

### Development mode

From the repository root, run:

```bash
npm run dev
```

This starts:

- the backend API on `http://localhost:13001`
- the frontend dev server on `http://localhost:5173`

The frontend uses Vite's `/api` proxy in development, so browser requests stay same-origin.

### Production build

Build the production assets from the repository root:

```bash
npm run build
```

This does two things:

- builds the React app into `backend/public/spa`
- compiles the backend TypeScript into `backend/dist`

Then start the production server:

```bash
npm start
```

Then open your browser to `http://localhost:13001`.

### API overview

The backend exposes the following main endpoints:

- `GET /api/docs/:id` fetch a stored document and its parsed JSON
- `GET /api/docs/:id/raw` fetch the raw JSON payload
- `POST /api/docs/:id/update` update a document title
- `DELETE /api/docs/:id` delete a document
- `GET /api/create` create a document from a URL or base64 payload
- `POST /api/create/file` create a document from uploaded raw JSON
- `POST /api/create/url` create a document from a URL or raw JSON text
- `POST /api/public/create` public CORS-enabled document creation endpoint

If you are self-hosting this project, these endpoints replace the old Remix loader/action flow with explicit JSON APIs handled by Express.
