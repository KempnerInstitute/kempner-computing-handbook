build:
	uv run jupyter-book build kempner_computing_handbook

build-live: build
	uv run python -m http.server --directory kempner_computing_handbook/_build/html 8000

clean:
	uv run jupyter-book clean kempner_computing_handbook --all

