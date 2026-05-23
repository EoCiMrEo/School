# Poolcrest Docker Quick Reference

## 🚀 Quick Start Commands

```powershell
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f poolcrest-be
docker-compose logs -f poolcrest-fe
```

## 🔨 Build Commands

```powershell
# Build all images
docker-compose build

# Build without cache
docker-compose build --no-cache

# Build specific service
docker-compose build poolcrest-be
docker-compose build poolcrest-fe

# Build with pull (get latest base images)
docker-compose build --pull
```

## 🏃 Run Commands

```powershell
# Start all services
docker-compose up -d

# Start specific services
docker-compose up -d poolcrest_db redis
docker-compose up -d poolcrest-be

# Restart service
docker-compose restart poolcrest-be

# Stop all services
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes
docker-compose down -v
```

## 🔍 Status & Info Commands

```powershell
# Check running containers
docker-compose ps

# Check container health
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# View resource usage
docker stats

# Inspect service
docker-compose config
docker-compose logs --tail=50 poolcrest-be
```

## 🐚 Execute Commands in Containers

```powershell
# Backend commands
docker-compose exec poolcrest-be python manage.py migrate
docker-compose exec poolcrest-be python manage.py createsuperuser
docker-compose exec poolcrest-be python manage.py collectstatic --noinput
docker-compose exec poolcrest-be python manage.py shell

# Interactive bash shell
docker-compose exec poolcrest-be bash
docker-compose exec poolcrest-fe sh

# One-time command (creates temporary container)
docker-compose run --rm poolcrest-be python manage.py check
```

## 📊 Database Commands

```powershell
# Access PostgreSQL shell
docker-compose exec poolcrest_db psql -U postgres -d poolcrest_db

# Backup database
docker-compose exec poolcrest_db pg_dump -U postgres poolcrest_db > backup_$(date +%Y%m%d).sql

# Restore database
Get-Content backup.sql | docker-compose exec -T poolcrest_db psql -U postgres poolcrest_db

# Reset database (DANGER!)
docker-compose down -v
docker volume rm poolcrest_postgres_data
docker-compose up -d poolcrest_db
docker-compose exec poolcrest-be python manage.py migrate
```

## 🧹 Cleanup Commands

```powershell
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything (CAREFUL!)
docker system prune -a --volumes

# Remove specific volume
docker volume rm poolcrest_postgres_data
docker volume rm poolcrest_be_media
```

## 🔐 Security & Permissions

```powershell
# Fix permissions on backend volumes
docker-compose exec -u root poolcrest-be chown -R poolcrest:poolcrest /app/logs
docker-compose exec -u root poolcrest-be chown -R poolcrest:poolcrest /app/media

# Check user running in container
docker-compose exec poolcrest-be whoami
docker-compose exec poolcrest-fe whoami
```

## 🐛 Troubleshooting Commands

```powershell
# Check container logs (last 100 lines)
docker-compose logs --tail=100 poolcrest-be

# Follow logs in real-time
docker-compose logs -f poolcrest-be

# Check network connectivity
docker-compose exec poolcrest-be ping poolcrest_db
docker-compose exec poolcrest-fe curl http://poolcrest-be:8000/api/health/

# Inspect container
docker inspect poolcrest-be

# Check environment variables
docker-compose exec poolcrest-be env

# Test database connection
docker-compose exec poolcrest-be python manage.py check --database default

# Verify nginx config
docker-compose exec poolcrest-fe nginx -t
```

## 🌐 Health Check Commands

```powershell
# Backend health
curl http://localhost:8000/api/health/

# Frontend health
curl http://localhost:4028/health

# Database health
docker-compose exec poolcrest_db pg_isready -U postgres

# Redis health
docker-compose exec redis redis-cli ping
```

## 📦 Volume Management

```powershell
# List volumes
docker volume ls

# Inspect volume
docker volume inspect poolcrest_postgres_data

# Backup media files
docker run --rm -v poolcrest_be_media:/data -v ${PWD}:/backup alpine tar czf /backup/media-backup.tar.gz /data

# Restore media files
docker run --rm -v poolcrest_be_media:/data -v ${PWD}:/backup alpine tar xzf /backup/media-backup.tar.gz -C /
```

## 🔄 Update & Maintenance

```powershell
# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build --force-recreate

# Update specific service
docker-compose up -d --build --force-recreate poolcrest-be

# Scale service (if configured)
docker-compose up -d --scale poolcrest-be=3
```

## 🏭 Production Commands

```powershell
# Initial setup
docker-compose up -d poolcrest_db redis
Start-Sleep -Seconds 10
docker-compose run --rm poolcrest-be python manage.py migrate
docker-compose run --rm poolcrest-be python manage.py createsuperuser
docker-compose run --rm poolcrest-be python manage.py collectstatic --noinput
docker-compose up -d

# Zero-downtime restart (if using multiple instances)
docker-compose up -d --no-deps --build poolcrest-be
docker-compose restart poolcrest-be

# Full restart
docker-compose down
docker-compose up -d

# View live stats
docker stats poolcrest-be poolcrest-fe poolcrest_db redis
```

## 📝 Logging Commands

```powershell
# View all logs
docker-compose logs

# View logs since timestamp
docker-compose logs --since 2023-01-01T00:00:00

# View logs until timestamp
docker-compose logs --until 2023-12-31T23:59:59

# Save logs to file
docker-compose logs > logs.txt

# Clear logs (restart container)
docker-compose restart poolcrest-be
```

## 🎯 Development Shortcuts

```powershell
# Quick restart after code change
docker-compose restart poolcrest-be

# Run tests
docker-compose exec poolcrest-be python manage.py test

# Create Django app
docker-compose exec poolcrest-be python manage.py startapp myapp

# Make migrations
docker-compose exec poolcrest-be python manage.py makemigrations

# Create admin user
docker-compose exec poolcrest-be python manage.py createsuperuser --username admin --email admin@poolcrest.com

# Django shell
docker-compose exec poolcrest-be python manage.py shell

# Database shell
docker-compose exec poolcrest-be python manage.py dbshell
```

## 🔧 Useful Aliases (Add to PowerShell Profile)

```powershell
# Add these to your PowerShell profile: $PROFILE

function dc { docker-compose $args }
function dcup { docker-compose up -d $args }
function dcdown { docker-compose down $args }
function dclogs { docker-compose logs -f $args }
function dcps { docker-compose ps $args }
function dcrestart { docker-compose restart $args }
function dcexec { docker-compose exec $args }

# Usage after adding aliases:
# dc up -d
# dcexec poolcrest-be python manage.py migrate
# dclogs poolcrest-be
```

## 🆘 Emergency Commands

```powershell
# Force stop all containers
docker-compose kill

# Remove all Poolcrest containers
docker-compose down -v --remove-orphans

# Complete reset (NUCLEAR OPTION)
docker-compose down -v
docker system prune -a --volumes -f
docker network prune -f

# Recover from corrupted state
docker-compose down
docker rm -f $(docker ps -aq)
docker-compose up -d --build --force-recreate
```

## 📱 Port Reference

- **4028**: Frontend (Nginx)
- **8000**: Backend (Django/Gunicorn)
- **5432**: PostgreSQL Database
- **6379**: Redis

## 🌍 Environment Files

- Backend: `be/.env`
- Frontend: `fe/.env` (optional)
- Docker Compose: `.env` (in project root, optional)

---

**Tip**: Use `docker-compose --help` or `docker-compose [command] --help` for detailed information about any command.
