import { dag, object, func, Secret, Container } from "@dagger.io/dagger";

const TERRAFORM_IMAGE = "hashicorp/terraform:latest";
const WORKDIR = "/src/terraform";
const REGION = "europe-west1";
const PROJECT_ID = "polycloudops";
const REGISTRY = `${REGION}-docker.pkg.dev`;
const IMAGE_BASE = `${REGISTRY}/${PROJECT_ID}/n8n-repo/frontend`;

@object()
export class PolyCloudops {
  // ---- Terraform ----

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
    adminPassword: Secret,
    neonApiKey: Secret,
    neonOrgId: Secret,
    wifProviderName: Secret,
    wifServiceAccountEmail: Secret
  ): Promise<string> {
    const container = this.withAuth(this.terraformBase(), googleOauthAccessToken)
      .withSecretVariable("TF_VAR_n8n_admin_password", adminPassword)
      .withSecretVariable("TF_VAR_neon_api_key", neonApiKey)
      .withSecretVariable("TF_VAR_neon_org_id", neonOrgId)
      .withSecretVariable("TF_VAR_wif_provider_name", wifProviderName)
      .withSecretVariable("TF_VAR_wif_service_account_email", wifServiceAccountEmail)
      .withExec(["terraform", "fmt", "-check", "-recursive", "-no-color"])
      .withExec(["terraform", "init", "-no-color"])
      .withExec(["terraform", "validate", "-no-color"])
      .withExec(["terraform", "plan", "-no-color", "-input=false"]);

    return await container.stdout();
  }

  // ---- Frontend ----

  @func()
  buildFrontend(): Container {
    return dag.container().build(
      dag.currentModule().source().directory("frontend")
    );
  }

  @func()
  async publishFrontend(
    googleOauthAccessToken: Secret,
    commitSha: string,
  ): Promise<string> {
    return await this.buildFrontend()
      .withRegistryAuth(REGISTRY, "oauth2accesstoken", googleOauthAccessToken)
      .publish(`${IMAGE_BASE}:${commitSha}`);
  }

  @func()
  async deployFrontend(
    googleOauthAccessToken: Secret,
    commitSha: string,
    translateWebhookUrl: Secret,
    qrWebhookUrl: Secret,
    jsonExcelWebhookUrl: Secret,
    summarizeWebhookUrl: Secret,
    weatherWebhookUrl: Secret,
    currencyWebhookUrl: Secret,
  ): Promise<string> {
    const imageRef = `${IMAGE_BASE}:${commitSha}`;

    const built = this.buildFrontend()
      .withRegistryAuth(REGISTRY, "oauth2accesstoken", googleOauthAccessToken);

    await built.publish(imageRef);
    await built.publish(`${IMAGE_BASE}:latest`);

    return await dag.container()
      .from("google/cloud-sdk:alpine")
      .withSecretVariable("CLOUDSDK_AUTH_ACCESS_TOKEN", googleOauthAccessToken)
      .withSecretVariable("N8N_TRANSLATE_WEBHOOK_URL", translateWebhookUrl)
      .withSecretVariable("N8N_QR_WEBHOOK_URL", qrWebhookUrl)
      .withSecretVariable("N8N_JSON_EXCEL_WEBHOOK_URL", jsonExcelWebhookUrl)
      .withSecretVariable("N8N_SUMMARIZE_WEBHOOK_URL", summarizeWebhookUrl)
      .withSecretVariable("N8N_WEATHER_WEBHOOK_URL", weatherWebhookUrl)
      .withSecretVariable("N8N_CURRENCY_WEBHOOK_URL", currencyWebhookUrl)
      .withExec(["bash", "-c",
        `set -e
         gcloud run deploy frontend-service \
           --project ${PROJECT_ID} \
           --region ${REGION} \
           --platform managed \
           --allow-unauthenticated \
           --image ${imageRef} \
           --port 3000 \
           --set-env-vars "N8N_TRANSLATE_WEBHOOK_URL=$N8N_TRANSLATE_WEBHOOK_URL,N8N_QR_WEBHOOK_URL=$N8N_QR_WEBHOOK_URL,N8N_JSON_EXCEL_WEBHOOK_URL=$N8N_JSON_EXCEL_WEBHOOK_URL,N8N_SUMMARIZE_WEBHOOK_URL=$N8N_SUMMARIZE_WEBHOOK_URL,N8N_WEATHER_WEBHOOK_URL=$N8N_WEATHER_WEBHOOK_URL,N8N_CURRENCY_WEBHOOK_URL=$N8N_CURRENCY_WEBHOOK_URL"
         gcloud run services describe frontend-service \
           --project ${PROJECT_ID} \
           --region ${REGION} \
           --format='value(status.url)'`
      ])
      .stdout();
  }
}
