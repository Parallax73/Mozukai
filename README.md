# Mozukai

A modern Bonsai store with integrated photogrammetry pipeline. Built with TypeScript, Python, and AliceVision for 3D reconstruction.

## Project Structure

```
Mozukai/
├── frontend/          # React TypeScript frontend
├── backend/           # Python FastAPI backend
├── pipeline/          # AliceVision photogrammetry pipeline
├── docs/              # Documentation
└── requirements.txt   # Python dependencies
```

## Features

- **Modern E-commerce Frontend**: React with TypeScript and Vite
- **RESTful API Backend**: FastAPI with PostgreSQL
- **Payment Integration**: Stripe payment processing
- **3D Photogrammetry**: AliceVision pipeline for 3D model generation
- **Authentication**: JWT-based user authentication
- **Database**: PostgreSQL with async support

## Prerequisites

Before you begin, ensure you have the following installed:

### Core Requirements
- **Node.js** (Latest LTS version recommended)
- **Python 3.8+**
- **PostgreSQL 12+**
- **pnpm/npm/yarn**

### For Photogrammetry Pipeline
- **NVIDIA CUDA-enabled GPU** with compute capability 3.0+
- **CUDA Toolkit 10.0+**
- **16GB+ RAM** (32GB+ recommended for large datasets)
- **Ubuntu 18.04/20.04/22.04 LTS**

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Parallax73/Mozukai.git
cd Mozukai
```

### 2. Environment Setup
Create environment files:

**Backend** (`.env` in `backend/` directory):
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

**Frontend** (`.env` in `frontend/` directory):
```env
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 3. Database Setup
```bash
# Create PostgreSQL database
createdb mydb

# Update DATABASE_URL with your credentials
```

### 4. Install Dependencies
```bash
# Frontend dependencies
cd frontend
pnpm install

# Backend dependencies
cd ../backend
pip install -r requirements.txt

# Pipeline dependencies (if using photogrammetry)
cd ../
pip install -r requirements.txt
```

### 5. Run the Application
```bash
# Start backend (from backend directory)
python main.py

# Start frontend (from frontend directory)
pnpm dev
```

Access the application at: `http://localhost:5173`

## Component Setup

### Frontend Development
```bash
cd frontend
pnpm install
pnpm dev        # Development server
pnpm build      # Production build
pnpm preview    # Preview production build
```

### Backend Development
```bash
cd backend
pip install -r requirements.txt
python main.py  # Start FastAPI server
```

### Photogrammetry Pipeline
For detailed pipeline setup, see [Pipeline README](./pipeline/README.md)

```bash
# Quick pipeline test
python pipeline/run_photogrammetry.py --input_dir ./test_images --output_dir ./output
```

## Development

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Stripe** for payments

### Backend Stack
- **FastAPI** for API framework
- **PostgreSQL** with asyncpg
- **SQLAlchemy** for ORM
- **JWT** for authentication
- **Stripe** for payment processing

### Pipeline Stack
- **AliceVision** for photogrammetry
- **CUDA** for GPU acceleration
- **OpenCV** for image processing
- **Python** for orchestration

## API Documentation

When running the backend, API documentation is available at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Testing

```bash
# Frontend tests
cd frontend
pnpm test

# Backend tests
cd backend
pytest

# Pipeline tests
python -m pytest pipeline/tests/
```

## Deployment

### Production Environment Variables
Ensure all environment variables are properly set for production:
- Use strong, unique `SECRET_KEY`
- Configure proper `DATABASE_URL`
- Set up production Stripe keys
- Configure `ALLOWED_ORIGINS` for your domain

### Build for Production
```bash
# Frontend
cd frontend
pnpm build

# Backend (ensure production environment variables are set)
cd backend
python main.py
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **General Issues**: Open an issue on GitHub
- **Photogrammetry Pipeline**: See [Pipeline README](./pipeline/README.md)
- **Backend API**: Check API documentation at `/docs`

## Acknowledgments

- **AliceVision** team for the photogrammetry framework
- **FastAPI** for the excellent Python web framework
- **React** and **Vite** teams for frontend tooling

⚠️ **Security Notes:**
- Never commit actual environment variables to version control
- Replace all example keys with your own secure values
- Use HTTPS in production
- Regularly update dependencies for security patches