# Mozukai 

A modern Bonsai store with integrated photogrammetry pipeline. Built with TypeScript and Python.


## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (Latest LTS version recommended)
- Python 3.x
- PostgreSQL
- pnpm/npm/yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Parallax73/Mozukai.git
cd Mozukai
```

2. Install dependencies:
```bash
# Frontend dependencies
pnpm install  # or npm install

# Python dependencies (from the root directory)
pip install -r requirements.txt
```

3. Set up environment variables:

Create a `.env` file in the backend directory with the following variables:
```env
DATABASE_URL=postgresql+asyncpg://admin:secret@localhost:5432/mydb
ALLOWED_ORIGINS=http://localhost:5173
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_LIFETIME=15
SHORT_REFRESH_TOKEN_LIFETIME=60
LONG_REFRESH_TOKEN_LIFETIME=43200
STRIPE_KEY=your_stripe_secret_key
```

Create a `.env` file in the frontend directory with:
```env
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

⚠️ **Important Security Notes:**
- Never commit your actual environment variables to version control
- Replace all keys and secrets with your own values
- The provided SECRET_KEY and STRIPE keys are examples and should be replaced with your own secure keys
- Make sure to set up proper database credentials

## Database Setup

1. Create a PostgreSQL database:
```bash
createdb mydb
```

2. Update the DATABASE_URL in your `.env` file with your database credentials

## Running the Application

1. Start the backend server:
```bash
# From the backend directory
python main.py  # or the appropriate start command
```

2. Start the frontend development server:
```bash
# From the frontend directory
pnpm dev  # or npm run dev
```

3. Access the application at: `http://localhost:5173`


