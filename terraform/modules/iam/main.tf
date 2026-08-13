# IAM Role for Service Accounts (IRSA) for the Backend Application
module "iam_eks_role" {
  source    = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version   = "~> 5.30"

  role_name = "healops-${var.environment}-backend-role"

  oidc_providers = {
    ex = {
      provider_arn               = var.oidc_provider_arn
      namespace_service_accounts = ["${var.namespace}:${var.service_account_name}"]
    }
  }

  tags = {
    Environment = var.environment
    Project     = "HealOps"
  }
}

# Custom policy allowing the backend to call Amazon Bedrock
resource "aws_iam_policy" "bedrock_access" {
  name        = "healops-${var.environment}-bedrock-access"
  description = "Allows the HealOps backend to invoke Bedrock models and agents"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "bedrock:InvokeModel",
          "bedrock:InvokeAgent"
        ]
        Effect   = "Allow"
        Resource = "*" # Restrict this to specific agent ARNs in production
      }
    ]
  })
}

# Custom policy for Trusted Advisor and Systems Manager (SSM)
resource "aws_iam_policy" "ops_access" {
  name        = "healops-${var.environment}-ops-access"
  description = "Allows the AI backend to read Trusted Advisor and execute SSM commands"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "support:DescribeTrustedAdvisorChecks",
          "support:DescribeTrustedAdvisorCheckResult",
          "ssm:SendCommand",
          "ssm:GetCommandInvocation"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

# Attach policies to the role
resource "aws_iam_role_policy_attachment" "attach_bedrock" {
  role       = module.iam_eks_role.iam_role_name
  policy_arn = aws_iam_policy.bedrock_access.arn
}

resource "aws_iam_role_policy_attachment" "attach_ops" {
  role       = module.iam_eks_role.iam_role_name
  policy_arn = aws_iam_policy.ops_access.arn
}
