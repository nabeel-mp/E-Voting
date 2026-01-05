# ---------- Stage 1: Build ----------
FROM golang:1.25-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy go.mod and go.sum first to leverage Docker cache
COPY go.mod go.sum ./
RUN go mod download

# Copy the entire source code (including new voter_register.go, etc.)
COPY . .

# Build the Go application as a static binary
# CGO_ENABLED=0 ensures it runs on lean images like alpine/scratch
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/main.go

# ---------- Stage 2: Final Run ----------
FROM alpine:latest

# Install runtime dependencies for timezones and SSL
RUN apk add --no-cache ca-certificates tzdata

WORKDIR /root/

# Copy only the compiled binary from the builder stage
COPY --from=builder /app/main .
# Copy .env if you aren't passing variables via docker-compose
COPY --from=builder /app/.env . 

# Expose the app port (default 3000)
EXPOSE 3000

# Run the application
CMD ["./main"]