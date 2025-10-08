# StreetCredRx Deployment Guide

## Prerequisites

### 1. Install Docker Desktop
- Download from: https://www.docker.com/products/docker-desktop
- Install and start Docker Desktop
- Verify installation: `docker --version`

### 2. Environment Variables
Ensure you have a `.env` file with the following variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Docker Deployment

### Build Docker Image
```bash
# Build the production image
docker build -t streetcredrx:latest .

# Or build with specific tag
docker build -t streetcredrx:v1.0.0 .
```

### Run Docker Container Locally
```bash
# Run on port 8080
docker run -p 8080:8080 streetcredrx:latest

# Run with environment variables
docker run -p 8080:8080 \
  -e VITE_SUPABASE_URL=your_url \
  -e VITE_SUPABASE_ANON_KEY=your_key \
  streetcredrx:latest

# Run in detached mode with name
docker run -d -p 8080:8080 --name streetcredrx-app streetcredrx:latest
```

### Access the Application
- Open browser to: http://localhost:8080

### Docker Commands Reference
```bash
# List running containers
docker ps

# Stop container
docker stop streetcredrx-app

# Start stopped container
docker start streetcredrx-app

# Remove container
docker rm streetcredrx-app

# View logs
docker logs streetcredrx-app

# View logs in real-time
docker logs -f streetcredrx-app

# List images
docker images

# Remove image
docker rmi streetcredrx:latest

# Clean up unused resources
docker system prune -a
```

## Docker Compose Deployment (Optional)

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8080:8080"
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
    restart: unless-stopped
    container_name: streetcredrx-app
```

Then run:
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

## Cloud Deployment Options

### Option 1: Fly.io (Current Deployment)
```bash
# Install Fly CLI
# PowerShell (Windows)
iwr https://fly.io/install.ps1 -useb | iex

# Deploy
fly deploy

# Check status
fly status

# View logs
fly logs

# Open app in browser
fly open
```

### Option 2: AWS ECS/ECR
```bash
# 1. Create ECR repository
aws ecr create-repository --repository-name streetcredrx

# 2. Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account-id.dkr.ecr.us-east-1.amazonaws.com

# 3. Tag image
docker tag streetcredrx:latest your-account-id.dkr.ecr.us-east-1.amazonaws.com/streetcredrx:latest

# 4. Push to ECR
docker push your-account-id.dkr.ecr.us-east-1.amazonaws.com/streetcredrx:latest

# 5. Deploy to ECS (requires ECS cluster setup)
```

### Option 3: Google Cloud Run
```bash
# 1. Build and tag
docker build -t gcr.io/your-project-id/streetcredrx:latest .

# 2. Push to GCR
docker push gcr.io/your-project-id/streetcredrx:latest

# 3. Deploy to Cloud Run
gcloud run deploy streetcredrx \
  --image gcr.io/your-project-id/streetcredrx:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

### Option 4: Azure Container Instances
```bash
# 1. Login to Azure
az login

# 2. Create resource group
az group create --name streetcredrx-rg --location eastus

# 3. Create container registry
az acr create --resource-group streetcredrx-rg --name streetcredrxacr --sku Basic

# 4. Login to ACR
az acr login --name streetcredrxacr

# 5. Tag and push
docker tag streetcredrx:latest streetcredrxacr.azurecr.io/streetcredrx:latest
docker push streetcredrxacr.azurecr.io/streetcredrx:latest

# 6. Deploy to ACI
az container create \
  --resource-group streetcredrx-rg \
  --name streetcredrx-app \
  --image streetcredrxacr.azurecr.io/streetcredrx:latest \
  --cpu 1 --memory 1 \
  --registry-login-server streetcredrxacr.azurecr.io \
  --ports 8080 \
  --dns-name-label streetcredrx
```

### Option 5: DigitalOcean App Platform
```bash
# Use DigitalOcean web interface or doctl CLI
doctl apps create --spec digitalocean-app.yaml
```

Create `digitalocean-app.yaml`:
```yaml
name: streetcredrx
services:
- name: web
  dockerfile_path: Dockerfile
  source_dir: /
  github:
    repo: Swimhack/SCRED
    branch: main
  http_port: 8080
  instance_count: 1
  instance_size_slug: basic-xxs
  routes:
  - path: /
```

## Production Checklist

### Before Deployment
- [ ] All tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Supabase Storage buckets created
- [ ] SSL/TLS certificates ready (handled by platform)
- [ ] Domain DNS configured

### Supabase Setup
1. **Storage Buckets** (Required for file uploads):
   ```sql
   -- Create buckets in Supabase Dashboard
   - applications (for pharmacist applications)
   - documents (for supporting documents)
   - facilities (for facility documents)
   ```

2. **Storage Policies**:
   ```sql
   -- Allow authenticated users to upload
   CREATE POLICY "Allow authenticated uploads" ON storage.objects
   FOR INSERT TO authenticated
   WITH CHECK (bucket_id = 'applications');
   
   -- Allow users to view their own files
   CREATE POLICY "Allow user file access" ON storage.objects
   FOR SELECT TO authenticated
   USING (bucket_id = 'applications' AND (storage.foldername(name))[1] = auth.uid()::text);
   ```

3. **Database Tables** (Already configured):
   - pharmacist_questionnaires
   - facility_questionnaires
   - user_profiles
   - pharmacist_applications

### After Deployment
- [ ] Verify application loads
- [ ] Test authentication flow
- [ ] Test form submissions
- [ ] Test file uploads
- [ ] Verify admin dashboard access
- [ ] Check email notifications
- [ ] Monitor error logs
- [ ] Set up monitoring/alerts

## Environment-Specific Configurations

### Development
```bash
npm run dev
# Runs on http://localhost:5173
```

### Staging
```bash
# Build for staging
npm run build:dev

# Deploy to staging environment
fly deploy --config fly.staging.toml
```

### Production
```bash
# Build for production
npm run build

# Deploy to production
fly deploy
```

## Troubleshooting

### Docker Issues
```bash
# If build fails, clean cache
docker builder prune

# If container won't start, check logs
docker logs streetcredrx-app

# Inspect running container
docker exec -it streetcredrx-app sh
```

### Application Issues
```bash
# Check nginx config
docker exec streetcredrx-app cat /etc/nginx/conf.d/default.conf

# Check if files are present
docker exec streetcredrx-app ls -la /usr/share/nginx/html

# Test nginx config
docker exec streetcredrx-app nginx -t
```

### Port Already in Use
```bash
# Windows: Find process using port 8080
netstat -ano | findstr :8080

# Kill process (replace PID with actual process ID)
taskkill /F /PID <PID>

# Or use different port
docker run -p 3000:8080 streetcredrx:latest
```

## Monitoring & Maintenance

### Health Checks
The nginx server includes health monitoring. Add to docker-compose.yml:
```yaml
healthcheck:
  test: ["CMD", "wget", "-q", "--spider", "http://localhost:8080"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### Logging
```bash
# Application logs
docker logs -f streetcredrx-app

# Fly.io logs
fly logs

# Export logs
fly logs > logs.txt
```

### Scaling (Fly.io)
```bash
# Scale to 2 instances
fly scale count 2

# Scale VM size
fly scale vm shared-cpu-2x

# View current scale
fly scale show
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Secrets Management**: Use platform secret stores
3. **HTTPS**: Always use HTTPS in production (handled by platform)
4. **CORS**: Configure appropriate CORS policies in Supabase
5. **Rate Limiting**: Consider adding rate limiting for API endpoints
6. **Input Validation**: All forms have validation
7. **File Upload**: Size limits and type restrictions in place

## Performance Optimization

1. **Asset Caching**: Configured in nginx.conf (1 year for static assets)
2. **Gzip Compression**: Enabled in nginx.conf
3. **Code Splitting**: Vite automatically splits large chunks
4. **Image Optimization**: Use WebP format where possible
5. **CDN**: Consider CloudFlare for static asset delivery

## Backup & Recovery

### Database Backups
Supabase provides automatic daily backups. Manual backup:
```bash
# Export database
pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql
```

### Storage Backups
```bash
# Use Supabase CLI or API to sync storage buckets
```

## Support & Documentation

- **Supabase Docs**: https://supabase.com/docs
- **Fly.io Docs**: https://fly.io/docs
- **Docker Docs**: https://docs.docker.com
- **Vite Docs**: https://vitejs.dev

## Version History

- v1.0.0 (Current): Initial production release
  - User authentication
  - Pharmacist & Facility questionnaires
  - File upload system
  - Admin dashboard
  - CAQH integration
  - Role-based access control

## Next Steps

After successful deployment:
1. Configure custom domain
2. Set up monitoring (e.g., Sentry, LogRocket)
3. Configure email service (SendGrid, AWS SES)
4. Set up CI/CD pipeline (GitHub Actions)
5. Implement automated testing in CI
6. Configure backup schedules
7. Set up staging environment
8. Document API endpoints
9. Create user training materials
10. Plan for scalability

---

**Last Updated**: $(date)
**Maintained by**: Development Team
**Contact**: support@streetcredrx.com
