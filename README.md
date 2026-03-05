# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

### Environment variables

The frontend now supports Google OAuth. To enable the Google button you must supply your OAuth client ID:

```text
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

The frontend will POST the credential to `${VITE_DEV_URI}users/google` (not `/auth/google`).

Put this in your `.env` (and `.env.production` if deploying) so that `import.meta.env.VITE_GOOGLE_CLIENT_ID` is available to the application.
