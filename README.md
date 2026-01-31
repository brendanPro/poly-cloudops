# Poly-CloudOps

**Cloud-Translate Pipeline** - A Cloud Native automation architecture project

## Students 
- Samuel
- Elyazid
- Ouidad

## 📋 Project Description

This project aims to design, deploy, and maintain a Cloud Native automation architecture using DevOps principles. The goal is to create a real-time data processing and translation pipeline using n8n and AI models, implementing modern pillars of Cloud engineering:

- **Serverless Containers** (GCP Cloud Run / AWS App Runner) for code execution
- **Infrastructure as Code (Terraform)** for reproducible cloud environment provisioning
- **Dagger.io** for CI/CD workflow composition and execution

The system is fully **stateless** and relies on an external database for persistence, simulating a production-ready architecture.

## 🎯 Learning Objectives

By completing this project, students will acquire:

- **DevOps & IaC**: Master Terraform for cloud infrastructure management
- **Cloud Native Architecture**: Design and deploy Microservices (Compute vs. State) and Serverless architectures
- **CI/CD Development**: Set up continuous integration and continuous delivery pipelines using Dagger.io and GitHub Actions

## 🛠️ Technologies

| Category | Technologies |
|----------|-------------|
| **Infrastructure** | Terraform (HCL), Dagger.io (CI/CD workflows), GitHub Actions, Cloud CLI (gcloud/aws cli) |
| **Server** | Google Cloud Run, AWS App Runner / Fargate, Docker (optimized n8n image) |
| **Storage** | PostgreSQL (Neon/Supabase), AWS S3 / Google Storage |
| **Application** | n8n (Workflow Engine), AI APIs (OpenAI, DeepL, etc.), Frontend (React / Vue) |

## 📚 Work Breakdown

### Phase 1: Infrastructure as Code (IaC) with Terraform

**Objectives:**
- Define the Cloud environment (Network, Security Groups) using HCL
- Provision Cloud services declaratively (Cloud Run/App Runner) and external Database (Neon/Supabase)
- Manage Terraform state and Cloud secrets (Security)

**Tasks:**
- [ ] Set up Terraform project structure
- [ ] Configure Terraform backend (remote state)
- [ ] Define network and security configurations
- [ ] Create Cloud Run / App Runner service definitions
- [ ] Set up external PostgreSQL database (Neon/Supabase)
- [ ] Implement secret management for sensitive data
- [ ] Test infrastructure provisioning and teardown

**Deliverables:**
- Terraform configuration files
- Infrastructure documentation
- State management setup

### Phase 2: Serverless Architecture & Persistence

**Objectives:**
- Strict separation of Compute (n8n Docker) and State (Database)
- Configure n8n container to connect to external database via secure environment variables
- Set up Managed or Serverless Database service (e.g., Neon/Supabase)

**Tasks:**
- [ ] Create optimized Docker image for n8n
- [ ] Configure n8n to use external PostgreSQL database
- [ ] Set up database connection via environment variables
- [ ] Test stateless container behavior
- [ ] Verify data persistence in external database
- [ ] Implement connection pooling and retry logic

**Deliverables:**
- Dockerfile for n8n
- Database configuration
- Connection documentation

### Phase 3: CI/CD & Deployment

**Objectives:**
- Set up Dagger.io for CI/CD workflow composition and execution
- Integrate Dagger workflows with GitHub Actions for Continuous Delivery
- Workflow should rebuild n8n Docker image, push to Container Registry, then trigger Terraform to deploy new version on Cloud Run/App Runner

**Tasks:**
- [ ] Initialize Dagger project: `dagger init`
- [ ] Create Dagger functions for build, test, and deploy workflows
- [ ] Write Dagger workflows using Dagger SDK (TypeScript, Python, or Go)
- [ ] Configure Docker image build and push to registry via Dagger
- [ ] Integrate Terraform execution in Dagger workflows
- [ ] Set up GitHub Actions to call Dagger functions
- [ ] Set up automated testing in pipeline
- [ ] Implement deployment strategies (blue/green, canary)
- [ ] Add rollback mechanisms
- [ ] Configure notifications for deployment status
- [ ] Test workflows locally with `dagger do` before CI execution

**Deliverables:**
- Dagger module with workflow functions
- GitHub Actions workflow files (calling Dagger)
- CI/CD pipeline documentation
- Deployment runbook

### Phase 4: Workflow Orchestration (n8n)

**Objectives:**
- Design an API integration workflow (e.g., Micro / Speech-to-Text / Translation / Response)
- Optimize performance and manage latency (Cold Start)

**Tasks:**
- [ ] Design n8n workflow for data processing/translation
- [ ] Integrate AI APIs (OpenAI, DeepL, etc.)
- [ ] Implement error handling and retry logic
- [ ] Optimize workflow for cold start performance
- [ ] Add monitoring and logging
- [ ] Create frontend interface (React/Vue) for workflow management
- [ ] Test end-to-end workflow execution

**Deliverables:**
- n8n workflow definitions
- API integration documentation
- Frontend application (optional)
- Performance optimization report

## 🚀 Getting Started

### Prerequisites

1. **GitHub Student Pack**: Get access at https://education.github.com/pack
2. **Cloud Provider Account**: Set up GCP or AWS account (free tier available)
3. **Development Tools**: 
   - **Bun**: Install Bun package manager: `curl -fsSL https://bun.sh/install | bash` or `brew install bun`
   - **Terraform**: `brew install terraform` or follow [Terraform installation guide](https://developer.hashicorp.com/terraform/downloads)
   - **Docker**: `brew install docker` or download from [Docker Desktop](https://www.docker.com/products/docker-desktop)
   - **Dagger CLI**: `brew install dagger/tap/dagger` or follow [Dagger installation guide](https://docs.dagger.io/install)
   - **Cloud CLI tools**: 
     - GCP: `brew install google-cloud-sdk` then run `gcloud init`
     - AWS: `brew install awscli` then run `aws configure`

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd poly-cloudops
   ```

2. **Install dependencies (automatically sets up git hooks)**
   ```bash
   bun install
   ```
   
   > **Note:** This automatically installs Husky and sets up git hooks via the `prepare` script. No manual setup needed!

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Initialize Dagger**
   ```bash
   dagger init
   ```

5. **Initialize Terraform**
   ```bash
   terraform init
   ```

6. **Review the project structure**
   - `dagger/` or `src/` - Dagger module with CI/CD workflow functions
   - `terraform/` - Infrastructure as Code
   - `docker/` - Docker configuration for n8n
   - `.github/workflows/` - GitHub Actions workflows (calling Dagger)
   - `workflows/` - n8n workflow definitions
   - `.husky/` - Git hooks (automatically installed via Husky)
   - `scripts/` - Utility scripts

7. **Follow the phase-by-phase work breakdown above**

### Staging Environment (Neon & Automation)

To test the project in an environment close to production, we use Neon PostgreSQL as a managed database.

1. **Database & User Automation**
The staging environment is designed to be "zero-config" for the user:

Automated Setup: When you launch the stack, a custom SQL Bootstrap script automatically creates the Admin user and bypasses the n8n welcome screen.

Shared Data: Since we all share the same Neon Database, all workflows and credentials already registered in the neondb are immediately available to everyone.

2. **How to launch**
To start the staging stack with the pre-configured database:

\# 1. Ensure your .env.staging is correctly filled with Neon credentials
\# 2. Launch the stack using the staging environment file
docker-compose --env-file .env.staging up -d
**⚠️ Critical Warnings**
Encryption Key: You must keep the same N8N_ENCRYPTION_KEY once the database is initialized. If you change this key, n8n will be unable to decrypt existing credentials, and you will lose access to your integrations (DeepL, etc.).

Shared State: Any workflow modification or deletion in Staging will be reflected for all users sharing the same Neon instance.

## 📝 Commit Message Format

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for commit messages. The format is enforced via git hooks.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

### Examples

```bash
feat(terraform): add cloud run service configuration
fix(dagger): resolve docker image build caching issue
docs(readme): update getting started instructions
ci(github): add dagger workflow for automated deployment
```

### Setup

**Automatic Setup:** Git hooks are automatically installed when you run `bun install` thanks to Husky's `prepare` script. No manual setup needed!

The setup process:
1. When you run `bun install`, the `prepare` script automatically runs
2. Husky installs git hooks from `.husky/` directory
3. The `commit-msg` hook validates your commit messages against Conventional Commits format
4. Git commit template is configured automatically

The git hook enforces the commit format and will reject invalid commit messages. See `.gitmessage` for the full template and guidelines.

**Note:** This project uses [Bun](https://bun.sh) as the package manager. Make sure you have Bun installed before running `bun install`.

## 📖 Documentation

- See `AGENTS.md` for detailed development instructions and best practices
- Check `spec/Projet polytech angers.pdf` for the complete project specification

## 🔗 Useful Links

- [Dagger Documentation](https://docs.dagger.io/) - CI/CD workflow platform
- [Dagger Installation](https://docs.dagger.io/install) - Install Dagger CLI
- [Dagger SDKs](https://docs.dagger.io/sdks) - Language-specific SDKs for writing workflows
- [Daggerverse](https://daggerverse.dev/) - Community module registry
- [Terraform Documentation](https://developer.hashicorp.com/terraform/docs)
- [n8n Documentation](https://docs.n8n.io/hosting/)
- [Neon PostgreSQL](https://neon.com/docs/introduction)
- [Google Cloud Run](https://cloud.google.com/run?hl=fr)
- [AWS Fargate](https://aws.amazon.com/fr/fargate/)
- [GCP vs AWS CaaS Comparison](https://dev.to/yash_sonawane25/aws-fargate-vs-google-cloud-run-serverless-container-wars-585p)

## 👥 Contact

**Supervisor:** Brendan Gouin

- 📧 Email: brendan.gouin.pro@gmail.com
- 📞 Phone: 07 83 38 83 02
- 🖼️ LinkedIn: [www.linkedin.com/in/brendan-gouin](https://www.linkedin.com/in/brendan-gouin)
- 🌐 GitHub: [https://github.com/brendanPro](https://github.com/brendanPro)

## 📝 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
