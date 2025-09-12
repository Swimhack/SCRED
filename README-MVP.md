# StreetCredRx MVP Platform

## 🚀 Simplified Pharmacy Credentialing Platform

This is the MVP (Minimum Viable Product) version of StreetCredRx, a streamlined pharmacy credentialing and enrollment management system.

## 📦 MVP Features

### Core Functionality
- ✅ **Authentication System**: Secure login/signup with email verification
- ✅ **Simple Dashboard**: Basic statistics and quick actions
- ✅ **Pharmacist Applications**: Streamlined single-page application form
- ✅ **Document Upload**: Basic document management system
- ✅ **Admin Interface**: Simple admin panel for application management
- ✅ **Role Management**: Basic two-role system (Admin & Pharmacist)

### What's NOT Included (Enterprise Features)
- ❌ Multi-tier admin system (Super Admin, Admin Manager, Regional)
- ❌ Real-time messaging system
- ❌ AI-powered analysis
- ❌ Advanced user management
- ❌ Activity logs and audit trails
- ❌ Complex workflow automation
- ❌ API key management

## 🎨 UI/Design Features Preserved
- Professional Tailwind CSS styling
- Responsive design for all devices
- Clean, modern interface
- Brand colors and theme
- Loading states and animations
- Form validation and error handling

## 🛠 Technology Stack
- **Frontend**: React 18.3.1 + TypeScript
- **Build Tool**: Vite
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for backend)

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Swimhack/SCRED.git
cd SCRED
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Copy the MVP environment configuration:
```bash
cp .env.mvp .env
```

### 4. Run Development Server
```bash
npm run dev
```

The application will run on `http://localhost:8080`

### 5. Build for Production
```bash
npm run build
```

## 🔧 Configuration

### Switching Between MVP and Enterprise Mode

The application supports both MVP and Enterprise modes through feature flags:

#### MVP Mode (Default)
Set in `.env`:
```env
VITE_APP_MODE=mvp
```

#### Enterprise Mode (Full Features)
Set in `.env`:
```env
VITE_APP_MODE=enterprise
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   └── ui/             # shadcn/ui components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and feature flags
│   └── featureFlags.ts # Feature toggle configuration
├── pages/              # Route pages
├── layouts/            # Layout components
└── integrations/       # External service integrations
```

## 🔑 Feature Flags

The application uses a comprehensive feature flag system located in `src/lib/featureFlags.ts`:

- **Authentication**: Basic login/signup (always enabled)
- **Dashboard**: Simplified view for MVP
- **Applications**: Single-page form for MVP
- **Documents**: Basic upload functionality
- **Admin**: Simple admin role for MVP

## 🚢 Deployment

### Deploy to Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables from `.env.mvp`

### Deploy to Vercel
1. Import project from GitHub
2. Configure build settings
3. Add environment variables
4. Deploy

### Deploy to Fly.io
```bash
fly launch
fly deploy
```

## 📈 Upgrade Path

To upgrade from MVP to Enterprise:

1. Change `VITE_APP_MODE` to `enterprise` in `.env`
2. Rebuild the application
3. Deploy the updated version
4. All enterprise features will be automatically enabled

## 🤝 Support

For questions or issues, please contact the development team.

## 📄 License

Proprietary - All Rights Reserved

---

**Note**: This is the MVP version with simplified features. For the full enterprise version with advanced features, please contact the development team for upgrade options.