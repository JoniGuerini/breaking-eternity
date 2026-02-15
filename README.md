# Breaking Infinity 🌌

**Breaking Infinity** is a high-performance, visually stunning incremental game built with React and Vite. Experience the challenge of managing an unstable universe where every generator improvement risks the collapse of reality itself.

## 🌟 Core Features

### ⚙️ Multidimensional Generators
Build and upgrade a series of 50 unique generators. Each generator produces the resources needed to unlock the next tier, creating a complex chain of production that scales into the decillions and beyond.

### 🔋 The Eternity Reservoir
The heart of your stabilization effort. 
- **Maintenance**: Generators consume stability over time.
- **Infusion**: Manually infuse your Eternity Fragments to keep the reservoir full.
- **Consequences**: If the reservoir depletes, production ceases immediately. Stay synced or face the void.

### 🧬 Talent Architecture
A branched progression tree that allows you to specialize your gameplay:
- **Resonance Path**: Focus on active production and generator efficiency.
- **Stability Path**: Optimize reservoir costs and offline processing power.
- **Central Hubs**: Unlock powerful feedback loops that scale with total progress.

### 🔬 Scientific Missions
Complete procedurally generated objectives to earn **Scientific Merit** and **XP**. Rise through the ranks from a Lab Assistant to a Master of Infinity.

---

## 🛠️ Technical Architecture

### Tech Stack
- **Frontend**: React 18 / Vite 7
- **Styling**: Tailwind CSS (Shadcn/UI inspired components)
- **Mathematics**: `break_eternity.js` (Handles values up to 10^10^308)
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Key Systems
- **High-Precision Loop**: A optimized game tick system that handles background production and delta-time compensation.
- **Save Migration**: Automated versioning system that handles renaming and structural changes in `localStorage` without data loss.
- **Procedural Mission Engine**: Generates unique challenges based on current player rank and resource scales.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/JoniGuerini/breaking-eternity.git
   cd breaking-eternity
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 👨‍💻 Development

### Project Structure
- `src/game/`: Core logic, state management, and data definitions.
- `src/components/`: Visual implementation and UI logic.
- `src/utils/`: Formatting and mathematical helpers.

---

## 📄 License
This project is for educational and entertainment purposes. Inspired by the great history of incremental games.

*Breaking Infinity — Because the void won't stable itself.*
