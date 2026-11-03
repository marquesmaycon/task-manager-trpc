// Next.js 15 only ships types for CSS Modules (*.module.css). Newer TypeScript
// versions (such as the one bundled with VS Code) check side-effect imports
// like `import "./globals.css"` by default, so we declare plain CSS files here.
declare module "*.css";
