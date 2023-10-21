all: start

start:
	bun run src/index.ts

install:
	bun install
	npm install

migrate: 
	npx prisma migrate dev --name init --preview-feature
	npx prisma generate

redis:
	docker run -p 6379:6379 -it redis/redis-stack-server:latest

