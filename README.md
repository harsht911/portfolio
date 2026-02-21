# Harsh Thakkar - Portfolio

A modern, multi-page portfolio website built with **React Native Web** showcasing mobile application development expertise.

## 🚀 Features

- **Dynamic CMS**: Manage all site content via a secure, private Admin Dashboard
- **Firebase Integration**: Real-time content updates for skills, projects, and experiences
- **Multi-Page Navigation**: Home, Skills, Experience, Projects, and Contact pages
- **Animated Code Background**: Floating Android code snippets and symbols
- **Fully Responsive**: Works seamlessly on desktop, tablet, and mobile
- **Modern Tech Stack**: React Native Web powered by Firebase Firestore

## 📱 Pages

1. **Home** - Hero section with stats and introduction
2. **Skills** - 8 technical skill categories with tags
3. **Experience** - Professional timeline with achievements
4. **Projects** - 6 featured Android projects with metrics
5. **Contact** - Multiple contact methods and services offered

## 🛠️ Tech Stack

- React 18 & React Native Web
- Firebase Firestore (Database/CMS)
- Webpack 5 & Babel
- Framer Motion / Scroll Reveal Animations

## 🔐 Admin CMS Dashboard

This portfolio features a custom-built secure Admin Panel to manage all your dynamic content. 

- **Access URL**: `your-website.com/#admin`
- **Full Documentation**: Refer to **[CMS_GUIDE.md](./CMS_GUIDE.md)** for login details and management instructions.

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm build
```

## 🚀 Deployment (Firebase Hosting)

I have pre-configured this project for **Firebase Hosting**. Follow these steps to take your portfolio live:

### 1. Install Firebase CLI
If you haven't already, install the Firebase Tools globally:
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
npx firebase login
```

### 3. Deploy to Production
You have two ways to deploy:

**Option A: One-Click CMS Deployment (Recommended)**
Use the professional dashboard to deploy with version logs and history.
Refer to **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for full instructions on automated deployment.

**Option B: Manual Terminal Deployment**
Simply run the following command. It will automatically build the project and upload it to Firebase:
```bash
npm run deploy
```

### 🔍 Technical Details:
- **Build Folder**: `dist/`
- **Configuration**: Managed via `firebase.json` and `.firebaserc`
- **Deep Linking**: Configured to handle Single Page Application (SPA) routing automatically.

The app will run on `http://localhost:3000`

## 📁 Project Structure

```
portfolio-app/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── CodeBackground.js
│   │   ├── Header.js
│   │   └── Footer.js
│   ├── pages/
│   │   ├── Home.js
│   │   ├── Skills.js
│   │   ├── Experience.js
│   │   ├── Projects.js
│   │   └── Contact.js
│   └── App.js
├── index.js
├── webpack.config.js
├── .babelrc
└── package.json
```

## 🎨 Customization (Dynamic via CMS)

Previously, you had to edit static JS files. **Now, you should use the Secure CMS.**

To update your Bio, Social Links, Projects, or Skills:
1. Access the Admin CMS at `/#admin`.
2. Select the relevant collection from the sidebar.
3. Save changes — they will reflect instantly on the live site!

## 📄 License

MIT License - Feel free to use this template for your own portfolio!

## 👤 Author

**Harsh Thakkar**
- Mobile Application Developer
- Specializing in Android Development
- 5+ Years of Experience

---

Built with ❤️ using React Native Web
