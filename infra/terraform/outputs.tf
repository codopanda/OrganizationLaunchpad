output "record_ids" {
  description = "Created DNS record IDs (for debugging or follow-up automation)."
  value       = { for k, r in cloudflare_record.subdomain : k => r.id }
}
