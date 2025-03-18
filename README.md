# DriveClone - Secure Cloud Storage

A modern, responsive web application that provides secure file storage and sharing capabilities, built with HTML, CSS, and JavaScript.

## Features

- **User Authentication**
  - Registration and login system
  - Session management using localStorage
  - Secure password handling

- **File Management**
  - Drag and drop file upload
  - File encryption using AES
  - File sharing with unique links
  - File deletion
  - File type icons

- **Security**
  - AES encryption for file storage
  - Unique encryption keys for each file
  - Secure file sharing with decryption keys

- **Modern UI/UX**
  - Responsive design
  - Drag and drop interface
  - Modal dialogs for sharing and decryption
  - Loading animations
  - File type icons

## Technologies Used

- HTML5
- CSS3 (with modern features like Grid and Flexbox)
- JavaScript (ES6+)
- CryptoJS for encryption
- Font Awesome for icons

## Getting Started

1. Clone the repository
2. Open `index.html` in a modern web browser
3. Register a new account
4. Start uploading and sharing files!

## Security Considerations

- This is a prototype implementation using localStorage for demonstration purposes
- In a production environment, you should:
  - Use a proper backend server
  - Implement secure password hashing
  - Use HTTPS for all communications
  - Store files in a secure cloud storage service
  - Implement proper session management
  - Add rate limiting and other security measures

## Browser Support

The application works best in modern browsers that support:
- ES6+ JavaScript features
- CSS Grid and Flexbox
- File API
- Drag and Drop API

## Limitations

- File storage is limited by browser's localStorage capacity
- No server-side storage (files are stored locally)
- Basic encryption implementation for demonstration
- No file size validation
- No file type restrictions

## Future Improvements

- Add file size validation
- Implement file type restrictions
- Add file preview functionality
- Implement file versioning
- Add folder support
- Implement file search
- Add file sharing permissions
- Implement file expiration dates
- Add progress indicators for large files
- Implement file compression

## License

This project is open source and available under the MIT License. 