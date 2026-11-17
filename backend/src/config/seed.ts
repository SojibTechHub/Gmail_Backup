import { User, ProviderConfig } from '../models';
import { UserRole } from '../types';
import config from './index';
import { defaultProviders } from './providers';
import { logger } from '../utils';

export const seedDatabase = async (): Promise<void> => {
  try {
    // 1. Seed Default Admin
    const adminExists = await User.findOne({ email: config.admin.email.toLowerCase() });
    if (!adminExists) {
      await User.create({
        email: config.admin.email.toLowerCase(),
        name: 'System Administrator',
        passwordHash: config.admin.password, // Pre-save hook hashes with argon2id
        role: UserRole.ADMIN,
        isEmailVerified: true,
        isMfaEnabled: false,
      });
      logger.info(`Default admin account seeded successfully: ${config.admin.email}`);
    }

    // 2. Seed Provider Configurations
    for (const providerData of defaultProviders) {
      await ProviderConfig.findOneAndUpdate(
        { provider: providerData.provider },
        {
          provider: providerData.provider,
          name: providerData.name,
          logo: providerData.logo,
          domains: providerData.domains,
          recoveryUrl: providerData.recoveryUrl,
          supportedMethods: providerData.supportedMethods,
          hasOAuth: providerData.hasOAuth,
          documentationUrl: providerData.documentationUrl,
          instructions: providerData.instructions,
          isActive: providerData.isActive,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    logger.info('Provider recovery configurations seeded successfully.');
  } catch (error) {
    logger.error('Failed to seed database:', error);
  }
};
