from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import requests, json

with open("credentials.json") as f:
    creds = json.load(f)

APPS_SCRIPT_URL = creds.get("APPS_SCRIPT_URL")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/auth/login")
async def auth_login(request: Request):
    body = await request.json()
    username = body.get("username")
    password = body.get("password")
    r = requests.post(APPS_SCRIPT_URL, json={"action":"login","username":username,"password":password})
    return r.json()

@app.post("/save-toko")
async def save_toko(request: Request):
    payload = await request.json()
    r = requests.post(APPS_SCRIPT_URL, json=payload)
    return r.json()

@app.get("/list-toko")
def list_toko():
    r = requests.get(APPS_SCRIPT_URL)
    return r.json()

@app.get("/")
def root():
    return {"message": "Backend OK"}

@app.post("/spk-data")
async def spk_data(request: Request):
    body = await request.json()
    cabang = body.get("cabang")
    r = requests.post(APPS_SCRIPT_URL, json={"action":"getSpkData","cabang":cabang})
    return r.json()
