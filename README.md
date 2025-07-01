# KORG MS20 Synthesizer & Drum Machine

A web-based recreation of the iconic KORG MS20 synthesizer with an integrated drum machine and professional mixing console.

## Features

- **KORG MS20 Synthesizer**: Authentic recreation with dual VCO, VCF, VCA, and ADSR envelope controls
- **Drum Machine**: 8-track drum sequencer with kick, snare, hi-hat, and percussion sounds
- **Professional Mixer**: Multi-channel mixing console with volume, pan, and effects controls
- **AI Pattern Generation**: Intelligent drum pattern creation in various musical styles
- **Real-time Audio Processing**: Web Audio API-based sound synthesis and effects
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Live Demo

🚀 [View Live Demo](https://korg-ms20-drum-machine.vercel.app)

## Local Development

1. **Clone this repository:**
   ```bash
   git clone https://github.com/studioweb-onion/korg-ms20-drum-machine.git
   cd korg-ms20-drum-machine
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser and navigate to:**
   ```
   http://localhost:5173
   ```

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment on Vercel

This project is configured for automatic deployment on Vercel:

1. **Via GitHub (Recommended):**
   - Push your code to this GitHub repository
   - Connect the repository to Vercel
   - Vercel will automatically deploy on every push to main branch

2. **Manual Deployment:**
   ```bash
   npm install -g vercel
   vercel
   ```

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Audio**: Web Audio API
- **Icons**: Lucide React
- **Deployment**: Vercel

## Project Structure

```
src/
├── components/          # React components
│   ├── DrumMachine.tsx  # Drum machine interface
│   ├── MS20Synthesizer.tsx # Synthesizer interface
│   ├── Mixer.tsx        # Mixing console
│   └── ...
├── contexts/            # React contexts for state management
│   ├── AudioContext.tsx
│   ├── DrumMachineContext.tsx
│   ├── MS20SynthContext.tsx
│   └── GlobalSync.tsx
├── App.tsx             # Main application component
└── main.tsx           # Application entry point
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).