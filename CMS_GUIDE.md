# 🛠️ Portfolio Admin CMS Guide

Welcome to your custom-built **Portfolio Management System**. This internal tool allows you to manage all your website content dynamically via Firebase without touching any code.

---

## 🔐 1. Accessing the Dashboard

The CMS is hidden from public view for security. To access it:

1.  Open your website in your browser.
2.  Add **`#admin`** to the end of the URL.
    *   **Local**: `http://localhost:3000/#admin`
    *   **Production**: `https://your-portfolio.com/#admin`
3.  Enter your **Master PIN**.
    *   **Default PIN**: `1234`
    *   *(See "Changing Security" below to update this)*.

---

## 📋 2. Managing Content

The sidebar lists all the data collections that power your site.

### **Global Settings**
*   **Profile Photo**: Update `profileImageUrl` to change your hero/header image.
*   **Site Identity**: Change `logoText` or your `availabilityText`.
*   **Security**: Update `adminPin` to set a custom 4-digit login code.

### **Page Content**
*   Manages the Title, Sections Labels, and Descriptions for individual pages (Home, Skills, Experience, etc.).
*   **Typewriter Text**: Edit the `typedTexts` array to change the rotating text in the Hero section.

### **Collections (Projects, Experience, Skills)**
*   **Projects**: Manage your gallery, tech stacks, and links.
*   **Experience**: Maintain your professional timeline.
*   **Skills**: Add new technologies or categories.
*   **Sorting**: All items have an `order` field. Lower numbers appear first.

---

## ✨ 3. Advanced Features

### **Add New Documents/Items**
*   Use the **"+ Add"** button in the top bar of any section.
*   In "Page Content" or "Settings", you will be prompted to enter a unique **Document ID** (e.g., `education`, `extra_metadata`).

### **Adding Custom Fields**
*   While editing any item, you can click **"+ Add custom field key"**.
*   This allows you to expand your database on the fly. For example, if you want to add an `appStoreLink` to a project that doesn't have one, just add the key and the value!

### **Human-Readable Labels**
*   The CMS shows friendly names like **"Featured Image (imageUrl)"**. 
*   The name in the brackets `()` is the exact Firebase key. The name outside is the descriptive label managed by the `FIELD_LABELS` engine in `Admin.js`.

---

## 💡 4. Best Practices

1.  **Image Links**: Always use direct image URLs (from Firebase Storage, Imgur, or your `public` folder).
2.  **Naming Keys**: When adding custom fields, use **camelCase** (e.g., `myNewField`).
3.  **Arrays**: For tech stacks or achievements, use the `+ Add Item` button to keep your data structured as lists.
4.  **Save Often**: Click "Save Changes" before switching to another collection to avoid losing progress.

---

## 🛠️ 5. Troubleshooting

*   **White Screen on Admin**: Ensure you are using the correct hash `#admin`.
*   **Save Error**: If you see "No document to update", retry the save. The system is designed to automatically create missing documents using the "Merge" strategy.
*   **Data Not Updating**: Refresh your main site. Firebase updates are instant, but browsers sometimes cache the old view.

---

*Crafted by Antigravity for Harsh Thakkar*
