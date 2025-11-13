#!/bin/bash
cd "$(dirname "$0")"
cd frontend
vercel --prod --yes --cwd .
