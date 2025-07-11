
import os
import hashlib
import math
from collections import Counter

def save_file(file, upload_dir="uploads"):
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)
    file.save(file_path)
    return file_path

def calculate_entropy(data):
    if not data:
        return 0.0
    counter = Counter(data)
    length = len(data)
    entropy = -sum((count / length) * math.log2(count / length) for count in counter.values())
    return round(entropy, 4)

def hash_file(path):
    sha256 = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            sha256.update(chunk)
    return sha256.hexdigest()

def scan_file_content(path, keywords):
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read().lower()
        matches = [kw for kw in keywords if kw in content]
        return matches
    except Exception:
        return []
