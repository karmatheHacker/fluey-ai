# Fluey AI - Modern Chat Interface

A React Native chat application with modern AI chat features, including streaming responses, markdown rendering, and math support.

## Features

- 🚀 Smooth transitions between screens
- 💬 Real-time streaming responses
- 📝 Markdown and LaTeX math rendering
- 🎨 Beautiful UI with skeleton loading
- 🔄 State management with Zustand
- 💾 Chat session persistence

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/karmatheHacker/fluey-ai.git
cd fluey-ai
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```
EXPO_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

4. Start the development server:
```bash
npm start
# or
yarn start
```

## Libraries Used

### Core Libraries
- **React Native**: Base framework for building cross-platform mobile applications
- **Expo**: Development platform for React Native apps
- **TypeScript**: For type safety and better developer experience

### UI & Animation
- **react-native-reanimated**: For smooth animations and transitions
- **@gorhom/bottom-sheet**: For bottom sheet interactions
- **@shopify/flash-list**: High-performance list implementation
- **react-native-markdown-display**: For rendering markdown content
- **react-native-math-view**: For rendering LaTeX math expressions

### State Management
- **Zustand**: Lightweight state management solution
- **AsyncStorage**: For persisting chat sessions

### Development Tools
- **ESLint**: For code linting
- **Prettier**: For code formatting
- **TypeScript**: For type checking

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

