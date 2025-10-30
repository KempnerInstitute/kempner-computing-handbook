docker-build:
	docker build -t kempner_institute/kempner_computing_book -f ./Docker/Dockerfile .
	docker run --rm -v $$PWD:/usr/src/app kempner_institute/kempner_computing_book jupyter-book build kempner_computing_handbook

build:
	jupyter-book build kempner_computing_handbook

clean:
	jupyter-book clean kempner_computing_handbook --all

