terraform {
  required_version = ">= 1.5.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# Maps repo folder names (e.g. apps/web, workers/api) to DNS names like web.example.com, api.example.com
resource "cloudflare_record" "subdomain" {
  for_each = var.subdomain_targets

  zone_id = var.cloudflare_zone_id
  name    = each.key
  type    = each.value.type
  content = each.value.content
  proxied = lookup(each.value, "proxied", true)
}
