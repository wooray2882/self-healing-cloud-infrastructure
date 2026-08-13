module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "healops-${var.environment}-cluster"
  cluster_version = "1.30"

  vpc_id                   = var.vpc_id
  subnet_ids               = var.private_subnets
  control_plane_subnet_ids = var.private_subnets

  # Enable OIDC for IAM Roles for Service Accounts (IRSA) - crucial for AI Bedrock access later
  enable_irsa = true

  # Cluster endpoint access
  cluster_endpoint_public_access = true

  # Default node group configurations
  eks_managed_node_group_defaults = {
    ami_type       = "AL2_x86_64"
    disk_size      = 20
    instance_types = ["t3.medium"]
  }

  eks_managed_node_groups = {
    # Cost Optimization: Use Spot instances
    spot_nodes = {
      name            = "spot-worker-nodes"
      use_name_prefix = true
      
      min_size     = 1
      max_size     = 4
      desired_size = 2

      capacity_type  = "SPOT"
      instance_types = ["t3.medium", "t3.large"]

      tags = {
        "k8s.io/cluster-autoscaler/enabled"             = "true"
        "k8s.io/cluster-autoscaler/healops-${var.environment}-cluster" = "owned"
      }
    }
  }

  tags = {
    Environment = var.environment
    Project     = "HealOps"
  }
}
