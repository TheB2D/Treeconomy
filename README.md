# 🎮 Ranger Skill Tree

A beautiful retro-styled skill tree interface inspired by classic RPG games, built with Next.js and styled using principles from [8bitcn-ui](https://github.com/TheOrcDev/8bitcn-ui).

## ✨ Features

- **🎨 Retro 8-bit Design**: Pixel-perfect borders, retro fonts, and classic gaming aesthetics
- **🌳 Interactive Skill Tree**: Unlock and upgrade skills with prerequisite dependencies
- **⚡ Real-time Feedback**: Visual indicators for locked, available, unlocked, and maxed skills
- **🎯 Skill Management**: 
  - Spend skill points to unlock and upgrade abilities
  - Track prerequisites and skill connections
  - Visual connection lines showing skill paths
  - Hover tooltips with detailed skill information
- **🔄 Reset System**: Reset all skills and refund points at any time
- **📱 Responsive Design**: Works beautifully across different screen sizes

## 🎯 Skill System

The skill tree features 4 tiers of abilities:

### Tier 1 - Foundation Skills
- **Basic Attack**: Master combat fundamentals (+10% damage)
- **Dodge Roll**: Quick evasive maneuver (+15% dodge)
- **Health Boost**: Increase maximum health (+20 HP)

### Tier 2 - Intermediate Skills
- **Power Strike**: Devastating melee attack
- **Swift Blade**: Rapid consecutive attacks
- **Shadow Step**: Teleport short distances
- **Regeneration**: Passive health recovery
- **Shield Block**: Block incoming attacks

### Tier 3 - Advanced Skills
- **Whirlwind**: Spin attack hitting all enemies
- **Phantom Strike**: Create attacking shadow clones
- **Last Stand**: Invincibility at low health

### Tier 4 - Master Skills
- **Blade Master**: Ultimate sword mastery
- **Immortal**: Cannot die for 10 seconds

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎮 How to Use

1. **Unlock Skills**: Click on available (blue glowing) skills to unlock them
2. **Upgrade Skills**: Click unlocked skills again to level them up (max levels vary)
3. **View Details**: Hover over any skill to see detailed information
4. **Prerequisites**: Skills in higher tiers require specific lower-tier skills first
5. **Reset**: Use the RESET button to refund all points and start over

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Design System**: Inspired by [8bitcn-ui](https://github.com/TheOrcDev/8bitcn-ui)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Font**: [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P)

## 🎨 Design Philosophy

This project embraces the 8-bit retro aesthetic:

- **Pixel Borders**: Custom CSS for authentic pixel-art style borders
- **Retro Colors**: Carefully chosen color palette reminiscent of classic games
- **Scanline Effect**: Subtle CRT monitor simulation
- **Press Start 2P Font**: The iconic retro gaming font
- **Pixelated Rendering**: Sharp, crisp pixel-perfect rendering

## 📝 Customization

### Adding New Skills

Edit `data/skills.ts` to add or modify skills:

```typescript
{
  id: "your-skill",
  name: "Your Skill",
  description: "What it does",
  icon: "⚔️",
  tier: 1,
  column: 0,
  maxLevel: 3,
  currentLevel: 0,
  unlocked: false,
  prerequisites: ["other-skill-id"],
  cost: 2,
}
```

### Modifying Connections

Edit the `connections` array in `data/skills.ts`:

```typescript
{ from: "basic-attack", to: "power-strike" }
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Design inspiration from [8bitcn-ui](https://github.com/TheOrcDev/8bitcn-ui)
- Classic RPG games that pioneered skill tree mechanics
- The retro gaming community

## 🔗 Links

- [8bitcn-ui GitHub](https://github.com/TheOrcDev/8bitcn-ui)
- [8bitcn.com](https://www.8bitcn.com/)

---

Built with ❤️ and pixels
