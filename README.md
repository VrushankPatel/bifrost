# AI Chat Interface

A modern, production-ready ChatGPT-like interface built with Next.js, React, and ShadCN UI. This application provides a beautiful chat experience with configurable AI backends, persistent conversations, and comprehensive theming support.

## 🚀 Features

### Core Functionality
- **Modern Chat Interface**: Clean, responsive chat UI with message bubbles and smooth animations
- **Conversation Management**: Persistent conversation history with sidebar navigation
- **Configurable Backends**: Support for Ollama and LM Studio with custom port configuration
- **Web Search Toggle**: Optional web search functionality with visual feedback
- **Theme Support**: Dark/light mode toggle with system preference detection
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Technical Features
- **Persistent Storage**: All settings and conversations saved to localStorage
- **Real-time Payload Logging**: Console logging of all message payloads for debugging
- **Smooth Animations**: Micro-interactions and transitions for enhanced UX
- **Accessibility**: Proper ARIA labels, keyboard navigation, and contrast ratios
- **TypeScript**: Full type safety throughout the application

## 🛠️ Technology Stack

- **Framework**: Next.js 13+ with App Router
- **UI Library**: ShadCN UI components
- **Styling**: Tailwind CSS with CSS variables
- **Icons**: Lucide React
- **Theme Management**: next-themes
- **Date Formatting**: date-fns
- **Language**: TypeScript

## 📦 Installation

1. **Clone or download the project**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm run dev
   ```
4. **Open your browser** and navigate to `http://localhost:3000`

## 🔧 Configuration

### Backend Configuration

The application supports two AI backends that can be configured through the settings panel:

#### Ollama
- **Default Port**: 11434
- **Endpoint**: `http://localhost:11434`
- **Description**: Local AI model runner for running LLMs locally

#### LM Studio
- **Default Port**: 1234
- **Endpoint**: `http://localhost:1234`
- **Description**: Desktop application for running language models locally

### Configuration Panel

Access the configuration panel by clicking the settings icon (⚙️) in the top-right corner. You can:

- **Switch Backend Type**: Choose between Ollama and LM Studio
- **Custom Port Configuration**: Set custom ports for your backend services
- **Real-time Preview**: See your configuration changes immediately

### Web Search Toggle

Enable or disable web search functionality using the checkbox in the chat input area. This setting is:
- Persistent across sessions
- Included in all message payloads
- Visually indicated with a search icon

## 📱 Usage

### Starting a Conversation
1. Type your message in the input field at the bottom
2. Optionally enable web search using the checkbox
3. Press Enter or click the send button
4. View the response in the chat area

### Managing Conversations
- **New Conversation**: Click the "New Conversation" button in the sidebar
- **Switch Conversations**: Click on any conversation in the sidebar
- **Auto-save**: All conversations are automatically saved to localStorage

### Theme Switching
- Click the theme toggle button (🌙/☀️) in the header
- Supports light mode, dark mode, and system preference
- Theme preference is persisted across sessions

## 🔍 Payload Structure

When a message is sent, the following payload is logged to the console:

```json
{
  "query": "user message content",
  "webSearchEnabled": true,
  "backend": {
    "type": "ollama",
    "port": 11434
  }
}
```

### Payload Fields
- **query**: The user's message content
- **webSearchEnabled**: Boolean indicating if web search is enabled
- **backend.type**: Either "ollama" or "lmstudio"
- **backend.port**: The configured port number for the backend

## 🎨 Customization

### Styling
The application uses Tailwind CSS with CSS variables for theming. Key customization points:

- **Colors**: Modify CSS variables in `app/globals.css`
- **Components**: Customize ShadCN UI components in `components/ui/`
- **Layout**: Adjust spacing and layout in component files

### Adding New Backends
To add support for additional backends:

1. Update the `BackendConfig` type in `components/app-shell.tsx`
2. Add new options to the select component in `components/config-panel.tsx`
3. Update default port mappings and descriptions

### Message Processing
To integrate with real AI backends:

1. Replace the dummy response logic in `handleSendMessage` function
2. Implement actual API calls using the configured backend settings
3. Add error handling and loading states

## 📁 Project Structure

```
/src
  /app
    layout.tsx          # Root layout with theme provider
    page.tsx           # Main page component
    globals.css        # Global styles and CSS variables
  /components
    app-shell.tsx      # Main application shell and state management
    chat-window.tsx    # Chat interface and message display
    chat-input.tsx     # Message input with send functionality
    message-bubble.tsx # Individual message components
    conversation-list.tsx # Sidebar conversation management
    search-toggle.tsx  # Web search toggle component
    theme-toggle.tsx   # Dark/light mode toggle
    config-panel.tsx   # Backend configuration panel
    theme-provider.tsx # Theme context provider
    /ui               # ShadCN UI components
  /lib
    utils.ts          # Utility functions
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Deploy automatically with zero configuration

### Deploy to Netlify
1. Build the project: `npm run build`
2. Upload the `out` folder to Netlify
3. Configure as a static site

## 🔧 Environment Variables

No environment variables are required for basic functionality. All configuration is handled through the UI and stored in localStorage.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

For issues, questions, or contributions:
1. Check the console for payload logging and error messages
2. Verify your backend service is running on the configured port
3. Ensure localStorage is enabled in your browser
4. Check browser compatibility (modern browsers required)

## 🔮 Future Enhancements

Potential improvements and features:
- **Real AI Integration**: Connect to actual Ollama/LM Studio APIs
- **Message Export**: Export conversations to various formats
- **Custom Models**: Support for different AI models per conversation
- **Voice Input**: Speech-to-text functionality
- **File Uploads**: Support for document and image uploads
- **Conversation Search**: Search through conversation history
- **User Profiles**: Multiple user support with separate conversation histories