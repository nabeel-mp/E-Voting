
# Stage 1: Build the Go binary
FROM golang:1.25-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy dependency files first to leverage Docker layer caching
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code
COPY . .

# Build the application as a static binary
# CGO_ENABLED=0 ensures the binary is self-contained and works on minimal images
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o main ./cmd/main.go

# Stage 2: Final minimal image for production
FROM alpine:latest

# Install runtime dependencies (tzdata for IST time logs used in your code)
RUN apk add --no-cache ca-certificates tzdata

WORKDIR /root/

# Copy the compiled binary from the builder stage
COPY --from=builder /app/main .

# Copy assets and frontend build if they are served by Go
# Based on main.go: app.Static("/", "./evoting-frontend/dist")
COPY --from=builder /app/evoting-frontend/dist ./evoting-frontend/dist

# Ensure the uploads directory exists for avatars as required by main.go
RUN mkdir -p uploads/avatars

# Expose the application port defined in your config
EXPOSE 8080

# Run the application
CMD ["./main"]