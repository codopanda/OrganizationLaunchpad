# Terraform

Terraform in this directory should define the platform topology for Scaifold.

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

