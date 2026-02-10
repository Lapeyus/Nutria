<div align="center">
<img width="1200" height="475" alt="Nutria Logo Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 🦦 Nutria - Nutrición IA
### *Asistente Inteligente de Alimentación*

[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)

</div>

---

## 🌟 Overview

**Nutria** (de la combinación *Nutrición* + *IA*) es una aplicación web inteligente diseñada para simplificar el seguimiento nutricional. Aprovechando el poder de **Google Gemini 1.5 Flash**, permite a los usuarios simplemente tomar una foto de su plato y recibir un desglose completo en segundos.

Tailored specifically with a **Costa Rican culinary context**, Nutria recognizes local dishes—like *Gallo Pinto* or *Casados*—providing accurate portion estimates and food group breakdowns based on regional diet patterns.

## ✨ Key Features

- 📸 **Visual Recognition**: Upload or take a photo of your meal for instant identification.
- 🥘 **Local Context**: Specialized recognition for Costa Rican cuisine and terminology.
- 📊 **Nutritional Breakdown**:
    - **Estimated Calories**: Total calorie count per portion.
    - **Portion Estimation**: Approximate weight or volume (e.g., "1 cup", "200g").
    - **Food Group Mapping**: Automatic breakdown into *Harinas (Carbs)*, *Vegetales*, *Proteínas*, *Frutas*, and *Grasas*.
    - **Ingredient List**: Detection of primary ingredients.
- 🕒 **Smart Timestamps**: Automatically extracts the time the meal was taken from EXIF metadata.
- 👤 **User Management**: Personal accounts with username/password support.
- 📂 **Multi-User Google Sheets**: Each user gets their own dedicated sheet (tab) in the master Google Sheet for organized tracking.
- 🌗 **Responsive Design**: Modern, glassmorphic UI with full Dark Mode support.

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (PostCSS version)
- **AI Engine**: Google Generative AI (Gemini 2.5 Flash)
- **Persistence**: Google Apps Script (Web App) + Google Sheets
- **Deployment**: GitHub Pages via GitHub Actions

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS version recommended)
- A [Google AI Studio API Key](https://aistudio.google.com/app/apikey)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Lapeyus/Nutria.git
   cd Nutria
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env.local` file in the root directory and add your Gemini API Key:
   ```env
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

---

## 📊 Google Sheets (Multi-User) Setup

To enable saving to Google Sheets with dedicated user tabs:

1. Create a new **Google Sheet**.
2. Go to **Extensions** > **Apps Script**.
3. Copy the content of the `GoogleAppsScript.gs` file from this project and paste it into the script editor.
4. Click **Deploy** > **New Deployment**.
5. Select **Web App**.
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Copy the **Web App URL**.
7. In `App.tsx`, update the `GOOGLE_SHEET_URL` constant with your new URL.

---

## 💰 Análisis de Costos

Nutria está optimizada para ser extremadamente económica gracias al uso de los modelos **Flash** de Google. A continuación, un desglose estimado de los costos operativos por usuario:

### Estimación por Ejecución (1 Imagen)
| Concepto | Cantidad Est. | Costo (USD) |
| :--- | :--- | :--- |
| **Tokens de Entrada** (Prompt + Imagen) | ~600 tokens | $0.000045 |
| **Tokens de Salida** (JSON estructurado) | ~400 tokens | $0.000120 |
| **Total por imagen** | **1,000 tokens** | **$0.000165** |

### Proyección por Usuario (6 ejecuciones diarias)
*   **Costo diario:** ~$0.001 USD (una décima parte de un centavo).
*   **Costo mensual (30 días):** **~$0.03 USD** (aprox. 18 colones costarricenses).

*Nota: Estos cálculos se basan en la tarifa de Cloud Pay-as-you-go. El nivel gratuito (Free Tier) de Google AI Studio permite hasta 1,500 ejecuciones diarias sin costo, lo que hace que la app sea prácticamente gratuita para uso personal y pequeños grupos.*

---

## 🌐 Deployment

### GitHub Pages

This project is pre-configured for automated deployment via GitHub Actions.

1. **Enable GitHub Pages**: Settings → Pages → Build and deployment → Source: **GitHub Actions**.
2. **Add Secret**: Settings → Secrets and variables → Actions → **New repository secret**.
   - Name: `VITE_GEMINI_API_KEY`
   - Value: Your Gemini API Key.
3. **Push to Main**: Any push to the `main` branch will automatically trigger a new deployment.

### Manual Build

To generate the production bundle locally:
```bash
npm run build
```
The output will be available in the `dist/` directory.

---

## 📝 License

This project is for educational and personal use. Built with ❤️ for better nutrition.

---
*View in AI Studio:* [Nutria App](https://ai.studio/apps/drive/1nxyCHyFf0bXtWMiKK8OaZ9M4ZwbrpFoU)
