# Terraform

Terraform in this directory should define the platform topology for OrganizationLaunchpad.

## What is checked in

- `main.tf`, `variables.tf`, `outputs.tf` — create `cloudflare_record` resources from a map of subdomain names to DNS targets.
- `terraform.tfvars.example` — copy to `terraform.tfvars` (gitignored) and fill in token + zone id.

Primary expectation:

- folder names map to subdomains

Examples:

- app folders under `apps/` become app subdomains
- worker folders under `workers/` become API subdomains

This keeps infrastructure naming aligned with the repository structure.

Recommended responsibilities:

- DNS and subdomain records
- Cloudflare configuration
- environment variable wiring
- deployment resources needed by apps and workers

Run:

```bash
terraform init
terraform plan
terraform apply
```

Credential onboarding: `docs/api-keys/terraform.md` and `docs/api-keys/cloudflare.md`.
