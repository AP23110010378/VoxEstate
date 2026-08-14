# PropVoice — Frontend

React 19 + Vite + TailwindCSS v4 frontend for the PropVoice multi-tenant AI voice platform.

## Stack

- **React 19** with Vite for fast HMR development
- **TailwindCSS v4** for utility-first styling
- **Framer Motion** for smooth page and component animations
- **Lucide React** for icons
- **Axios** for API communication with the FastAPI backend

## Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

Set `VITE_API_URL` environment variable to your backend URL for production:

```
VITE_API_URL=https://your-backend-url.run.app
```
