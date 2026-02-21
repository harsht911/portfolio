# 🚀 Professional Deployment Guide

This document explains how to use the automated **Deployment Hub** built into your Admin CMS.

## 🏗️ The One-Click Workflow
The portfolio is equipped with a custom "CI/CD Bridge" that allows you to trigger production deployments directly from your browser (Admin Console).

### 1. Start the Deployment Bridge
Since a browser cannot run terminal commands directly for security, you must run the bridge service on your local computer first:

```powershell
npm run bridge
```
*Leave this terminal window open.* It will show `🚀 Deployment Bridge is running on http://localhost:9000`.

### 2. Access the Admin CMS
1. Go to your portfolio URL (localhost or production).
2. Append `#admin` to the URL.
3. Login with your secure PIN.

### 3. Trigger a Deployment
1. Navigate to the **Deployment Hub** in the sidebar.
2. Click the blue **🚀 Deploy to Production** button at the top.
3. **Version**: Enter the new version (e.g., `1.0.2`). This will automatically update your `package.json`.
4. **Release Notes**: Mention what changed (e.g., "Improved mobile responsiveness").

### 4. What happens automatically?
Once you click "OK":
- The system runs `npm run build` to create a fresh production bundle.
- It copies all static assets (images, PDFs) to the `dist` folder.
- It runs `npx firebase deploy` to push the site live to Firebase.
- **Release History**: After a successful push, a new record is automatically saved in your **Deployment Hub** with the date, status, and your notes.

---

## 🛠️ Manual Terminal Deployment (Fallback)
If you prefer the command line, you can still deploy manually:

```powershell
# Build and deploy in one go
npm run deploy
```

## 📋 Prerequisites
- Ensure you are logged into Firebase in your terminal (`npx firebase login`).
- Ensure the `npm run bridge` is active for CMS-based deployments.
