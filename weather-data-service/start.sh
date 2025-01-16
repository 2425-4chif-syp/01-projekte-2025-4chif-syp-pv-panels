#!/bin/bash

echo "🚀 Starting Weather Data Service deployment..."

echo "📦 Building the Quarkus application..."
if ./mvnw package -DskipTests; then
    echo "🐳 Building and starting Docker containers..."
    docker compose up --build -d

    echo "✅ Deployment completed successfully!"
    echo
    echo "Services available at:"
    echo "🔹 Backend: http://localhost:8181"
    echo "🔹 InfluxDB: http://localhost:8282"
    echo "🔹 Grafana: http://localhost:3333"
    echo
    echo "Credentials:"
    echo "📊 Grafana:"
    echo "   - Username: admin"
    echo "   - Password: admin"
    echo
    echo "📈 InfluxDB:"
    echo "   - Username: admin"
    echo "   - Password: adminpassword"
    echo "   - Organization: weather_org"
    echo "   - Bucket: weather_bucket"
    echo "   - Token: your-super-secret-admin-token"
    echo
else
    echo "❌ Failed to build the Quarkus application"
    exit 1
fi 