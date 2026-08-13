# Root Module: Development Environment

module "networking" {
  source = "../../modules/networking"

  environment = var.environment
  vpc_cidr    = "10.0.0.0/16"
  azs         = ["${var.aws_region}a", "${var.aws_region}b"]
  
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]
}

module "compute" {
  source = "../../modules/compute"

  environment     = var.environment
  vpc_id          = module.networking.vpc_id
  private_subnets = module.networking.private_subnets
}

module "iam" {
  source = "../../modules/iam"

  environment       = var.environment
  oidc_provider_arn = module.compute.oidc_provider_arn
  cluster_name      = module.compute.cluster_name
}

module "storage" {
  source = "../../modules/storage"

  environment  = var.environment
  repositories = ["healops-frontend", "healops-backend"]
}
