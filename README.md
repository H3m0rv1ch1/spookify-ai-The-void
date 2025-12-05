# Spookify AI - The Void 🎃👻

<div align="center">
<img width="1200" height="475" alt="Spookify AI - The Void" src="./Public/SPOKIFY.AI-git-img .svg" />
</div>

A Halloween costume transformation app with a cyberpunk twist. Complete intense minigames to defeat "The Void" and unlock AI-powered character transformations.

## 🚀 Features

- **18+ Character Styles** across 4 categories (Horror, Supernatural, Gaming, Movies)
- **3 Intense Minigames** (Glyph matching, Waveform calibration, Neural purge)
- **AI-Powered Transformations** using OpenRouter API
- **Cyberpunk Horror Aesthetic** with custom animations and effects
- **Before/After Comparison** with fullscreen zoom
- **Talking AI Mentor** with speech synthesis

## 🛠️ Tech Stack

- React 19 + TypeScript + Vite
- OpenRouter API (compatible with multiple AI models)
- Tailwind CSS with custom theming
- Canvas API for real-time graphics

## 📦 Installation

**Prerequisites:** Node.js 18+

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd spookify-ai-the-void
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your API key**
   
   Create a `.env.local` file in the root directory:
   ```env
   API_KEY=your_openrouter_api_key_here
   ```
   
   Get your API key from [OpenRouter](https://openrouter.ai/).

4. **Run the app**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🚀 Deployment

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

For detailed deployment instructions (Cloudflare Pages, GitHub Pages, Vercel), see [DEPLOYMENT.md](DEPLOYMENT.md).

## 🎮 How to Play

1. Upload your photo
2. Select a character style
3. Click "Generate Transformation"
4. **Surprise!** The system gets corrupted by The Void
5. Complete 3 minigames to restore the system
6. Unlock your AI transformation

## 🔑 API Key Information

### For Users
- This is **open source software** - you can run it yourself
- You need your own **OpenRouter API key** to use AI transformations
- API usage and costs are your responsibility
- The hosted demo uses the maintainer's API key for demonstration only

### For Developers
- The app is designed to work with OpenRouter API
- Compatible with multiple AI models for image generation
- Easy to swap AI providers by changing the API endpoint
- No API keys are included in this repository

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

## 🏆 Built for Kiroween Hackathon

This project was built using Kiro AI for rapid development. See [HACKATHON_SUBMISSION.md](HACKATHON_SUBMISSION.md) for details on how Kiro was used.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or feedback, please open an issue on GitHub.
