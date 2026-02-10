# 🗝️ Fixing the "API Key is not set" Error

The error you are seeing on `https://nutria.kerewes.com/` happens because the GitHub Action that builds and deploys your site does not have access to your Gemini API Key.

Unlike your local development environment where you use `.env.local`, GitHub Actions needs the key stored as a **Repository Secret**.

## Steps to Fix

1.  **Go to your GitHub Repository**:
    -   Navigate to [https://github.com/Lapeyus/Nutria](https://github.com/Lapeyus/Nutria)

2.  **Open Settings**:
    -   Click on the **Settings** tab at the top.

3.  **Navigate to Secrets**:
    -   On the left sidebar, scroll down to **Secrets and variables**.
    -   Click on **Actions**.

4.  **Add a New Secret**:
    -   Click the green **New repository secret** button.
    -   **Name**: `VITE_GEMINI_API_KEY`
    -   **Secret**: [Paste your actual Google Gemini API Key here]
    -   Click **Add secret**.

5.  **Trigger a New Deployment**:
    -   Go to the **Actions** tab.
    -   Select the most recent workflow run (or simply make a small commit to `main` to trigger a new build).
    -   Once the new build completes, the site at `https://nutria.kerewes.com/` will have the key baked in and the error will disappear.

## Why this happens?
The `vite build` command replaces `import.meta.env.VITE_GEMINI_API_KEY` with the actual key value during the build process. If the environment variable isn't present during the GitHub Action build (which runs in the cloud), the value remains `undefined`, triggering the error in your code.
