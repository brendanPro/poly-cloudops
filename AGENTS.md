# AGENTS.md

## Project Overview

Poly-CloudOps is a Cloud Native automation architecture project that implements a real-time data processing and translation pipeline using DevOps principles. The system uses n8n for workflow orchestration, serverless containers (GCP Cloud Run / AWS App Runner), Infrastructure as Code (Terraform) for reproducible cloud provisioning, and Dagger.io for CI/CD workflow composition and execution.

The architecture is fully stateless, relying on external databases (Neon/Supabase) for persistence, simulating a production-ready environment.

## Setup Commands

### Prerequisites

- Install Bun: `curl -fsSL https://bun.sh/install | bash` or `brew install bun` (required for package management and git hooks)
- Install Terraform: `brew install terraform` (macOS) or follow [Terraform installation guide](https://developer.hashicorp.com/terraform/downloads)
- Install Docker: `brew install docker` or download from [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Install Cloud CLI tools:
  - GCP: `brew install google-cloud-sdk` then run `gcloud init`
  - AWS: `brew install awscli` then run `aws configure`
- Install GitHub CLI: `brew install gh` then run `gh auth login`
- Install Dagger CLI: `brew install dagger/tap/dagger` or follow [Dagger installation guide](https://docs.dagger.io/install)

### Initial Setup

- Clone the repository and navigate to the project directory
- **Install dependencies**: Run `bun install` (automatically sets up git hooks via Husky's prepare script)
- Set up GitHub Student Pack credentials: https://education.github.com/pack
- Configure cloud provider credentials (GCP or AWS)
- Initialize Dagger: `dagger init` (if not already initialized)
- Create a `.env.example` file and copy it to `.env` with your secrets
- Never commit `.env` files or secrets to version control

**Note:** Git hooks are automatically installed via Husky when running `bun install`. The `prepare` script in package.json ensures hooks are set up for all developers automatically.

### GitHub Actions Setup

**Configuring Workload Identity Federation** (for CI/CD authentication):

This project uses Workload Identity Federation (WIF) for keyless authentication to Google Cloud from GitHub Actions. The WIF provider and GitHub secrets are already configured.

**If you need to reconfigure or troubleshoot:**

1. **WIF Provider** (already created):
   - Created via Terraform in `terraform/main.tf`
   - Run `terraform output wif_provider_name` to see the provider resource name

2. **GitHub Repository Secrets** (already configured):
   - Navigate to: https://github.com/brendanPro/poly-cloudops/settings/secrets/actions
   - Required secrets:
     - `GCP_PROJECT_ID`: `polycloudops`
     - `GCP_WIF_PROVIDER`: Full WIF provider name (from terraform output)
     - `GCP_SERVICE_ACCOUNT`: `terraform-sa@GCP_PROJECT_ID.iam.gserviceaccount.com`

3. **IAM Binding** (requires project owner):
   - The terraform-sa service account needs the `roles/iam.workloadIdentityUser` binding
   - If the Terraform resource `google_service_account_iam_member.wif_binding` fails to apply:
   ```bash
   # Run this command as project owner (project-owner@example.com):
   gcloud iam service-accounts add-iam-policy-binding terraform-sa@GCP_PROJECT_ID.iam.gserviceaccount.com \
     --member="principalSet://iam.googleapis.com/projects/GCP_PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions-pool/attribute.repository/brendanPro/poly-cloudops" \
     --role="roles/iam.workloadIdentityUser"
   ```

4. **Verify Workflow Permissions**:
   - Repository Settings → Actions → General → Workflow permissions
   - Should be set to "Read and write permissions"

**Workflow Files**:
- `.github/workflows/terraform-validate.yml` - Terraform validation and planning

## Build and Test Commands

### Terraform Commands

- Initialize Terraform: `terraform init`
- Validate Terraform configuration: `terraform validate`
- Plan infrastructure changes: `terraform plan`
- Apply infrastructure: `terraform apply`
- Destroy infrastructure: `terraform destroy` (use with caution)
- Format Terraform files: `terraform fmt -recursive`

### Docker Commands

- Build n8n Docker image: `docker build -t n8n-custom:latest ./docker`
- Test Docker image locally: `docker run -p 5678:5678 n8n-custom:latest`
- Push to container registry: `docker push <registry>/n8n-custom:latest`

### Dagger Commands

- Initialize Dagger: `dagger init`
- Run Dagger workflows: `dagger do <function-name>`
- Test workflows locally: `dagger do build` or `dagger do test`
- List available functions: `dagger functions list`
- Develop interactively: `dagger shell` (opens interactive shell)
- Visualize workflow: `dagger do <function> --with-terminal-ui` (TUI mode)
- Check Dagger version: `dagger version`

### CI/CD Testing

- Test Dagger workflows locally before pushing: `dagger do <workflow-name>`
- Test GitHub Actions workflows locally: `act` (optional, requires Docker)
- Validate workflow syntax: Check `.github/workflows/*.yml` files
- **Manual workflow trigger**: GitHub → Actions → Terraform Validation → Run workflow
- View workflow runs: GitHub → Actions tab
- Check PR comments: Terraform plan output appears automatically on PRs
- **Authentication testing**: Verify WIF authentication in workflow logs (no credentials should appear)
- Always test workflows in a branch before merging to main
- Use Dagger for consistent local and CI execution

## Code Style Guidelines

### Terraform (HCL)

- Use consistent indentation (2 spaces)
- Group related resources with comments
- Use variables for all configurable values
- Store sensitive values in Terraform Cloud/state or environment variables
- Follow naming conventions: `resource_type_name` (e.g., `google_cloud_run_service_n8n`)
- Use `terraform fmt` before committing

### Docker

- Use multi-stage builds for smaller images
- Pin base image versions (avoid `latest` in production)
- Minimize layers and use `.dockerignore`
- Document environment variables in Dockerfile comments

### Dagger

- Write workflows as Dagger Functions using Dagger SDKs (TypeScript, Python, Go, etc.)
- Use Dagger types (Container, Directory, File) for type-safe workflows
- Leverage automatic caching for faster builds
- Create reusable Dagger modules for common operations
- Use Dagger secrets integration for secure credential handling
- Test workflows locally with `dagger do` before CI execution
- Structure workflows as composable functions

### GitHub Actions

- Use Dagger in GitHub Actions for consistent local/CI execution
- Call Dagger functions from GitHub Actions workflows
- Use reusable workflows when possible
- Store secrets in GitHub Secrets, never hardcode
- Use matrix strategies for multi-cloud testing
- Add proper error handling and notifications

### General

- Write clear commit messages following [Conventional Commits](https://www.conventionalcommits.org/) format
- Format: `<type>(<scope>): <subject>`
- Valid types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- Commit message format is enforced via git hooks (see `.husky/commit-msg`)
- For conventional commits we are using Husky version 9+, so the line `. "$(dirname -- "$0")/_/husky.sh"` is unnecessary in hook scripts and is obsolete ( can break version 10 )
#### Branch Naming Convention

Branch names must follow conventional commit types for consistency:

- **Format**: `<type>/<description>` or `<type>/<scope>/<description>`
- **Valid types**: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- **Rules**:
  - Use kebab-case (lowercase with hyphens) for descriptions
  - No uppercase letters, spaces, or special characters
  - Description should be concise and meaningful
  - Protected branches (main, master, develop, staging, production) are exempt

**Examples**:
- `feat/user-authentication` - New feature for user authentication
- `fix/api/connection-timeout` - Bug fix for API connection timeout (with scope)
- `docs/update-readme` - Documentation update
- `ci/dagger/add-build-workflow` - CI workflow addition (with scope)
- `refactor/terraform/cloud-run-service` - Refactoring Terraform code (with scope)
- `test/integration-tests` - Adding integration tests

**Enforcement**:
- `post-checkout` hook: Displays a friendly warning when you checkout/create a branch with an invalid name, with instructions to rename it
- `pre-push` hook: Blocks the push if the branch name doesn't follow the convention (hard enforcement)

#### Other Guidelines

- Use meaningful variable and resource names
- Add comments for complex logic or non-obvious decisions
- Keep functions and modules focused and small

## Testing Instructions

### Infrastructure Testing

- Run `terraform validate` before every commit
- Use `terraform plan` to preview changes
- Test in a development environment before production
- Verify all resources are created correctly after `terraform apply`
- Check Terraform state file is properly managed (use remote state)

### Application Testing

- Test n8n workflows locally before deploying
- Verify database connections work with external PostgreSQL
- Test API integrations (OpenAI, DeepL, etc.) with mock data first
- Validate environment variables are correctly passed to containers

### CI/CD Testing

- Test Dagger workflows locally: `dagger do <workflow-name>` before pushing
- Test GitHub Actions workflows on feature branches
- **Manual workflow trigger**: GitHub → Actions → Terraform Validation → Run workflow
- View workflow runs: GitHub → Actions tab
- Check PR comments: Terraform plan output appears automatically on PRs
- **Authentication testing**: Verify WIF authentication in workflow logs (no credentials should appear)
- Verify Docker image builds successfully via Dagger
- Ensure Terraform plans execute without errors
- Check that deployments update Cloud Run/App Runner correctly
- Use Dagger's built-in observability to debug workflow issues

### Security Testing

- Never commit secrets or API keys
- Use Terraform Cloud or secure secret management
- Verify IAM roles and permissions are minimal (least privilege)
- Test that database connections use SSL/TLS
- Review and rotate credentials regularly

## Security Considerations

- **Secrets Management**: Use GitHub Secrets for CI/CD, Terraform Cloud for IaC secrets
- **Database Security**: Always use connection strings with SSL enabled
- **IAM Permissions**: Follow least privilege principle for all cloud resources
- **Container Security**: Scan Docker images for vulnerabilities before deployment
- **Network Security**: Configure security groups and VPCs appropriately
- **State Management**: Use remote Terraform state with encryption
- **API Keys**: Store in secure vaults, never in code or version control

## Deployment Steps

### Initial Deployment

1. Set up cloud provider account and billing
2. Create container registry (GCR/ECR)
3. Initialize Terraform with remote state backend
4. Configure GitHub Secrets for CI/CD
5. Set up external database (Neon/Supabase)
6. Run `terraform apply` to create infrastructure
7. Build and push Docker image to registry
8. Deploy n8n service via Terraform

### CI/CD Deployment Flow

1. Push code to repository
2. GitHub Actions triggers on push to main
3. Dagger workflow executes (via `dagger do` in GitHub Actions)
4. Dagger builds Docker image from Dockerfile
5. Dagger pushes image to container registry
6. Dagger runs `terraform plan` to preview changes
7. Dagger runs `terraform apply` to update Cloud Run/App Runner
8. Verify deployment health and rollback if needed
9. Use Dagger Cloud (optional) for workflow visualization and insights

### Manual Deployment

- Build image: `docker build -t n8n-custom:latest ./docker`
- Tag image: `docker tag n8n-custom:latest <registry>/n8n-custom:<version>`
- Push image: `docker push <registry>/n8n-custom:<version>`
- Update Terraform variables with new image version
- Apply Terraform: `terraform apply`

## Workflow Development (n8n)

- Design workflows in n8n UI locally first
- Export workflows as JSON files
- Store workflow definitions in version control
- Test workflows with sample data
- Document workflow purpose and dependencies
- Optimize for cold start performance (minimize initialization time)

## Troubleshooting

- Check Terraform state: `terraform show`
- View Cloud Run logs: `gcloud logging read` or AWS CloudWatch
- Test database connection: Use `psql` or database client
- Verify environment variables: Check container configuration
- Review GitHub Actions logs: Check workflow run details
- Check container registry: Verify image exists and is accessible
- Debug Dagger workflows: Use `dagger do <function> --with-terminal-ui` for visualization
- Check Dagger engine status: `dagger version` and ensure engine is running
- View Dagger function logs: Check output from `dagger do` commands

## Useful Resources

- [Dagger Documentation](https://docs.dagger.io/) - Primary CI/CD workflow platform
- [Dagger Installation](https://docs.dagger.io/install) - Install Dagger CLI
- [Dagger SDKs](https://docs.dagger.io/sdks) - Language-specific SDKs for writing workflows
- [Dagger Modules](https://docs.dagger.io/modules) - Reusable workflow modules
- [Daggerverse](https://daggerverse.dev/) - Community module registry
- [Terraform Documentation](https://developer.hashicorp.com/terraform/docs)
- [n8n Documentation](https://docs.n8n.io/hosting/)
- [Neon PostgreSQL](https://neon.com/docs/introduction)
- [Google Cloud Run](https://cloud.google.com/run?hl=fr)
- [AWS Fargate](https://aws.amazon.com/fr/fargate/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

