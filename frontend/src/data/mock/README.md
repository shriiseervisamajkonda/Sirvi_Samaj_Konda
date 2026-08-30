# Centralized Mock & Fallback Data Directory

All mock and fallback data used across the application must be kept in this directory as `.json` files.

### Guidelines:
1. Do not hardcode mock objects or arrays directly inside component JSX/TSX files.
2. Import JSON files from this directory (`src/data/mock/*.json`).
3. Add a `// TODO: This is mock/fallback data. Remove when actual data is filled in the database.` comment wherever these mock datasets are consumed.
