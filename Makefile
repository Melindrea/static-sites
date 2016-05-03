all: build

build: main-build test ## Builds the entire site

post-build: main-build

main-build: clean
	@assemble

test:
	@node lib/html-validator.js && node lib/html-validator.js

clean: ## Cleans the build folder
	@assemble clean

install: ## Installs NPM-dependencies (which triggers bower and bundle)
	@npm install

readme: ## Creates a README.md file through verb
	@verb readme

pre-deploy:
	@export NODE_ENV=production && make build
	@assemble cache-busting

deploy: pre-deploy
	rsync -rltvzp --checksum --delete ~/projects/antoniusm.se/build/Release/* root@vps:/srv/web/antoniusm.se

dry-deploy: pre-deploy
	rsync -rltvzp --dry-run --checksum --delete ~/projects/antoniusm.se/build/Release/* root@vps:/srv/web/antoniusm.se


.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
