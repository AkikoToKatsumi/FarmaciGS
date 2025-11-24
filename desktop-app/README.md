# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:


## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

## Packaging and database initialization

When you build the desktop application (`electron-builder`), the initial SQLite schema file `database/farmacia_sqlite.sql` is included in the packaged resources.

- On first run the app will create a writable database file at the user's application data folder (Electron's `app.getPath('userData')`) named `farmacia.db` by executing the SQL statements from the shipped `farmacia_sqlite.sql`.
- This behaviour is implemented in `electron/main.js` (method `ensureDatabaseExists`).

To build a Windows installer and produce the distributable, run from `desktop-app`:

```powershell
npm install
npm run build
npm run electron:dist
```

The generated installer will copy the `database` folder into the application resources; on first run the app will initialize the local `farmacia.db` in the user data directory so it is writable and persists across updates.
