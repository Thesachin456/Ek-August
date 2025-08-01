# Ek-August Chat

A modern, real-time chat application built with Node.js, Express, Socket.IO, React, and MongoDB. Features include real-time messaging, file sharing, typing indicators, emoji reactions, user authentication, and much more.

![Chat Application](https://via.placeholder.com/800x400/667eea/ffffff?text=Ek-August+Chat)

## ✨ Features

### 🚀 Core Features
- **Real-time messaging** with Socket.IO WebSocket connections
- **User authentication** with JWT tokens
- **Chat rooms** (public and private)
- **Direct messaging** between users
- **Message history** with pagination
- **File sharing** (images, documents, etc.)
- **Typing indicators** showing when users are typing
- **Message reactions** with emojis
- **User profiles** with avatars
- **Search functionality** for messages and conversations

### 🔒 Security & Privacy
- **Privacy settings** (show online status, allow DMs, etc.)
- **User blocking** functionality
- **Notification controls** (email, push, sound)
- **Secure authentication** with bcrypt password hashing
- **Rate limiting** to prevent abuse

### 📱 User Experience
- **Responsive design** for mobile and desktop
- **Modern Material-UI** interface
- **Real-time notifications** for new messages
- **Online/offline status** indicators
- **Beautiful gradients** and animations
- **Dark/light theme** support

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads

### Frontend
- **React** - UI library
- **Material-UI** - Component library
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **React Router** - Navigation
- **React Hot Toast** - Notifications

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ek-august-chat.git
   cd ek-august-chat
   ```

2. **Install server dependencies**
   ```bash
   npm install
   ```

3. **Install client dependencies**
   ```bash
   npm run install-client
   ```

4. **Set up environment variables**
   ```bash
   # Copy .env.example to .env and configure
   cp .env.example .env
   ```

   Update `.env` with your configurations:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/ek-august-chat
   JWT_SECRET=your-super-secret-jwt-key
   CLIENT_URL=http://localhost:3000
   ```

   Update `client/.env`:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

5. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

6. **Run the application**
   ```bash
   # Development mode (runs both server and client)
   npm run dev
   
   # Or run separately:
   # Server only
   npm run server
   
   # Client only (in another terminal)
   npm run client
   ```

7. **Open your browser**
   - Navigate to `http://localhost:3000`
   - Register a new account or login
   - Start chatting!

## 📱 Usage Guide

### Getting Started
1. **Register** a new account with username, email, and password
2. **Login** to access the chat interface
3. **Join public rooms** or create your own
4. **Start messaging** in real-time

### Chat Features
- **Send messages** by typing and pressing Enter
- **Share files** by clicking the attachment icon
- **React to messages** with emojis
- **Reply to messages** for threaded conversations
- **Search messages** using the search bar
- **View typing indicators** when others are typing

### Profile Management
- **Upload avatar** from your profile settings
- **Update bio** and privacy settings
- **Manage notifications** preferences
- **Block/unblock users** as needed

## 🌐 Deployment on Render

### Automatic Deployment
1. **Fork this repository**
2. **Connect to Render**:
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New Web Service"
   - Connect your GitHub repository

3. **Configure deployment**:
   - Build Command: `npm install && npm run install-client && npm run build`
   - Start Command: `npm start`
   - Environment variables:
     ```
     NODE_ENV=production
     JWT_SECRET=(generate a secure secret)
     MONGODB_URI=(your MongoDB connection string)
     ```

4. **Deploy database**:
   - Create a new MongoDB database on Render or use MongoDB Atlas
   - Update `MONGODB_URI` environment variable

### Manual Deployment
```bash
# Build the application
npm run build

# Deploy to your hosting provider
# Make sure to set environment variables in production
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=10000
JWT_SECRET=your-super-secure-production-secret
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ek-august-chat
CLIENT_URL=https://your-app.onrender.com
```

## 🔧 Configuration

### MongoDB Setup
- **Local**: Install MongoDB locally or use Docker
- **Cloud**: Use MongoDB Atlas for cloud hosting
- **Connection**: Update `MONGODB_URI` in environment variables

### File Uploads
- **Development**: Files stored as base64 in database
- **Production**: Recommended to use cloud storage (AWS S3, Cloudinary, etc.)

### Real-time Features
- **Socket.IO**: Configured for both WebSocket and polling fallback
- **CORS**: Properly configured for cross-origin requests
- **Authentication**: Socket connections authenticated with JWT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - Logout user

### Chat Endpoints
- `GET /api/chat/rooms` - Get user's chat rooms
- `POST /api/chat/rooms` - Create new room
- `GET /api/chat/rooms/:id/messages` - Get room messages
- `GET /api/chat/search` - Search messages

### Socket Events
- `message:send` - Send new message
- `message:new` - Receive new message
- `typing:start` - Start typing indicator
- `typing:stop` - Stop typing indicator
- `message:react` - React to message

## 🔒 Security

- **Authentication**: JWT tokens with secure secret
- **Password hashing**: bcrypt with salt rounds
- **Rate limiting**: Protection against spam
- **Input validation**: Sanitized user inputs
- **CORS**: Configured for secure cross-origin requests

## 📊 Performance

- **Database indexing**: Optimized queries for fast performance
- **Message pagination**: Efficient loading of chat history
- **Connection pooling**: Optimized database connections
- **Compression**: Gzip compression for faster loading

## 🐛 Troubleshooting

### Common Issues

1. **Connection issues**:
   - Check MongoDB connection string
   - Verify environment variables
   - Ensure ports are not blocked

2. **Socket.IO issues**:
   - Check CORS configuration
   - Verify WebSocket support
   - Try polling fallback

3. **Build issues**:
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall
   - Check Node.js version compatibility

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Socket.IO for real-time communication
- Material-UI for beautiful components
- MongoDB for robust data storage
- React community for amazing tools
- All contributors and users

## 📞 Support

For support, email support@ek-august-chat.com or join our Discord server.

---

**Made with ❤️ by the Ek-August Team**