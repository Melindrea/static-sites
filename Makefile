all: build

build: main-build test ## Builds the entire site

post-build: main-build

main-build: clean
	@assemble

test:
	@node lib/html-validator.js

clean: ## Cleans the build folder
	@assemble clean

install: ## Installs NPM-dependencies (which triggers bower and bundle)
	@npm install

readme: ## Creates a README.md file through verb
	@verb readme

pre-deploy:
	@export NODE_ENV=production && make build
	@assemble cache-busting

deploy: pre-deploy ## Deploys the site
	rsync -rltvzp --checksum --delete ~/projects/static-sites/build/Release/* root@vps:/srv/web/$(SITE)

dry-deploy: pre-deploy ## Does a dry deploy of the site
	rsync -rltvzp --dry-run --checksum --delete ~/projects/static-sites/build/Release/* root@vps:/srv/web/$(SITE)

images: ## Process raw images and copy to assets: make images folder=<foldername>
	@if [ -d assets/$(SITE)/raw/$(folder) ]; then ./bin/process-images assets/$(SITE)/raw/$(folder) && cp -R assets/$(SITE)/raw/$(folder)/* assets/processed/$(SITE)/images/gallery; fi

.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
