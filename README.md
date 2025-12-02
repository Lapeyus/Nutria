<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1nxyCHyFf0bXtWMiKK8OaZ9M4ZwbrpFoU

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

This project is configured to automatically deploy to GitHub Pages using GitHub Actions.

### Setup Instructions:

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Setup GitHub Pages deployment"
   git push origin main
   ```

2. **Enable GitHub Pages** in your repository:
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under "Build and deployment", select **Source**: "GitHub Actions"

3. **Add your Gemini API Key as a secret**:
   - In your repository, go to **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `GEMINI_API_KEY`
   - Value: Your Gemini API key
   - Click **Add secret**

4. **Trigger deployment**:
   - The workflow will automatically run on every push to the `main` branch
   - Or manually trigger it from the **Actions** tab

Your app will be available at: `https://[your-username].github.io/Nutria/`

### Manual Build

To build locally:
```bash
npm run build
```

The built files will be in the `dist` directory.
