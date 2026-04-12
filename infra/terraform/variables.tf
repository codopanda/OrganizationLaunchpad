variable "cloudflare_api_token" {
  description = "Cloudflare API token with DNS edit (and other scopes you enable for this stack)."
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID for the apex domain (Dashboard → domain → Overview → API)."
  type        = string
}

variable "subdomain_targets" {
  description = <<-EOT
    Map of short names (matching apps/<name> or workers/<name>) to DNS record targets.
    Example: web -> CNAME to your Pages hostname; api -> CNAME to your Worker workers.dev hostname.
  EOT
  type = map(object({
    type    = string
    content = string
    proxied = optional(bool)
  }))
}
