"""AI Workshop CS — FastAPI Backend"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import CORS_ORIGINS, API_HOST, API_PORT
from routers import standards, lessons, search

app = FastAPI(
    title="AI Workshop CS API",
    description="Backend for the Maryland AI-Aligned Lesson Builder",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(standards.router, prefix="/api/standards", tags=["standards"])
app.include_router(lessons.router, prefix="/api/lessons", tags=["lessons"])
app.include_router(search.router, prefix="/api/search", tags=["search"])


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=API_HOST, port=API_PORT, reload=True)
