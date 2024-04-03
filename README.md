# SQL Chat

To set this up, run:

```bash
git clone https://github.com/sanand0/sqlchat.git
cd sqlchat
export OPENAI_API_KEY=...
pip install -r requirements.txt
```

To use it, you can either run:

```bash
uvicorn sqlchat:app
```

... and visit <http://localhost:8000/> (replace `localhost`) with your server.

OR run from the command line:

```bash
python sqlchat.py type your question here
```
