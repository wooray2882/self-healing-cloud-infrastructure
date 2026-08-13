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

# GitHub OIDC Provider (Allows GitHub Actions to authenticate)
data "aws_iam_openid_connect_provider" "github" {
  arn = "arn:aws:iam::000622214837:oidc-provider/token.actions.githubusercontent.com"
}

# GitHub Actions Role (Allowed to push to ECR and deploy to EKS)
resource "aws_iam_role" "github_actions" {
  name = "healops-${var.environment}-github-actions-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = data.aws_iam_openid_connect_provider.github.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            "token.actions.githubusercontent.com:sub" = "repo:wooray2882*/self-healing-cloud-infrastructure*:*"
          }
        }
      }
    ]
  })

  tags = {
    Environment = var.environment
    Project     = "HealOps"
  }
}

resource "aws_iam_role_policy_attachment" "github_actions_ecr" {
  role       = aws_iam_role.github_actions.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser"
}

resource "aws_iam_role_policy_attachment" "github_actions_eks" {
  role       = aws_iam_role.github_actions.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

