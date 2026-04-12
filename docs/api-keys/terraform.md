# Terraform (Cloudflare DNS)

## Purpose

The example under `infra/terraform/` creates **DNS records** that mirror repo folder names (for example `web` and `api` as `web.example.com` and `api.example.com`). It does not deploy Workers or Pages by itself; those are separate steps (Wrangler, Pages, or CI).

## Credentials

Terraform uses the same **Cloudflare API token** and **zone ID** as in [cloudflare.md](./cloudflare.md):

| Variable | Source |
| --- | --- |
| `cloudflare_api_token` | API token with **Zone → DNS → Edit** (and **Zone → Read** as needed) |
| `cloudflare_zone_id` | Zone **Overview** → API section |

Set them in `terraform.tfvars` (gitignored); copy from `terraform.tfvars.example`.

## How to run

```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
```

## Ownership

- Whoever owns infrastructure and DNS should own the token and state backend (if you add S3/GCS backend later).

## Rotation

- Rotate the API token if exposed or on schedule; update `terraform.tfvars` and CI variables.
