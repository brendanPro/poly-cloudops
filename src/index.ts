import { dag, object, func, Secret, Container } from "@dagger.io/dagger";

const TERRAFORM_IMAGE = "hashicorp/terraform:1.0.11";
const WORKDIR = "/src/terraform";

@object()
export class PolyCloudops {
  private terraformBase(): Container {
    return dag
      .container()
      .from(TERRAFORM_IMAGE)
      .withDirectory("/src", dag.currentModule().source())
      .withWorkdir(WORKDIR);
  }

  private withAuth(container: Container, googleOauthAccessToken: Secret): Container {
    return container.withSecretVariable(
      "GOOGLE_OAUTH_ACCESS_TOKEN",
      googleOauthAccessToken
    );
  }

  private withTerraformVars(
    container: Container,
    n8nAdminPassword: Secret,
    neonApiKey: Secret,
    neonOrgId: Secret
  ): Container {
    return container
      .withSecretVariable("TF_VAR_n8n_admin_password", n8nAdminPassword)
      .withSecretVariable("TF_VAR_neon_api_key", neonApiKey)
      .withSecretVariable("TF_VAR_neon_org_id", neonOrgId);
  }

  @func()
  async validate(googleOauthAccessToken: Secret): Promise<string> {
    const container = this.withAuth(this.terraformBase(), googleOauthAccessToken)
      .withExec(["terraform", "fmt", "-check", "-recursive"])
      .withExec(["terraform", "init"])
      .withExec(["terraform", "validate", "-no-color"]);

    return await container.stdout();
  }

  @func()
  async plan(
    googleOauthAccessToken: Secret,
    n8nAdminPassword: Secret,
    neonApiKey: Secret,
    neonOrgId: Secret
  ): Promise<string> {
    const container = this.withTerraformVars(
      this.withAuth(this.terraformBase(), googleOauthAccessToken),
      n8nAdminPassword,
      neonApiKey,
      neonOrgId
    )
      .withExec(["terraform", "fmt", "-check", "-recursive"])
      .withExec(["terraform", "init"])
      .withExec(["terraform", "validate", "-no-color"])
      .withExec(["terraform", "plan", "-no-color", "-input=false"]);

    return await container.stdout();
  }

  @func()
  async apply(
    branch: string,
    googleOauthAccessToken: Secret,
    n8nAdminPassword: Secret,
    neonApiKey: Secret,
    neonOrgId: Secret
  ): Promise<string> {
    if (branch !== "main") {
      throw new Error("terraform apply is only allowed on main");
    }

    const container = this.withTerraformVars(
      this.withAuth(this.terraformBase(), googleOauthAccessToken),
      n8nAdminPassword,
      neonApiKey,
      neonOrgId
    )
      .withExec(["terraform", "init"])
      .withExec(["terraform", "apply", "-auto-approve", "-input=false"]);

    return await container.stdout();
  }
}
