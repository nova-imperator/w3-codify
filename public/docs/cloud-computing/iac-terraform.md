# Infrastructure as Code (Terraform)

**Cloud Computing** · Advanced tier · downloadable study notes

---

Click-ops doesn't scale and isn't reproducible. Infrastructure as Code declares your infrastructure in version-controlled files.

Terraform is the cloud-agnostic standard:
• Providers talk to AWS/Azure/GCP.
• State records what exists so Terraform can compute a diff.
• Modules package reusable infrastructure; workspaces separate environments.
• plan shows the change, apply makes it.

Aim for immutable infrastructure — replace, don't mutate — and watch for drift (manual changes that diverge from code). CloudFormation is the AWS-native alternative.

## Code

```hcl
resource "aws_instance" "web" {
  ami           = "ami-0abcd1234"
  instance_type = "t3.micro"
  tags = { Name = "w3codify-web" }
}

# terraform plan  -> preview
# terraform apply -> create/update
```

## Study image

Declare → plan → apply; state tracks reality

## Checkpoint recap

1. **What is Terraform 'state' for?**
   - Answer: Recording what infrastructure exists so Terraform can diff and update it
   - Why: State maps your config to real resources, enabling Terraform to compute and apply changes safely.

2. **'Drift' in IaC means…**
   - Answer: Manual changes that diverge from the declared config
   - Why: Drift is reality diverging from code, usually from out-of-band manual edits.

---

© W3Codify — free during launch. Generated study notes.
