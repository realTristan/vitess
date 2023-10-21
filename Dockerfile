# TODO: Fix
FROM oven/bun:latest
WORKDIR /app
COPY . /app

# Install dependencies
RUN bun install

# Run the app and redis server
EXPOSE 3000

CMD ["bun", "run", "index.ts"]