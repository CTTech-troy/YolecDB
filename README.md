# YolecDB Admin Dashboard

YolecDB Admin Dashboard is a modern React-based admin panel for managing your website’s content and user engagement. Built with [Vite](https://vitejs.dev/), [React](https://react.dev/), [Firebase](https://firebase.google.com/), and [Tailwind CSS](https://tailwindcss.com/), it provides a fast, responsive, and user-friendly interface for administrators.

## Features

- **Authentication**: Secure login and signup with session management and idle logout.
- **Dashboard Overview**: Visual summary of key metrics (visitors, blogs, testimonials, likes) with animated cards and charts.
- **Blog Manager**: Create, edit, publish/unpublish, and delete blog posts. Upload images (stored as Base64 in Firebase).
- **Gallery Manager**: Manage model display images, add new images, publish/unpublish, and delete.
- **Testimonials**: Review, approve/reject, and publish customer testimonials.
- **Event Manager**: Create and manage events with rich details, including images, date/time, and location (physical or virtual).
- **Newsletter Subscribers**: View, filter, and export newsletter subscribers as CSV or PDF.
- **Contact Submissions**: View and manage messages sent via the website’s contact form.
- **Analytics**: Visualize website performance and engagement with charts.
- **Responsive Design**: Works seamlessly on desktop and mobile devices.
- **Sidebar Navigation**: Easy access to all admin sections.
- **Dark Mode**: Toggle between light and dark themes.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Remixicon, FontAwesome
- **Backend/Database**: Firebase Realtime Database
- **Charts**: Recharts
- **PDF/CSV Export**: jsPDF, jsPDF-Autotable
- **UI Enhancements**: SweetAlert2 for modals and alerts

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- Firebase project (for your own deployment)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/yolecdb-dashboard.git
   cd yolecdb-dashboard/Dashboard
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Configure Firebase:**
   - `.env` and fill in your Firebase credentials.
   - Example:
     ```
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
     VITE_FIREBASE_DATABASE_URL=your_database_url
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
     ```

4. **Start the development server:**
   ```sh
   npm run dev
   ```

5. **Open in your browser:**
   - Visit [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal).

## Project Structure

```
Dashboard/
  ├── src/
  │   ├── component/
  │   │   ├── Sidebar/
  │   │   ├── analytics/
  │   │   ├── blog/
  │   │   ├── events/
  │   │   ├── gallery/
  │   │   ├── testimonials/
  │   │   └── ContactMe/
  │   ├── layouts/
  │   ├── ui/
  │   ├── auth/
  │   ├── analytics/
  │   ├── assets/
  │   ├── App.jsx
  │   ├── main.jsx
  │   ├── global.css
  │   └── ...
  ├── firebase.js
  ├── package.json
  ├── vite.config.js
  └── ...
```

## Usage

- **Login/Signup**: Access the dashboard with your admin credentials.
- **Navigation**: Use the sidebar to switch between dashboard sections.
- **Content Management**: Add, edit, or remove blogs, gallery images, testimonials, and events.
- **Export Data**: Download newsletter and event subscriber lists as CSV or PDF.
- **Dark Mode**: Toggle dark mode from the header or sidebar.
- **Session Security**: Automatic logout after 5 minutes of inactivity.

## Customization

- **Styling**: Modify `src/global.css` or Tailwind config for custom styles.
- **Sidebar Items**: Edit `src/component/Sidebar/Sidebar.jsx` to add or remove navigation links.
- **Firebase Integration**: Update `firebase.js` and `.env` for your own Firebase project.

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

[ISC](LICENSE)

---

**YolecDB Admin Dashboard** – Built with ❤️ using React, Vite, and Firebase