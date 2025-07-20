# Mozukai

Create a `.env` file in `backend/app` with the following content:

```env
DATABASE_URL=postgresql+asyncpg://youruser:yourpassword@localhost:5432/yourdatabase
ALLOWED_ORIGINS=http://localhost:5173
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_LIFETIME=15 # 15 Minutes
SHORT_REFRESH_TOKEN_LIFETIME=60 # 1 Hour
LONG_REFRESH_TOKEN_LIFETIME=43200 # 7 Days
REDIRECT_URL="http://127.0.0.1:8000/auth"
FRONTEND_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
