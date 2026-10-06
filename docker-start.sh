#!/bin/bash

# Script khởi chạy Docker cho Xuân Lộc Backend
# Usage: ./docker-start.sh [dev|prod]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    print_success "Docker is running"
}

# Check if docker-compose is available
check_docker_compose() {
    if ! command -v docker-compose >/dev/null 2>&1; then
        print_error "docker-compose is not installed"
        exit 1
    fi
    print_success "docker-compose is available"
}

# Setup environment file
setup_env() {
    if [ ! -f .env ]; then
        print_info "Creating .env file from template..."
        cp .env.docker .env
        print_warning "Please update .env file with your configuration, especially JWT secrets!"
    else
        print_info ".env file already exists"
    fi
}

# Start services
start_services() {
    local mode=${1:-prod}
    
    print_info "Starting services in $mode mode..."
    
    if [ "$mode" = "dev" ]; then
        print_info "Starting with development tools (PgAdmin, Redis Commander)"
        docker-compose --profile dev up -d
    else
        print_info "Starting production services only"
        docker-compose up -d
    fi
}

# Wait for services to be healthy
wait_for_services() {
    print_info "Waiting for services to be healthy..."
    
    # Wait for PostgreSQL
    print_info "Waiting for PostgreSQL..."
    timeout 60 bash -c 'until docker-compose exec -T postgres pg_isready -U postgres -d backend_hg_construction; do sleep 2; done'
    
    # Wait for Redis
    print_info "Waiting for Redis..."
    timeout 30 bash -c 'until docker-compose exec -T redis redis-cli ping | grep PONG; do sleep 2; done'
    
    # Wait for Backend
    print_info "Waiting for Backend..."
    timeout 90 bash -c 'until curl -f http://localhost:4000/health >/dev/null 2>&1; do sleep 3; done'
    
    print_success "All services are healthy!"
}

# Show service status
show_status() {
    print_info "Service Status:"
    docker-compose ps
    
    echo
    print_info "Available endpoints:"
    echo "  Backend API: http://localhost:4000"
    echo "  Backend Health: http://localhost:4000/health"
    echo "  PostgreSQL: localhost:5435"
    echo "  Redis: localhost:6379"
    
    if docker-compose ps | grep -q pgadmin; then
        echo "  PgAdmin: http://localhost:5050"
    fi
    
    if docker-compose ps | grep -q redis-commander; then
        echo "  Redis Commander: http://localhost:8081"
    fi
}

# Run database migrations
run_migrations() {
    print_info "Running database migrations..."
    docker-compose exec backend yarn db:migrate || print_warning "Migration failed or no migrations to run"
}

# Show logs
show_logs() {
    local service=${1:-}
    
    if [ -n "$service" ]; then
        print_info "Showing logs for $service..."
        docker-compose logs -f "$service"
    else
        print_info "Showing logs for all services..."
        docker-compose logs -f
    fi
}

# Stop services
stop_services() {
    print_info "Stopping services..."
    docker-compose down
    print_success "Services stopped"
}

# Clean everything (including volumes)
clean_all() {
    print_warning "This will remove all containers, networks, and volumes (including data)!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cleaning up everything..."
        docker-compose down -v --remove-orphans
        docker system prune -f
        print_success "Cleanup completed"
    else
        print_info "Cleanup cancelled"
    fi
}

# Main script logic
main() {
    local command=${1:-start}
    local mode=${2:-prod}
    
    case $command in
        start)
            check_docker
            check_docker_compose
            setup_env
            start_services "$mode"
            wait_for_services
            run_migrations
            show_status
            ;;
        stop)
            stop_services
            ;;
        restart)
            stop_services
            sleep 2
            main start "$mode"
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs "$mode"
            ;;
        migrate)
            run_migrations
            ;;
        clean)
            clean_all
            ;;
        *)
            echo "Usage: $0 {start|stop|restart|status|logs|migrate|clean} [dev|prod]"
            echo ""
            echo "Commands:"
            echo "  start [dev|prod]  - Start all services (default: prod)"
            echo "  stop              - Stop all services"
            echo "  restart [dev|prod]- Restart all services"
            echo "  status            - Show service status and endpoints"
            echo "  logs [service]    - Show logs (all services or specific service)"
            echo "  migrate           - Run database migrations"
            echo "  clean             - Clean all containers and volumes (DESTRUCTIVE)"
            echo ""
            echo "Modes:"
            echo "  prod  - Production mode (default)"
            echo "  dev   - Development mode (includes PgAdmin, Redis Commander)"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"