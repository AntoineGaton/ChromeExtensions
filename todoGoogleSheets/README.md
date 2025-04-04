# Todo Google Sheets Chrome Extension

A Chrome extension that allows you to manage your todo list directly with Google Sheets, without requiring a backend server. The extension connects to your Google account, handles authentication, and lets you create, read, update, and mark tasks as done in Google Sheets.

## Accomplishments

- ✅ Google Authentication integration with Chrome Identity API
- ✅ Direct integration with Google Sheets API
- ✅ Persistent login between browser sessions
- ✅ Add new tasks with date created timestamp
- ✅ Mark tasks as completed with date completed timestamp
- ✅ Edit existing tasks
- ✅ Create new Google Sheets or select existing ones
- ✅ Responsive UI with modern design
- ✅ Error handling with user-friendly messages
- ✅ Data persistence using Chrome storage
- ✅ Proper sheet formatting with Task, Date Created, and Date Done columns

## Current Issues to Fix

- 🐛 Sheet selection is buggy - sometimes shows duplicate sheets or sheets that don't exist
- 🐛 Create new sheet functionality is not working properly
- 🐛 Sheet formatting needs to be consistently applied (Task, Date Created, Date Done columns)
- 🐛 Error handling for API limitations and permissions needs improvement

## Planned Improvements

- 🛠️ Fix sheet listing to accurately display available sheets
- 🛠️ Ensure create new sheet functionality works properly
- 🛠️ Enforce consistent sheet formatting
- 🛠️ Improve error handling and user feedback
- 🛠️ Add loading indicators for better UX

## Cool Features to Add

- 🚀 **Task Categories/Labels** - Add color-coded categories or labels to organize tasks
- 🚀 **Due Dates** - Add due dates to tasks with sorting and filtering options
- 🚀 **Task Priority** - Add priority levels (High, Medium, Low) with visual indicators
- 🚀 **Task Notes** - Allow adding detailed notes to tasks
- 🚀 **Recurring Tasks** - Support for tasks that repeat daily, weekly, or monthly
- 🚀 **Task Sorting/Filtering** - Sort and filter tasks by date, priority, or status
- 🚀 **Task Search** - Search functionality to quickly find tasks
- 🚀 **Dark/Light Theme** - Toggle between dark and light mode
- 🚀 **Multiple Lists** - Support for multiple todo lists in different sheets
- 🚀 **Keyboard Shortcuts** - Add keyboard shortcuts for power users
- 🚀 **Task Statistics** - Show completion rates and other statistics
- 🚀 **Offline Mode** - Cache tasks for offline access with sync when reconnected
- 🚀 **Notifications** - Browser notifications for due tasks
- 🚀 **Export/Import** - Export tasks to CSV or other formats

## Setup Instructions

1. **Clone the Repository**

```bash
git clone <repository-url>
cd todoGoogleSheets
npm install
```

2. **Set Up Google Cloud Project**

- Create a project in [Google Cloud Console](https://console.cloud.google.com/)
- Enable the Google Sheets API and Google Drive API
- Create OAuth credentials for a Chrome extension
- Add the extension ID to the authorized JavaScript origins

3. **Configure Your Extension**

- Update manifest.json with your OAuth client ID
- Configure permissions as needed

4. **Build and Load Extension**

```bash
npm run build
```

- Open Chrome and go to `chrome://extensions/`
- Enable "Developer mode"
- Click "Load unpacked" and select the `dist` directory

## Usage

1. Click the extension icon in Chrome
2. Sign in with your Google account
3. Select an existing Google Sheet or create a new one
4. Add, edit, or mark tasks as done
5. Tasks are automatically synced with your Google Sheet

## Development

- Make changes to the code
- Run `npm run build` to build the extension
- Refresh the extension in Chrome to see changes

## Dependencies

- React
- TypeScript
- Axios for API requests
- Chrome APIs (Identity, Storage)
- Google Sheets API
- Google Drive API

## License

[MIT License](LICENSE)
