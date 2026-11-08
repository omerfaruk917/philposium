#!/usr/bin/env python3
"""Serve the static site and store form submissions on this computer."""
import argparse
import json
import os
import re
import sqlite3
import subprocess
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs

ROOT = Path(__file__).resolve().parent
EMAIL = re.compile(r"[^\s@]+@[^\s@]+\.[^\s@]+")
FIELDS = {
    "/api/contact": {"name": 120, "email": 254, "message": 3000},
    "/api/newsletter": {"email": 254},
}


class SiteHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, database):
        self.database = database
        super().__init__(*args, directory=ROOT / "dist")

    def reply(self, status):
        body = json.dumps({"ok": status == 200}).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        fields = FIELDS.get(self.path)
        if not fields:
            self.reply(404)
            return
        host = f"127.0.0.1:{self.server.server_port}"
        if self.headers.get("Host") != host or self.headers.get("Origin", f"http://{host}") != f"http://{host}":
            self.reply(403)
            return

        try:
            size = int(self.headers.get("Content-Length", "0"))
            if not 0 < size <= 40000 or self.headers.get_content_type() != "application/x-www-form-urlencoded":
                raise ValueError
            supplied = parse_qs(self.rfile.read(size).decode("utf-8"), max_num_fields=3)
            data = {name: supplied[name][0].strip() for name in fields}
            if any(not value or len(value) > fields[name] for name, value in data.items()):
                raise ValueError
            if not EMAIL.fullmatch(data["email"]):
                raise ValueError
        except (KeyError, ValueError):
            self.reply(400)
            return

        try:
            with sqlite3.connect(self.database) as connection:
                if self.path == "/api/newsletter":
                    connection.execute("INSERT OR IGNORE INTO subscribers(email) VALUES (?)", (data["email"],))
                else:
                    connection.execute(
                        "INSERT INTO messages(name, email, message) VALUES (?, ?, ?)",
                        (data["name"], data["email"], data["message"]),
                    )
        except sqlite3.Error:
            self.reply(500)
            return
        self.reply(200)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--database", type=Path, default=ROOT / "local-data" / "philposium.sqlite3")
    options = parser.parse_args()
    database = options.database.expanduser().resolve()
    if database.is_relative_to(ROOT / "dist"):
        parser.error("The database must be outside the served directory.")
    subprocess.run(["sh", "build.sh"], cwd=ROOT, env={**os.environ, "PHILPOSIUM_LOCAL_FORMS": "1"}, check=True)
    database.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(database) as connection:
        connection.executescript("""
            CREATE TABLE IF NOT EXISTS subscribers (
                email TEXT PRIMARY KEY COLLATE NOCASE,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        """)
    with ThreadingHTTPServer(("127.0.0.1", options.port), partial(SiteHandler, database=database)) as server:
        print(f"http://127.0.0.1:{server.server_port}/", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
