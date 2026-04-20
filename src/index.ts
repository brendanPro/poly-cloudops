import { dag, object, func, Secret, Container } from "@dagger.io/dagger";

const TERRAFORM_IMAGE = "hashicorp/terraform:latest";
const WORKDIR = "/src/terraform";

@object()
export class PolyCloudops {
  private terraformBase(): Container {
    return dag
      .container()
      .from(TERRAFORM_IMAGE)
      .withDirectory("/src", dag.currentModule().source(), { exclude: ["node_modules/", ".git/", ".next/"] })
      .withWorkdir(WORKDIR);
  }

  private withAuth(container: Container, googleOauthAccessToken: Secret): Container {
    return container.withSecretVariable("GOOGLE_OAUTH_ACCESS_TOKEN", googleOauthAccessToken);
  }

  @func()
  async validate(googleOauthAccessToken: Secret): Promise<string> {
    const container = this.withAuth(this.terraformBase(), googleOauthAccessToken);

    const fmt = container
      .withExec(["terraform", "fmt", "-check", "-recursive", "-no-color"]);

    const init = fmt
      .withExec(["terraform", "init", "-no-color"]);

    const validate = init
      .withExec(["terraform", "validate", "-no-color"]);

    return await validate.stdout();
  }

  @func()
  async plan(
    googleOauthAccessToken: Secret,
    n8nAdminPassword: Secret,
    neonApiKey: Secret,
    neonOrgId: Secret
  ): Promise<string> {
    const container = this.withAuth(this.terraformBase(), googleOauthAccessToken)
      .withSecretVariable("TF_VAR_n8n_admin_password", n8nAdminPassword)
      .withSecretVariable("TF_VAR_neon_api_key", neonApiKey)
      .withSecretVariable("TF_VAR_neon_org_id", neonOrgId)
      .withExec(["terraform", "fmt", "-check", "-recursive", "-no-color"])
      .withExec(["terraform", "init", "-no-color"])
      .withExec(["terraform", "validate", "-no-color"])
      .withExec(["terraform", "plan", "-no-color", "-input=false"]);

    return await container.stdout();
  }
}
