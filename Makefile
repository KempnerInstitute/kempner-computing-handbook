docker-build:
	docker build -t kempner_institute/kempner_computing_book -f ./Docker/Dockerfile .
	docker run --rm -v $$PWD:/usr/src/app kempner_institute/kempner_computing_book jupyter-book build kempner_computing_handbook

build:
	uv run jupyter-book build kempner_computing_handbook

build-live: build
	uv run python -m http.server --directory kempner_computing_handbook/_build/html 8000

clean:
	uv run jupyter-book clean kempner_computing_handbook --all

