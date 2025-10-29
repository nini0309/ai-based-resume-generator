# Resume Generator Web App

A full-stack **Resume Generator** web application built using **React (Vite)** (frontend) and **Flask** (backend).  
It allows users to input a personal description and automatically generates a well-formatted resume using AI.

The project includes an **AWS deployment script (`aws_deploy.py`)** to upload and deploy the built frontend to an S3 bucket for hosting.

---

## 🚀 Tech Stack

### Frontend
- ⚛️ **React (Vite)** — Fast development & optimized build system  
- 🎨 **TailwindCSS** — For responsive, modern UI design  
- 🔗 **Axios** — For API communication with Flask backend

### Backend
- 🐍 **Flask** — Lightweight Python framework for REST APIs  
- 🤖 **Gemini API** — To generate resume content dynamically  

### Deployment
- ☁️ **AWS S3 and AWS EC2** — Used to host static frontend files and backend respectively 
- 🔐 **AWS IAM Credentials** — Used for authentication during upload  
- 🧰 **`aws_deploy.py`** — Automates deployment from local to S3  

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

git clone https://github.com/nini0309/ai-based-resume-generator.git

cd ai-based-resume-generator

### 2.1 Backend Setup (Flask)

cd backend

python -m venv venv

source venv/bin/activate     # on Windows: venv\Scripts\activate

pip install -r requirements.txt

python app.py

### 2.2 Frontend Setup (React + Vite)

cd frontend

npm install

npm run dev

### Connecting Frontend & Backend

In your frontend/public/config.json

{
  "API_BASE_URL": "https://{flask-url}"
}

## ☁️ AWS Deployment (S3 Frontend EC2 Backend)

### 1. Build Frontend

cd frontend
npm run build

This creates a production build in frontend/dist/.

### 2. Configure AWS Credentials

Open aws_deploy.py and fill in your credentials:

BUCKET_NAME = "your-s3-bucket-name"

AWS_ACCESS_KEY = "YOUR_AWS_ACCESS_KEY"

AWS_SECRET_KEY = "YOUR_AWS_SECRET_KEY"

### 3. Deploy to AWS S3

Run the deployment script:

python aws_deploy.py
