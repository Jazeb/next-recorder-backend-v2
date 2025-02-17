enum Enviornments {
  LOCAL = 'local',
  DEV = 'dev',
  PROD = 'prod',
  STAGING = 'staging',
}

enum Collections {
  users = 'users',
  folders = 'folders',
  files = 'files',
  plans = 'plans',
  comments = 'comments',
  payments = 'payments',
}

enum PlanTypes {
  FREE = 'free',
  STANDARD = 'standard',
  PROFESSIONAL = 'professional',
  PREMIUM = 'premium',
}

enum FileTypes {
  IMAGE = 'image',
  VIDEO = 'video',
}

export { Enviornments, Collections, PlanTypes, FileTypes };
