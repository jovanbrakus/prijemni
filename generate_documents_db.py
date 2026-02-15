#!/usr/bin/env python3
"""Generate database/documents.json from archive/ PDF filenames."""

import json
import os
import re

ARCHIVE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "archive")
DB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "database")

UNIVERSITY = "univerzitet_u_beogradu"

FACULTIES = [
    "elektrotehnicki_fakultet",
    "fakultet_organizacionih_nauka",
    "fakultet_za_fizicku_hemiju",
    "fizicki_fakultet",
    "gradevinski_fakultet",
    "masinski_fakultet",
    "matematicki_fakultet",
    "rudarsko_geoloski_fakultet",
    "saobracajni_fakultet",
    "tehnolosko_metalurski_fakultet",
]

PREFIX = UNIVERSITY + "_"


def parse_filename(filename):
    stem = filename.removesuffix(".pdf")
    assert stem.startswith(PREFIX), f"Unexpected prefix: {filename}"
    rest = stem[len(PREFIX):]

    # Match against known faculty slugs (longest match first)
    faculty = None
    remainder = None
    for f in sorted(FACULTIES, key=len, reverse=True):
        if rest.startswith(f):
            faculty = f
            remainder = rest[len(f):]
            break

    assert faculty is not None, f"Unknown faculty in: {filename}"

    # remainder is either empty, or starts with "_"
    if remainder:
        remainder = remainder.lstrip("_")
    else:
        remainder = None

    # Try to extract year from the beginning of remainder
    year = None
    extra = None

    if remainder:
        m = re.match(r"^(\d{4})(.*)", remainder)
        if m:
            year = int(m.group(1))
            extra_part = m.group(2).lstrip("_")
            extra = extra_part if extra_part else None
        else:
            # No year found (e.g. "informator", "prijemni_info")
            extra = remainder

    return {
        "filename": filename,
        "university": UNIVERSITY,
        "faculty": faculty,
        "year": year,
        "extra": extra,
    }


def main():
    files = sorted(
        f for f in os.listdir(ARCHIVE_DIR)
        if f.endswith(".pdf") and f.startswith(PREFIX)
    )

    documents = [parse_filename(f) for f in files]

    os.makedirs(DB_DIR, exist_ok=True)
    out_path = os.path.join(DB_DIR, "documents.json")
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(documents, fh, indent=2, ensure_ascii=False)

    print(f"Wrote {len(documents)} entries to {out_path}")


if __name__ == "__main__":
    main()
